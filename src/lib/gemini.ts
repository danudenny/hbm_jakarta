/**
 * Gemini AI API service for translations
 */
import { GoogleGenerativeAI } from '@google/generative-ai';

// Get the API key from environment variables
const API_KEY = import.meta.env.VITE_GEMINI_API_KEY;

// Initialize the Gemini AI client
const genAI = new GoogleGenerativeAI(API_KEY);
const model = genAI.getGenerativeModel({ model: "gemini-1.5-pro" });

/**
 * Translate text using Google's Gemini AI
 * @param text The text to translate
 * @param sourceLanguage The source language code (e.g., 'en')
 * @param targetLanguage The target language code (e.g., 'id')
 * @returns The translated text
 */
export async function translateWithGemini(
  text: string,
  sourceLanguage: string,
  targetLanguage: string
): Promise<string> {
  try {
    // Get the full language names for better results
    const sourceLangName = getLanguageName(sourceLanguage);
    const targetLangName = getLanguageName(targetLanguage);

    // Create the prompt for translation
    const prompt = `Translate the following text from ${sourceLangName} to ${targetLangName}. 
    Only return the translated text without any explanations or additional text.
    
    Text to translate: "${text}"`;

    // Generate content using the Gemini model
    const result = await model.generateContent(prompt);
    const response = await result.response;
    const translatedText = response.text().trim();
    
    // Remove any quotes that might be in the response
    return translatedText.replace(/^["']|["']$/g, '');
  } catch (error) {
    console.error("Error translating with Gemini:", error);
    throw error;
  }
}

/**
 * Get the full language name from a language code
 * @param langCode The language code (e.g., 'en', 'id')
 * @returns The full language name
 */
function getLanguageName(langCode: string): string {
  const languageMap: Record<string, string> = {
    en: "English",
    id: "Indonesian",
    ja: "Japanese",
    zh: "Chinese",
    de: "German",
    ar: "Arabic",
    es: "Spanish",
    fr: "French",
    it: "Italian",
    ko: "Korean",
    pt: "Portuguese",
    ru: "Russian",
    tr: "Turkish",
  };

  return languageMap[langCode] || langCode;
}
