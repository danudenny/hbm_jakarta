/**
 * DeepSeek AI API service for translations
 */
import axios from 'axios';

// Get the API key from environment variables
const API_KEY = import.meta.env.VITE_DEEPSEEK_API_KEY;

/**
 * Translate text using DeepSeek AI
 * @param text The text to translate
 * @param sourceLanguage The source language code (e.g., 'en')
 * @param targetLanguage The target language code (e.g., 'id')
 * @returns The translated text
 */
export async function translateWithDeepSeek(
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

    // Set up the request data
    const requestData = {
      model: "deepseek-chat",
      messages: [
        {
          role: "user",
          content: prompt
        }
      ],
      temperature: 0.3,
      max_tokens: 2000
    };

    // Make the API request
    const response = await axios.post(
      'https://api.deepseek.com/v1/chat/completions',
      requestData,
      {
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${API_KEY}`
        }
      }
    );

    // Extract the translated text from the response
    const translatedText = response.data.choices[0].message.content.trim();
    
    // Remove any quotes that might be in the response
    return translatedText.replace(/^["']|["']$/g, '');
  } catch (error) {
    console.error("Error translating with DeepSeek:", error);
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
