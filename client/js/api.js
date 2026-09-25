const Api = {
  async handleResponse(response) {
    if (!response.ok) {
      let errData;
      try { errData = await response.json(); } catch(e) {}
      throw new Error(errData?.error?.message || 'An unexpected error occurred.');
    }
    return response.json();
  },

  async uploadAndAnalyze(file) {
    const formData = new FormData();
    formData.append('document', file);
    const response = await fetch('/api/analyze', {
      method: 'POST',
      body: formData
    });
    return this.handleResponse(response);
  },

  async askDocument(documentId, question) {
    const response = await fetch('/api/ask', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ documentId, question })
    });
    return this.handleResponse(response);
  },

  async compareDocuments(docAId, docBId) {
    const response = await fetch('/api/compare', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        documentA: { documentId: docAId },
        documentB: { documentId: docBId }
      })
    });
    return this.handleResponse(response);
  },

  async generateConsultation(documentId, userContext) {
    const response = await fetch('/api/consultation', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ documentId, userContext })
    });
    return this.handleResponse(response);
  }
};
