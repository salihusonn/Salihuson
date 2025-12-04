import { GoogleGenAI, Type, Modality } from "@google/genai";
import { ImageSize, Story } from "../types";

// Helper to get a fresh client instance. 
// Important for key switching scenarios if needed, but primarily ensures we use the current environment key.
const getClient = () => {
  const apiKey = process.env.API_KEY;
  if (!apiKey) {
    throw new Error("API Key not found in environment");
  }
  return new GoogleGenAI({ apiKey });
};

/**
 * Generates a story structure (Title + Pages) based on a topic.
 * Uses gemini-3-pro-preview for complex reasoning and structure.
 */
export const generateStoryContent = async (topic: string): Promise<Story> => {
  const ai = getClient();
  
  const prompt = `Write a short, engaging children's story about: "${topic}".
  The story should be suitable for young children (ages 4-8).
  It should have exactly 3 pages (short paragraphs).
  For each page, provide the text of the story and a detailed visual description (image prompt) for an illustration that matches the text.
  
  Return the result as a JSON object with this structure:
  {
    "title": "The Title of the Story",
    "pages": [
      {
        "text": "Story text for page 1...",
        "imagePrompt": "A detailed description of the illustration..."
      },
      ...
    ]
  }`;

  const response = await ai.models.generateContent({
    model: 'gemini-3-pro-preview',
    contents: prompt,
    config: {
      responseMimeType: 'application/json',
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          title: { type: Type.STRING },
          pages: {
            type: Type.ARRAY,
            items: {
              type: Type.OBJECT,
              properties: {
                text: { type: Type.STRING },
                imagePrompt: { type: Type.STRING }
              },
              required: ['text', 'imagePrompt']
            }
          }
        },
        required: ['title', 'pages']
      }
    }
  });

  const text = response.text;
  if (!text) throw new Error("No text returned from model");
  return JSON.parse(text) as Story;
};

/**
 * Generates an illustration for a specific page.
 * Uses gemini-3-pro-image-preview.
 */
export const generateIllustration = async (prompt: string, size: ImageSize): Promise<string> => {
  const ai = getClient();
  
  // Enhance prompt for style
  const enhancedPrompt = `A colorful, charming children's book illustration, vibrant colors, friendly style. Scene: ${prompt}`;

  const response = await ai.models.generateContent({
    model: 'gemini-3-pro-image-preview',
    contents: {
      parts: [{ text: enhancedPrompt }]
    },
    config: {
      imageConfig: {
        imageSize: size,
        aspectRatio: "1:1"
      }
    }
  });

  // Iterate to find the image part
  if (response.candidates && response.candidates[0].content && response.candidates[0].content.parts) {
    for (const part of response.candidates[0].content.parts) {
      if (part.inlineData && part.inlineData.data) {
        return `data:image/png;base64,${part.inlineData.data}`;
      }
    }
  }

  throw new Error("No image generated");
};

/**
 * Generates speech from text.
 * Uses gemini-2.5-flash-preview-tts.
 */
export const generateSpeech = async (text: string): Promise<ArrayBuffer> => {
  const ai = getClient();

  const response = await ai.models.generateContent({
    model: 'gemini-2.5-flash-preview-tts',
    contents: {
      parts: [{ text }]
    },
    config: {
      responseModalities: [Modality.AUDIO],
      speechConfig: {
        voiceConfig: {
          prebuiltVoiceConfig: { voiceName: 'Kore' } // 'Kore' is usually good for storytelling
        }
      }
    }
  });

  const base64Audio = response.candidates?.[0]?.content?.parts?.[0]?.inlineData?.data;
  if (!base64Audio) {
    throw new Error("No audio generated");
  }

  // Decode base64 to ArrayBuffer
  const binaryString = atob(base64Audio);
  const len = binaryString.length;
  const bytes = new Uint8Array(len);
  for (let i = 0; i < len; i++) {
    bytes[i] = binaryString.charCodeAt(i);
  }
  return bytes.buffer;
};

/**
 * Chat with the assistant.
 * Uses gemini-3-pro-preview.
 */
export const chatWithGemini = async (message: string, history: { role: 'user' | 'model', parts: { text: string }[] }[]): Promise<string> => {
  const ai = getClient();
  const chat = ai.chats.create({
    model: 'gemini-3-pro-preview',
    history: history,
    config: {
      systemInstruction: "You are a friendly, enthusiastic, and helpful AI assistant for children. Keep answers simple, safe, and encouraging.",
    }
  });

  const result = await chat.sendMessage({ message });
  return result.text || "I couldn't think of a response!";
};
