const fs = require('fs');
const path = require('path');
const { uploadToGemini } = require('./gemini');

// In-memory document store mapping documentId to document data
// documentId -> { documentId, fileName, mimeType, geminiFileUri, analysis, createdAt }
const documents = new Map();

/**
 * Processes an uploaded document, uploads it to Gemini, and stores the mapping.
 * @param {Object} file - The file object from Multer
 * @returns {Promise<Object>} - The document metadata
 */
async function processAndStoreDocument(file) {
  const documentId = 'doc_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
  
  try {
    // Upload the file to Gemini using Files API
    const geminiFile = await uploadToGemini(file.path, file.mimetype);
    
    const docData = {
      documentId,
      fileName: file.originalname,
      mimeType: file.mimetype,
      geminiFileUri: geminiFile.uri,
      geminiFileName: geminiFile.name,
      analysis: null, // to be cached later
      createdAt: new Date().toISOString()
    };
    
    documents.set(documentId, docData);
    
    // Clean up the local temporary file to save space, since Gemini now has it
    if (fs.existsSync(file.path)) {
      fs.unlinkSync(file.path);
    }
    
    return docData;
  } catch (error) {
    if (fs.existsSync(file.path)) {
      fs.unlinkSync(file.path);
    }
    throw error;
  }
}

/**
 * Retrieves a document from the store.
 * @param {string} documentId 
 * @returns {Object}
 */
function getDocument(documentId) {
  return documents.get(documentId);
}

/**
 * Updates a document's analysis cache.
 * @param {string} documentId 
 * @param {Object} analysis 
 */
function updateDocumentAnalysis(documentId, analysis) {
  const doc = documents.get(documentId);
  if (doc) {
    doc.analysis = analysis;
    documents.set(documentId, doc);
  }
}

module.exports = {
  processAndStoreDocument,
  getDocument,
  updateDocumentAnalysis
};
