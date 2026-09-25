const express = require('express');
const { getDocument } = require('../services/document');
const { generateAndValidate, askZodSchema } = require('../services/validation');
const systemInstruction = require('../prompts/system');
const askPrompt = require('../prompts/ask');
const askSchema = require('../schemas/ask.schema');

const router = express.Router();

router.post('/', async (req, res) => {
  try {
    const { documentId, question } = req.body;

    if (!documentId || !question) {
      return res.status(400).json({ success: false, error: { code: 'INVALID_REQUEST', message: 'Missing documentId or question.' } });
    }

    const doc = getDocument(documentId);
    if (!doc) {
      return res.status(404).json({ success: false, error: { code: 'DOCUMENT_NOT_FOUND', message: 'Document not found.' } });
    }

    // Run Gemini generation
    const askResult = await generateAndValidate(
      doc.geminiFileUri,
      systemInstruction,
      askPrompt(question),
      askSchema,
      askZodSchema
    );

    res.json(askResult);
  } catch (error) {
    console.error('Ask Error:', error);
    if (error.message === 'AI_RESPONSE_INVALID') {
      return res.status(500).json({ success: false, error: { code: 'AI_RESPONSE_INVALID', message: 'The AI generated an invalid response structure.' } });
    }
    res.status(500).json({ success: false, error: { code: 'AI_ANALYSIS_FAILED', message: 'The question could not be answered.' } });
  }
});

module.exports = router;
