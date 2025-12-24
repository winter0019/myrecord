
import { GoogleGenAI, Type } from "@google/genai";
import { Contribution } from "../types";

export const parseContributionList = async (
  textData: string, 
  binaryData?: { data: string, mimeType: string }
): Promise<Contribution[]> => {
  // Use gemini-3-flash-preview for extraction as it is highly efficient and reliable for structured output
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  
  const prompt = `You are a professional ledger auditor for the NYSC Katsina State Staff Multi-Purpose Cooperative Society Limited.
  
  TASK:
  Analyze the provided document (text, CSV, Image, or PDF) and extract all member contribution records.
  
  EXTRACTION RULES:
  1. Member Name: Use the full name exactly as written.
  2. File Number: Extract the staff file number. If you find multiple numbers, look for the one in the format like 'KT/STF/xxx' or similar.
  3. Amount: Extract the numeric contribution amount in Naira (NGN). Ignore symbols.
  4. Date: Extract the specific transaction date if present. If not, use the current batch date: ${new Date().toISOString().split('T')[0]}.
  5. Category: Classify as "Monthly Contribution", "Direct Credit", or "Credited from Camp".
  6. Opening Balance: If a "Previous Balance" or "Brought Forward" column exists, extract it as 'previousPayment'.

  Output must be a JSON array of objects.`;

  const parts: any[] = [{ text: prompt }];
  
  if (textData) {
    parts.push({ text: `DATA SOURCE (RAW TEXT/CSV):\n${textData}` });
  }
  
  if (binaryData) {
    // Robust base64 extraction from DataURL
    const base64Data = binaryData.data.includes(',') 
      ? binaryData.data.split(',')[1] 
      : binaryData.data;

    parts.push({
      inlineData: {
        mimeType: binaryData.mimeType,
        data: base64Data
      }
    });
  }

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: [{ parts }],
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

    const text = response.text || "[]";
    const parsed = JSON.parse(text);
    
    return parsed.map((item: any) => ({
      ...item,
      id: Math.random().toString(36).substr(2, 9),
      category: item.category || "Monthly Contribution",
      previousPayment: item.previousPayment || 0
    }));
  } catch (error: any) {
    console.error("Gemini Parsing Error:", error);
    // Throw a user-friendly error message
    if (error.status === 403 || error.message?.includes("API_KEY")) {
      throw new Error("API Authentication Error. Please check the system configuration.");
    }
    throw new Error(error.message || "Failed to parse the document. Please ensure the file is readable.");
  }
};

export const getCoopInsights = async (contributions: Contribution[], query: string): Promise<string> => {
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  
  const systemInstruction = `You are the Executive Information Assistant for NYSC Katsina State Staff Multi-Purpose Cooperative Society Limited.
  Total Records Available: ${contributions.length}.
  Recent Activity: ${JSON.stringify(contributions.slice(-5))}.
  
  Provide helpful, concise answers about member balances and society health.`;

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: query,
      config: { systemInstruction }
    });
    return response.text || "No insights found.";
  } catch (error) {
    console.error("Insights Error:", error);
    return "The system is temporarily unable to provide insights. Please try again shortly.";
  }
};
