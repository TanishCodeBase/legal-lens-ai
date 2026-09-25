const express = require('express');
const { getDocument } = require('../services/document');
const { generateAndValidate, compareZodSchema } = require('../services/validation');
const systemInstruction = require('../prompts/system');
const comparePrompt = require('../prompts/compare');
const compareSchema = require('../schemas/compare.schema');

const router = express.Router();

router.post('/', async (req, res) => {
  try {
    const { documentA, documentB } = req.body;

    if (!documentA || !documentA.documentId || !documentB || !documentB.documentId) {
      return res.status(400).json({ success: false, error: { code: 'INVALID_REQUEST', message: 'Missing documentA or documentB ID.' } });
    }

    const docA = getDocument(documentA.documentId);
    const docB = getDocument(documentB.documentId);

    if (!docA || !docB) {
      return res.status(404).json({ success: false, error: { code: 'DOCUMENT_NOT_FOUND', message: 'One or both documents not found.' } });
    }

    // Run Gemini generation using both file URIs
    const compareResult = await generateAndValidate(
      [docA.geminiFileUri, docB.geminiFileUri],
      systemInstruction,
      comparePrompt,
      compareSchema,
      compareZodSchema
    );

    res.json(compareResult);
  } catch (error) {
    console.error('Compare Error:', error);
    if (error.message === 'AI_RESPONSE_INVALID') {
      return res.status(500).json({ success: false, error: { code: 'AI_RESPONSE_INVALID', message: 'The AI generated an invalid response structure.' } });
    }
    res.status(500).json({ success: false, error: { code: 'COMPARISON_FAILED', message: 'The comparison could not be completed.' } });
  }
});

module.exports = router;
