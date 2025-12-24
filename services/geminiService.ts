
import { GoogleGenAI, Type } from "@google/genai";
import { Contribution } from "../types";

const API_KEY = process.env.API_KEY || "";

export const parseContributionList = async (
  textData: string, 
  binaryData?: { data: string, mimeType: string }
): Promise<Contribution[]> => {
  const ai = new GoogleGenAI({ apiKey: API_KEY });
  
  const prompt = `You are an expert financial auditor for the NYSC Katsina State Staff Multi-Purpose Cooperative Society Limited.
  Extract contribution records from the provided source.
  
  Format Rules:
  1. Member Name: Extract the full name accurately.
  2. File Number: If not present, generate a unique placeholder like "KT-STAFF-[NameInitials]-[Random]".
  3. Amount: Extract the numeric value (Naira). Remove any commas or currency symbols.
  4. Date: Use the transaction date if found; otherwise use today: ${new Date().toISOString().split('T')[0]}.
  5. Category: Classify as "Monthly Contribution", "Direct Credit", or "Credited from Camp".
  6. Previous Payment: If the document shows an "Opening Balance" or "Previous Balance" column, extract it into the 'previousPayment' field.

  Return a JSON array of objects.`;

  const contents: any[] = [{ text: prompt }];
  
  if (textData) {
    contents.push({ text: `DATA SOURCE (Text/CSV Content):\n${textData}` });
  }
  
  if (binaryData) {
    const supportedMimes = ['application/pdf', 'image/jpeg', 'image/png', 'image/webp'];
    if (supportedMimes.includes(binaryData.mimeType)) {
      contents.push({
        inlineData: {
          mimeType: binaryData.mimeType,
          data: binaryData.data.split(',')[1]
        }
      });
    } else {
      contents.push({ text: `Note: The user uploaded a ${binaryData.mimeType} file. I have extracted the text content for you above.` });
    }
  }

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: { parts: contents },
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.ARRAY,
          items: {
            type: Type.OBJECT,
            properties: {
              memberName: { type: Type.STRING },
              fileNumber: { type: Type.STRING },
              amount: { type: Type.NUMBER },
              previousPayment: { type: Type.NUMBER },
              date: { type: Type.STRING },
              category: { type: Type.STRING },
              notes: { type: Type.STRING }
            },
            required: ["memberName", "fileNumber", "amount", "date", "category"]
          }
        }
      }
    });

    const parsed = JSON.parse(response.text);
    return parsed.map((item: any) => ({
      ...item,
      id: Math.random().toString(36).substr(2, 9),
      category: item.category || "Monthly Contribution",
      previousPayment: item.previousPayment || 0
    }));
  } catch (error) {
    console.error("Gemini Document Processing Error:", error);
    throw error;
  }
};

export const getCoopInsights = async (contributions: Contribution[], query: string): Promise<string> => {
  const ai = new GoogleGenAI({ apiKey: API_KEY });
  
  const context = `You are the AI Finance Assistant for NYSC Katsina State Staff Multi-Purpose Cooperative Society Limited.
  Current Data context (last 20 entries): ${JSON.stringify(contributions.slice(-20))}.
  The society is officially registered as NYSC KATSINA STATE STAFF MULTI-PURPOSE COOPERATIVE SOCIETY LIMITED.
  It helps staff members save and invest. 
  Answer the following user query based on this context and general financial best practices.`;

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: context + "\n\nUser Query: " + query,
    });
    return response.text || "I couldn't generate a response at this time.";
  } catch (error) {
    return "Error connecting to AI Assistant.";
  }
};
