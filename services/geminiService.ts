import { GoogleGenAI, Type } from "@google/genai";
import { Contribution } from "../types";

export const parseContributionList = async (
  textData: string,
  binaryData?: { data: string; mimeType: string }
): Promise<Contribution[]> => {
  const apiKey = process.env.API_KEY;
  if (!apiKey) {
    throw new Error("Gemini API Key is missing. Please check your environment configuration.");
  }

  const ai = new GoogleGenAI({ apiKey });

  const prompt = `You are a professional ledger auditor for the NYSC Katsina State Staff Multi-Purpose Cooperative Society Limited.

TASK:
Analyze the provided document (text, CSV, Image, or PDF) and extract all member contribution records.

EXTRACTION RULES:
1. Member Name: Use the full name exactly as written.
2. File Number: Extract the staff file number. Format: 'KT/STF/xxx'.
3. Amount: Numeric contribution in Naira (NGN).
4. Date: Transaction date (YYYY-MM-DD). If missing use: ${new Date()
    .toISOString()
    .split("T")[0]}.
5. Category: "Monthly Contribution", "Direct Credit", or "Credited from Camp".
6. Opening Balance: Extract "Previous Balance" as 'previousPayment'.

Output must be a JSON array of objects.`;

  const parts: any[] = [{ text: prompt }];

  if (textData) {
    parts.push({ text: `DATA SOURCE:\n${textData}` });
  }

  if (binaryData) {
    const base64Data = binaryData.data.includes(",")
      ? binaryData.data.split(",")[1]
      : binaryData.data;

    parts.push({
      inlineData: {
        mimeType: binaryData.mimeType,
        data: base64Data,
      },
    });
  }

  try {
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
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
              notes: { type: Type.STRING },
            },
            required: [
              "memberName",
              "fileNumber",
              "amount",
              "date",
              "category",
            ],
          },
        },
      },
    });

    const text = response.text || "[]";
    const parsed = JSON.parse(text);

    return parsed.map((item: any) => ({
      ...item,
      id: Math.random().toString(36).slice(2),
      category: item.category || "Monthly Contribution",
      previousPayment: item.previousPayment || 0,
    }));
  } catch (error: any) {
    console.error("Gemini Parsing Error:", error);
    throw error;
  }
};

export const getCoopInsights = async (
  contributions: Contribution[],
  query: string
): Promise<string> => {
  const apiKey = process.env.API_KEY;
  if (!apiKey) return "API configuration missing.";

  const ai = new GoogleGenAI({ apiKey });

  try {
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: query,
      config: {
        systemInstruction: `You are the Executive Information Assistant for NYSC Katsina Cooperative Society. Records: ${contributions.length}. Help admins with financial summaries.`,
      },
    });

    return response.text || "No insights found.";
  } catch (error) {
    console.error("Insights Error:", error);
    return "Error generating insights.";
  }
};