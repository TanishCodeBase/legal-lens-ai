const express = require('express');
const { processAndStoreDocument, getDocument, updateDocumentAnalysis } = require('../services/document');
const { generateAndValidate, analyzeZodSchema } = require('../services/validation');
const systemInstruction = require('../prompts/system');
const analyzePrompt = require('../prompts/analyze');
const analyzeSchema = require('../schemas/analyze.schema');

module.exports = (upload) => {
  const router = express.Router();

  router.post('/', upload.single('document'), async (req, res) => {
    try {
      const file = req.file;
      const { documentId: existingDocId } = req.body;

      let doc;

      // Handle file upload or existing document ID
      if (file) {
        doc = await processAndStoreDocument(file);
      } else if (existingDocId) {
        doc = getDocument(existingDocId);
        if (!doc) {
          return res.status(404).json({ success: false, error: { code: 'DOCUMENT_NOT_FOUND', message: 'Document not found.' } });
        }
      } else {
        return res.status(400).json({ success: false, error: { code: 'INVALID_REQUEST', message: 'Either document file or documentId must be provided.' } });
      }

      // If already analyzed, return cached analysis
      if (doc.analysis) {
        return res.json(doc.analysis);
      }

      // Run Gemini generation
      const analysisResult = await generateAndValidate(
        doc.geminiFileUri,
        systemInstruction,
        analyzePrompt,
        analyzeSchema,
        analyzeZodSchema
      );

      // Add documentId to response document object for the frontend to know the ID
      analysisResult.documentId = doc.documentId;
      
      // Cache it
      updateDocumentAnalysis(doc.documentId, analysisResult);

      res.json(analysisResult);
    } catch (error) {
      console.error('Analyze Error:', error);
      if (error.message === 'SERVICE_UNAVAILABLE') {
        return res.status(503).json({
          success: false,
          error: {
            code: 'SERVICE_UNAVAILABLE',
            message: 'The AI service is temporarily unavailable. Please try again later.'
          }
        });
      }
      if (error.message === 'AI_RESPONSE_INVALID') {
        return res.status(500).json({ success: false, error: { code: 'AI_RESPONSE_INVALID', message: 'The AI generated an invalid response structure.' } });
      }
      res.status(500).json({ success: false, error: { code: 'AI_ANALYSIS_FAILED', message: 'The document could not be analyzed.' } });
    }
  });

  return router;
};
