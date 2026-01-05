
import { GoogleGenAI } from "@google/genai";

// Create a new GoogleGenAI instance right before making an API call to ensure it uses the latest API key.
const getAI = () => new GoogleGenAI({ apiKey: process.env.API_KEY as string });

export const editCarImage = async (base64Image: string, prompt: string): Promise<string | null> => {
  const ai = getAI();
  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash-image',
      contents: {
        parts: [
          { inlineData: { data: base64Image.split(',')[1], mimeType: 'image/png' } },
          { text: prompt }
        ],
      },
    });

    for (const part of response.candidates?.[0]?.content?.parts || []) {
      // Find the image part as per guidelines.
      if (part.inlineData) {
        return `data:image/png;base64,${part.inlineData.data}`;
      }
    }
    return null;
  } catch (error) {
    console.error("Image editing error:", error);
    return null;
  }
};

export const chatWithAssistant = async (message: string): Promise<string> => {
  const ai = getAI();
  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3-pro-preview',
      contents: message,
      config: {
        systemInstruction: "You are Sumsar Assistant, a car trading expert in Sudan. Help users with car prices, maintenance, and app usage. Always emphasize that Sumsar is the only intermediary and commission is 1%."
      }
    });
    // Directly access .text property as per guidelines.
    return response.text || "Sorry, I couldn't process that.";
  } catch (error) {
    return "The assistant is currently unavailable.";
  }
};

export const searchCarNews = async (query: string) => {
  const ai = getAI();
  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: query,
      config: {
        tools: [{ googleSearch: {} }],
      },
    });
    return {
      text: response.text,
      // Extract grounding chunks for search grounding.
      sources: response.candidates?.[0]?.groundingMetadata?.groundingChunks || []
    };
  } catch (error) {
    return { text: "Search failed.", sources: [] };
  }
};

export const getNearbyServices = async (lat: number, lng: number) => {
  const ai = getAI();
  try {
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: "Find reliable car mechanics, insurance offices, and traffic departments near my location in Sudan.",
      config: {
        tools: [{ googleMaps: {} }],
        toolConfig: {
          retrievalConfig: {
            latLng: { latitude: lat, longitude: lng }
          }
        }
      },
    });
    return {
      text: response.text,
      // Extract grounding chunks for maps grounding.
      links: response.candidates?.[0]?.groundingMetadata?.groundingChunks || []
    };
  } catch (error) {
    return { text: "Map services unavailable.", links: [] };
  }
};
