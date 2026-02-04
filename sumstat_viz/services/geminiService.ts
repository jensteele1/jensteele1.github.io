
import { GoogleGenAI, Type } from "@google/genai";
import { PaperAnalysis } from "../types";

export class GeminiService {
  private ai: GoogleGenAI;

  constructor() {
    this.ai = new GoogleGenAI({ apiKey: process.env.API_KEY || '' });
  }

  async analyzePaper(pdfBase64: string): Promise<PaperAnalysis> {
    const response = await this.ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: [
        {
          parts: [
            {
              inlineData: {
                mimeType: 'application/pdf',
                data: pdfBase64
              }
            },
            {
              text: `Analyze this research paper called SumStat. Extract the key details and performance metrics.
              Focus on how SumStat extracts summary statistics from tables.
              Provide the output in JSON format according to the following schema.`
            }
          ]
        }
      ],
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            title: { type: Type.STRING },
            abstract: { type: Type.STRING },
            keyFindings: { type: Type.ARRAY, items: { type: Type.STRING } },
            methodology: {
              type: Type.OBJECT,
              properties: {
                steps: { type: Type.ARRAY, items: { type: Type.STRING } },
                modelsUsed: { type: Type.ARRAY, items: { type: Type.STRING } }
              },
              required: ["steps", "modelsUsed"]
            },
            statistics: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  label: { type: Type.STRING },
                  value: { type: Type.NUMBER },
                  unit: { type: Type.STRING }
                },
                required: ["label", "value", "unit"]
              }
            },
            performanceData: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  metric: { type: Type.STRING },
                  score: { type: Type.NUMBER }
                },
                required: ["metric", "score"]
              }
            }
          },
          required: ["title", "abstract", "keyFindings", "methodology", "statistics", "performanceData"]
        }
      }
    });

    try {
      return JSON.parse(response.text || '{}') as PaperAnalysis;
    } catch (e) {
      console.error("Failed to parse Gemini response", e);
      throw new Error("Invalid response format from AI");
    }
  }

  async chatWithPaper(pdfBase64: string, question: string): Promise<string> {
    const response = await this.ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: [
        {
          parts: [
            {
              inlineData: {
                mimeType: 'application/pdf',
                data: pdfBase64
              }
            },
            {
              text: question
            }
          ]
        }
      ]
    });
    return response.text || "I couldn't generate an answer.";
  }
}

export const gemini = new GeminiService();
