const AppState = {
  currentDocumentId: null,
  currentAnalysis: null,
  
  // Track all uploaded/available documents for compare/consultation selectors
  documents: new Map(), // documentId -> { id, name }
  
  addDocument(id, name) {
    this.documents.set(id, { id, name });
    this.currentDocumentId = id;
    
    // Dispatch event to update selectors
    window.dispatchEvent(new CustomEvent('documents-updated'));
  },

  getAllDocuments() {
    return Array.from(this.documents.values());
  },
  
  setCurrentAnalysis(analysis) {
    this.currentAnalysis = analysis;
    if (analysis && analysis.documentId && analysis.document) {
       this.addDocument(analysis.documentId, analysis.document.title || "Uploaded Document");
    }
  }
};
