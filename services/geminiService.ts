
import { GoogleGenAI, Type, GenerateContentResponse } from "@google/genai";
import { AdminItem, Category, Insight } from "../types";

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

const EXTRACTION_SCHEMA = {
  type: Type.OBJECT,
  properties: {
    title: { type: Type.STRING },
    provider: { type: Type.STRING },
    category: { type: Type.STRING, description: "Choisir parmi: Finance, Santé, Logement, Abonnements, Impôts, Véhicule" },
    dueDate: { type: Type.STRING, description: "Format YYYY-MM-DD" },
    amount: { type: Type.NUMBER },
    renewalDate: { type: Type.STRING, description: "Format YYYY-MM-DD si applicable" }
  },
  required: ["title", "provider", "category", "dueDate"]
};

export const analyzeDocumentText = async (text: string): Promise<Partial<AdminItem>> => {
  const response = await ai.models.generateContent({
    model: 'gemini-3-flash-preview',
    contents: `Analyse ce texte de document administratif et extrais les informations clés : ${text}`,
    config: {
      responseMimeType: "application/json",
      responseSchema: EXTRACTION_SCHEMA
    }
  });

  try {
    return JSON.parse(response.text || '{}');
  } catch (e) {
    console.error("Failed to parse Gemini response", e);
    return {};
  }
};

export const analyzeDocumentImage = async (base64Data: string, mimeType: string): Promise<Partial<AdminItem>> => {
  const imagePart = {
    inlineData: {
      data: base64Data,
      mimeType: mimeType,
    },
  };
  const textPart = {
    text: "Analyse ce document administratif (facture, contrat, avis d'imposition) et extrais les informations structurées demandées."
  };

  const response = await ai.models.generateContent({
    model: 'gemini-3-flash-preview',
    contents: { parts: [imagePart, textPart] },
    config: {
      responseMimeType: "application/json",
      responseSchema: EXTRACTION_SCHEMA
    }
  });

  try {
    return JSON.parse(response.text || '{}');
  } catch (e) {
    console.error("Failed to parse Gemini response", e);
    return {};
  }
};

export const getMentalLoadAdvisor = async (items: AdminItem[]): Promise<string> => {
  if (items.length === 0) return "Votre inventaire est vide. Commencez par ajouter un document pour réduire votre charge mentale.";
  const context = JSON.stringify(items.map(i => ({ t: i.title, p: i.provider, d: i.dueDate, s: i.status })));
  const response = await ai.models.generateContent({
    model: 'gemini-3-flash-preview',
    contents: `En tant qu'assistant de gestion "Life Admin", analyse cette liste d'obligations administratives et donne un conseil court (2 phrases max) pour réduire la charge mentale de l'utilisateur : ${context}`,
  });
  return response.text || "Tout semble sous contrôle. Respirez !";
};

export const getOptimizationInsights = async (items: AdminItem[]): Promise<Insight[]> => {
  if (items.length === 0) return [];

  // Use Google Search to find current market deals
  const prompt = `Basé sur ces abonnements : ${JSON.stringify(items)}, trouve les 3 meilleures offres de marché actuelles en France pour faire des économies (Mobile, Internet, Energie, Streaming).
  Compare les prix actuels des fournisseurs (Orange, SFR, Free, Bouygues, Netflix, EDF, etc.).
  Réponds UNIQUEMENT sous forme d'un tableau JSON avec les champs: id, type (toujours 'deal'), title, description (avec prix estimé), actionLabel, savings (estimation euros/mois).`;

  const response = await ai.models.generateContent({
    model: 'gemini-3-flash-preview',
    contents: prompt,
    config: {
      tools: [{ googleSearch: {} }]
    },
  });

  const groundingChunks = response.candidates?.[0]?.groundingMetadata?.groundingChunks || [];
  const urls = groundingChunks
    .map((chunk: any) => chunk.web?.uri)
    .filter((uri: string | undefined) => !!uri);

  try {
    // Attempt to extract JSON from text even if grounding is present
    const text = response.text || "[]";
    const jsonMatch = text.match(/\[.*\]/s);
    const insights: Insight[] = jsonMatch ? JSON.parse(jsonMatch[0]) : [];
    
    // Assign found URLs to insights
    return insights.map((insight, index) => ({
      ...insight,
      url: urls[index] || urls[0] || "https://www.google.com/search?q=meilleures+offres+abonnements+france"
    }));
  } catch (e) {
    console.error("Failed to parse market deals", e);
    return [];
  }
};
