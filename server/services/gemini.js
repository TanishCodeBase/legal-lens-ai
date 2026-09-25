const { GoogleGenAI } = require('@google/genai');

const apiKey = process.env.GEMINI_API_KEY;
const modelName = process.env.GEMINI_MODEL || 'gemini-3.8-flash';
const fallbackModelName = process.env.GEMINI_FALLBACK_MODEL || 'gemini-3.7-flash';

if (!apiKey) {
  console.warn("WARNING: GEMINI_API_KEY is not set in the environment variables.");
}

const ai = new GoogleGenAI({ apiKey: apiKey });

/**
 * Uploads a file to Gemini using the Files API
 */
async function uploadToGemini(filePath, mimeType) {
  try {
    const uploadResult = await ai.files.upload({
      file: filePath,
      config: { mimeType: mimeType }
    });
    console.log(`Uploaded file to Gemini as: ${uploadResult.name}`);
    return uploadResult;
  } catch (error) {
    console.error("Gemini Upload Error:", error);
    throw new Error("Failed to upload document to AI provider.");
  }
}

/**
 * Sends a prompt with document context and requests structured output
 */
async function generateStructuredContent(fileUris, systemInstruction, prompt, schema, modelOverride) {
  const usedModel = modelOverride || modelName;
  console.log(`[Gemini] Using model: ${usedModel}`);
  try {
    const contents = [];
    const uris = Array.isArray(fileUris) ? fileUris : [fileUris];

    for (const uri of uris) {
      contents.push({
        fileData: {
          fileUri: uri,
          mimeType: 'application/pdf'
        }
      });
    }

    contents.push({ text: prompt });

    const response = await ai.models.generateContent({
      model: usedModel,
      contents: contents,
      config: {
        systemInstruction: systemInstruction,
        responseMimeType: "application/json",
        responseSchema: schema,
        temperature: 0.2
      }
    });

    const responseText = response.text;
    if (!responseText) {
      throw new Error("AI returned an empty response.");
    }

    try {
      return JSON.parse(responseText);
    } catch (parseError) {
      console.error("Failed to parse JSON response:", responseText);
      throw new Error("AI returned invalid JSON structure.");
    }
  } catch (error) {
    console.error("Gemini Generation Error:", error);
    const wrapped = new Error("Failed to generate analysis.");
    wrapped.originalError = error;
    const rawStatus =
  error.status ??
  error.code ??
  error.response?.status ??
  error.response?.data?.error?.code ??
  null;
wrapped.statusCode = rawStatus != null ? Number(rawStatus) : null;
    throw wrapped;
  }
}

module.exports = { uploadToGemini, generateStructuredContent, modelName, fallbackModelName };
