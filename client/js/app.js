document.addEventListener('DOMContentLoaded', () => {
  // Navigation
  document.querySelectorAll('.nav-item').forEach(item => {
    item.addEventListener('click', (e) => {
      e.preventDefault();
      UI.switchView(e.target.dataset.target);
    });
  });

  // Global events
  window.addEventListener('documents-updated', () => {
    UI.updateDocumentSelectors();
  });

  // Modal close
  document.querySelector('.close-modal').addEventListener('click', () => UI.closeSourceModal());
  window.addEventListener('click', (e) => {
    if (e.target === document.getElementById('source-modal')) UI.closeSourceModal();
  });

  // Dashboard buttons
  document.getElementById('btn-hero-analyze').addEventListener('click', () => UI.switchView('analyze'));
  document.getElementById('btn-hero-compare').addEventListener('click', () => UI.switchView('compare'));
  document.querySelectorAll('.action-card').forEach(card => {
    card.addEventListener('click', (e) => {
      UI.switchView(e.currentTarget.dataset.action);
    });
  });

  // Demo Loaders
  async function loadDemo(filename, displayName) {
    try {
      const response = await fetch('/' + filename);
      const blob = await response.blob();
      const file = new File([blob], displayName, { type: 'application/pdf' });
      UI.switchView('analyze');
      handleFileSelect(file);
    } catch (e) {
      UI.showError('Failed to load demo document.');
    }
  }

  document.getElementById('btn-load-demo-1').addEventListener('click', () => {
    loadDemo('demo-lease-v1.pdf', 'Demo-Lease-Agreement-v1.pdf');
  });
  document.getElementById('btn-load-demo-2').addEventListener('click', () => {
    loadDemo('demo-lease-v2.pdf', 'Demo-Lease-Agreement-v2.pdf');
  });

  // Analyze: Upload
  const fileInput = document.getElementById('file-input');
  const dropZone = document.getElementById('drop-zone');
  const uploadStatus = document.getElementById('upload-status');
  let currentFile = null;

  fileInput.addEventListener('change', (e) => handleFileSelect(e.target.files[0]));
  
  dropZone.addEventListener('dragover', (e) => {
    e.preventDefault();
    dropZone.classList.add('drag-over');
  });
  
  dropZone.addEventListener('dragleave', () => dropZone.classList.remove('drag-over'));
  
  dropZone.addEventListener('drop', (e) => {
    e.preventDefault();
    dropZone.classList.remove('drag-over');
    if (e.dataTransfer.files.length) {
      handleFileSelect(e.dataTransfer.files[0]);
    }
  });

  function handleFileSelect(file) {
    if (!file || file.type !== 'application/pdf') {
      UI.showError('Please select a valid PDF file.');
      return;
    }
    currentFile = file;
    document.getElementById('file-info').textContent = `${file.name} (${(file.size/1024/1024).toFixed(2)} MB)`;
    dropZone.hidden = true;
    uploadStatus.hidden = false;
  }

  document.getElementById('btn-start-analysis').addEventListener('click', async (e) => {
    if (!currentFile) return;
    const btn = e.target;
    btn.disabled = true;
    
    document.getElementById('upload-area').hidden = true;
    document.getElementById('analyze-loading').hidden = false;
    document.getElementById('analysis-workspace').hidden = true;

    try {
      const result = await Api.uploadAndAnalyze(currentFile);
      AppState.setCurrentAnalysis(result);
      UI.renderAnalysis(result);
      if (result.lawyerQuestions) {
        UI.populateAskSuggestions(result.lawyerQuestions);
      }
      
      document.getElementById('analyze-loading').hidden = true;
      document.getElementById('analysis-workspace').hidden = false;
    } catch (err) {
      UI.showError(err.message);
      document.getElementById('analyze-loading').hidden = true;
      document.getElementById('upload-area').hidden = false;
    } finally {
      btn.disabled = false;
      currentFile = null;
      fileInput.value = '';
    }
  });

  // Analyze actions
  document.getElementById('btn-goto-ask').addEventListener('click', () => UI.switchView('ask'));
  document.getElementById('btn-goto-consult').addEventListener('click', () => UI.switchView('consultation'));

  // Ask AI
  const chatInput = document.getElementById('chat-input');
  const btnSendChat = document.getElementById('btn-send-chat');

  const sendChat = async () => {
    const question = chatInput.value.trim();
    if (!question) return;
    if (!AppState.currentDocumentId) {
      UI.showError("Please analyze a document first.");
      return;
    }

    // UI Updates
    chatInput.value = '';
    btnSendChat.disabled = true;
    UI.appendChatMessage(question, true);
    
    const loadingId = 'loading-' + Date.now();
    const chatHistory = document.getElementById('chat-history');
    chatHistory.insertAdjacentHTML('beforeend', `<div id="${loadingId}" class="chat-message system-message text-muted small">Reviewing the relevant sections...</div>`);
    chatHistory.scrollTop = chatHistory.scrollHeight;

    try {
      const result = await Api.askDocument(AppState.currentDocumentId, question);
      document.getElementById(loadingId).remove();
      UI.appendChatMessage(result.answer, false, result.sources, result.confidence);
      
      if (result.followUp) {
        UI.populateAskSuggestions([result.followUp]);
      }
    } catch (err) {
      document.getElementById(loadingId).remove();
      UI.appendChatMessage(`Error: ${err.message}`, false);
    } finally {
      btnSendChat.disabled = false;
    }
  };

  btnSendChat.addEventListener('click', sendChat);
  chatInput.addEventListener('keydown', (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendChat();
    }
  });

  // Compare
  document.getElementById('btn-run-compare').addEventListener('click', async (e) => {
    const docA = document.getElementById('select-doc-a').value;
    const docB = document.getElementById('select-doc-b').value;
    
    if (!docA || !docB) {
      UI.showError("Please select both documents to compare.");
      return;
    }
    if (docA === docB) {
      UI.showError("Please select two different documents.");
      return;
    }

    e.target.disabled = true;
    document.getElementById('compare-setup').hidden = true;
    document.getElementById('compare-loading').hidden = false;

    try {
      const result = await Api.compareDocuments(docA, docB);
      UI.renderCompare(result);
    } catch (err) {
      UI.showError(err.message);
      document.getElementById('compare-setup').hidden = false;
      document.getElementById('compare-loading').hidden = true;
    } finally {
      e.target.disabled = false;
    }
  });

  // Consultation
  document.getElementById('btn-run-consult').addEventListener('click', async (e) => {
    const docId = document.getElementById('select-doc-consult').value;
    const context = document.getElementById('consult-context').value.trim();
    
    if (!docId) {
      UI.showError("Please select a document.");
      return;
    }

    e.target.disabled = true;
    document.getElementById('consultation-setup').hidden = true;
    document.getElementById('consult-loading').hidden = false;

    try {
      const result = await Api.generateConsultation(docId, context);
      UI.renderConsultation(result);
    } catch (err) {
      UI.showError(err.message);
      document.getElementById('consultation-setup').hidden = false;
      document.getElementById('consult-loading').hidden = true;
    } finally {
      e.target.disabled = false;
    }
  });

  document.getElementById('btn-print-brief').addEventListener('click', () => {
    window.print();
  });
});
