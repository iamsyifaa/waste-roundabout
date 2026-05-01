import { geminiModel } from '../utils/gemini';
import { aiClassifySchema } from '../utils/zod.schema';
import { BadRequestError } from '../utils/errors';

/**
 * Uses Gemini AI to classify waste based on description and optional image.
 * Provides recommendations for category, estimated price, and tips.
 */
export const classifyWaste = async (data: unknown) => {
  const { description, imageUrl } = aiClassifySchema.parse(data);

  if (!process.env.GEMINI_API_KEY || process.env.GEMINI_API_KEY === 'your_gemini_api_key_here') {
    throw new BadRequestError('Fitur AI belum dikonfigurasi. Harap set GEMINI_API_KEY.');
  }

  try {
    const prompt = `
      Anda adalah asisten ahli pertanian bernama Agri-Cycle Bot.
      Saya memiliki limbah pertanian dengan deskripsi berikut:
      "${description}"
      
      Tolong analisis limbah ini dan berikan output HANYA dalam format JSON dengan struktur berikut:
      {
        "suggestedCategory": "Sekam Padi / Kulit Kopi / Jerami / Batang Jagung / Kulit Kakao / Lainnya",
        "estimatedQuality": "Tinggi / Sedang / Rendah",
        "recommendedProcessing": "Saran singkat cara mengolah limbah ini agar lebih bernilai jual",
        "potentialUses": ["kegunaan 1", "kegunaan 2"]
      }
      
      Pastikan format output adalah JSON murni tanpa markdown blocks (\`\`\`json).
    `;

    // Note: If we had an actual image URL, we could download it and pass it to Gemini as a base64 inlineData.
    // For simplicity and since we only have a URL string, we just pass the text prompt.
    // Gemini 1.5 Pro/Flash handles text very well.

    const result = await geminiModel.generateContent(prompt);
    const responseText = result.response.text();
    
    // Clean up potential markdown formatting if Gemini still returns it
    const cleanedText = responseText.replace(/```json\n?|\n?```/g, '').trim();

    try {
      const parsedJson = JSON.parse(cleanedText);
      return parsedJson;
    } catch (parseError) {
      console.error('Failed to parse Gemini response as JSON:', cleanedText);
      return {
        suggestedCategory: 'Lainnya',
        rawResponse: responseText,
        error: 'Gagal memparsing output AI sebagai JSON',
      };
    }
  } catch (error) {
    console.error('Gemini API Error:', error);
    throw new BadRequestError('Gagal memproses analisis AI. Coba lagi nanti.');
  }
};
