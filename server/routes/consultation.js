const express = require('express');
const { getDocument } = require('../services/document');
const { generateAndValidate, consultationZodSchema } = require('../services/validation');
const systemInstruction = require('../prompts/system');
const consultationPrompt = require('../prompts/consultation');
const consultationSchema = require('../schemas/consultation.schema');

const router = express.Router();

router.post('/', async (req, res) => {
  try {
    const { documentId, userContext } = req.body;

    if (!documentId) {
      return res.status(400).json({ success: false, error: { code: 'INVALID_REQUEST', message: 'Missing documentId.' } });
    }

    const doc = getDocument(documentId);
    if (!doc) {
      return res.status(404).json({ success: false, error: { code: 'DOCUMENT_NOT_FOUND', message: 'Document not found.' } });
    }

    // Run Gemini generation
    const consultationResult = await generateAndValidate(
      doc.geminiFileUri,
      systemInstruction,
      consultationPrompt(userContext),
      consultationSchema,
      consultationZodSchema
    );

    res.json(consultationResult);
  } catch (error) {
    console.error('Consultation Error:', error);
    if (error.message === 'AI_RESPONSE_INVALID') {
      return res.status(500).json({ success: false, error: { code: 'AI_RESPONSE_INVALID', message: 'The AI generated an invalid response structure.' } });
    }
    res.status(500).json({ success: false, error: { code: 'CONSULTATION_FAILED', message: 'The consultation brief could not be prepared.' } });
  }
});

module.exports = router;
