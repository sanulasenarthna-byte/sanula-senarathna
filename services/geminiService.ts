import { GoogleGenAI, Type, Chat } from "@google/genai";
import { Platform, ContentType, GeneratedContent, TrendResult } from '../types';

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

const modelFlash = 'gemini-2.5-flash';
const modelFlashLite = 'gemini-flash-lite-latest';
const modelThinking = 'gemini-3-pro-preview';
const modelImage = 'gemini-2.5-flash-image';
const modelVideoGen = 'veo-3.1-fast-generate-preview';
const modelVideoAnalyze = 'gemini-3-pro-preview';

const handleError = (error: any, context: string) => {
  console.error(`${context} error:`, error);
  let message = "An unexpected error occurred.";
  
  if (error instanceof Error) {
    message = error.message;
  } else if (typeof error === 'string') {
    message = error;
  }

  // User-friendly mapping
  if (message.includes("429")) message = "You are sending requests too quickly. Please wait a moment.";
  if (message.includes("500")) message = "Gemini service is temporarily unavailable. Please try again later.";
  if (message.includes("503")) message = "The service is currently overloaded. Please try again shortly.";
  if (message.includes("API key")) message = "There is an issue with the API key configuration.";
  
  throw new Error(message);
};

export const generateSocialContent = async (
  platform: Platform,
  type: ContentType,
  topic: string,
  tone: string
): Promise<GeneratedContent> => {
  const prompt = `
    Act as a professional social media manager.
    Create a ${type} for ${platform} about "${topic}".
    Tone: ${tone}.
    
    Return the response in JSON format with the following schema:
    {
      "title": "Catchy headline or video title",
      "body": "The main content text or script. If it's a script, include scene directions.",
      "hashtags": ["tag1", "tag2"],
      "imagePrompt": "A detailed prompt to generate a thumbnail or image for this post"
    }
  `;

  try {
    const response = await ai.models.generateContent({
      model: modelFlash,
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            title: { type: Type.STRING },
            body: { type: Type.STRING },
            hashtags: { type: Type.ARRAY, items: { type: Type.STRING } },
            imagePrompt: { type: Type.STRING }
          }
        }
      }
    });

    if (response.text) {
      return JSON.parse(response.text) as GeneratedContent;
    }
    throw new Error("No content generated");
  } catch (error) {
    handleError(error, "Content Generation");
    throw error;
  }
};

export const analyzeTrends = async (topic: string): Promise<TrendResult> => {
  try {
    const response = await ai.models.generateContent({
      model: modelFlash,
      contents: `What are the latest trending sub-topics, news, or viral discussions related to "${topic}" right now? Provide a summary of the current landscape.`,
      config: {
        tools: [{ googleSearch: {} }]
      }
    });

    const text = response.text || "No trend data available.";
    
    // Extract grounding chunks for sources
    const sources = response.candidates?.[0]?.groundingMetadata?.groundingChunks
      ?.map((chunk: any) => {
        if (chunk.web) {
          return { title: chunk.web.title, url: chunk.web.uri };
        }
        return null;
      })
      .filter((s: any) => s !== null) || [];

    // Deduplicate sources
    const uniqueSources = Array.from(new Map(sources.map((item: any) => [item['url'], item])).values());

    return {
      query: topic,
      summary: text,
      sources: uniqueSources as { title: string; url: string }[]
    };
  } catch (error) {
    console.warn("Trend analysis warning:", error);
    // Graceful degradation
    return {
      query: topic,
      summary: "Unable to fetch live trends at this moment. Please check your connection or try a different topic.",
      sources: []
    };
  }
};

export const generateReplySuggestion = async (comment: string, platform: Platform): Promise<string> => {
  try {
    const response = await ai.models.generateContent({
      model: modelFlashLite,
      contents: `Generate a polite, engaging, and professional reply to this ${platform} comment: "${comment}". Keep it under 280 characters.`,
    });
    return response.text || "Thanks for your comment!";
  } catch (error) {
    handleError(error, "Reply Generation");
    return "Thank you for watching!";
  }
};

// Feature: Chat with Thinking Mode
export const createChatSession = (thinkingMode: boolean = false) => {
  const config = thinkingMode 
    ? { thinkingConfig: { thinkingBudget: 32768 } } 
    : { systemInstruction: "You are a helpful AI assistant for social media management." };

  return ai.chats.create({
    model: modelThinking,
    config: config
  });
};

// Feature: Image Editing
export const editImage = async (imageBase64: string, prompt: string): Promise<string> => {
  try {
    // mimeType stripping if present in base64 string
    const base64Data = imageBase64.replace(/^data:image\/\w+;base64,/, "");
    
    const response = await ai.models.generateContent({
      model: modelImage,
      contents: {
        parts: [
          {
            inlineData: {
              data: base64Data,
              mimeType: 'image/png', // API accepts generic mime type for processing
            },
          },
          {
            text: prompt,
          },
        ],
      },
    });

    for (const part of response.candidates?.[0]?.content?.parts || []) {
      if (part.inlineData) {
        return `data:image/png;base64,${part.inlineData.data}`;
      }
    }
    throw new Error("No image generated in response. The model might have returned text only.");
  } catch (error) {
    handleError(error, "Image Editing");
    throw error;
  }
};

export const getLiveClient = () => {
  return ai.live;
};

// Feature: Generate Video (Veo)
export const generateVeoVideo = async (
  prompt: string, 
  imageBase64: string | null, 
  aspectRatio: '16:9' | '9:16',
  onStatusUpdate?: (status: string) => void
): Promise<string> => {
  // Always create a new instance to pick up the latest selected key
  const freshAi = new GoogleGenAI({ apiKey: process.env.API_KEY });

  let request: any = {
    model: modelVideoGen,
    config: {
      numberOfVideos: 1,
      resolution: '720p', // Preview models support 720p/1080p, sticking to 720p for speed
      aspectRatio: aspectRatio
    }
  };

  // If image is provided, use image-to-video, otherwise text-to-video
  if (imageBase64) {
    const cleanBase64 = imageBase64.replace(/^data:image\/\w+;base64,/, "");
    request.image = {
      imageBytes: cleanBase64,
      mimeType: 'image/png' // Assuming png or jpeg, generally handled
    };
    if (prompt) request.prompt = prompt;
  } else {
    request.prompt = prompt;
  }

  try {
    if (onStatusUpdate) onStatusUpdate("Initializing Veo model...");
    let operation = await freshAi.models.generateVideos(request);
    
    if (onStatusUpdate) onStatusUpdate("Request submitted. Waiting for video...");

    // Polling loop
    let pollCount = 0;
    while (!operation.done) {
      pollCount++;
      if (onStatusUpdate) onStatusUpdate(`Rendering video... (Check #${pollCount})`);
      await new Promise(resolve => setTimeout(resolve, 5000)); // 5s wait
      operation = await freshAi.operations.getVideosOperation({ operation: operation });
    }

    if (operation.error) {
      throw new Error(`Veo Error: ${operation.error.message}`);
    }

    if (onStatusUpdate) onStatusUpdate("Generation complete. Downloading file...");

    const videoUri = operation.response?.generatedVideos?.[0]?.video?.uri;
    if (!videoUri) throw new Error("Video generation completed but no URI was returned.");

    // Fetch the actual video bytes using the key
    const response = await fetch(`${videoUri}&key=${process.env.API_KEY}`);
    if (!response.ok) throw new Error("Failed to download generated video.");
    
    const blob = await response.blob();
    return URL.createObjectURL(blob);
  } catch (error) {
    handleError(error, "Video Generation");
    throw error;
  }
};

// Feature: Video Understanding
export const analyzeVideoContent = async (
  videoBase64: string, 
  mimeType: string, 
  prompt: string
): Promise<string> => {
  try {
    const base64Data = videoBase64.split(',')[1];
    
    const response = await ai.models.generateContent({
      model: modelVideoAnalyze,
      contents: {
        parts: [
          { 
            inlineData: { 
              mimeType: mimeType, 
              data: base64Data 
            } 
          },
          { text: prompt || "Analyze this video and describe what is happening." }
        ]
      }
    });

    return response.text || "No analysis generated.";
  } catch (error) {
    handleError(error, "Video Analysis");
    throw error;
  }
};