const UI = {
  // Navigation
  switchView(viewId) {
    document.querySelectorAll('.view').forEach(v => v.classList.remove('active'));
    document.querySelectorAll('.nav-item').forEach(v => v.classList.remove('active'));
    
    const targetView = document.getElementById(viewId);
    if (targetView) targetView.classList.add('active');
    
    const navItem = document.querySelector(`.nav-item[data-target="${viewId}"]`);
    if (navItem) navItem.classList.add('active');
  },

  // Document Selectors
  updateDocumentSelectors() {
    const docs = AppState.getAllDocuments();
    const selectors = ['select-doc-a', 'select-doc-b', 'select-doc-consult'];
    
    selectors.forEach(selectorId => {
      const select = document.getElementById(selectorId);
      if (!select) return;
      
      const currentValue = select.value;
      select.innerHTML = '<option value="">Select a document...</option>';
      
      docs.forEach(doc => {
        const option = document.createElement('option');
        option.value = doc.id;
        option.textContent = doc.name;
        select.appendChild(option);
      });
      
      if (docs.some(d => d.id === currentValue)) {
        select.value = currentValue;
      } else if (docs.length > 0 && selectorId === 'select-doc-consult') {
        select.value = docs[0].id; // auto select for consultation
      }
    });

    const runCompareBtn = document.getElementById('btn-run-compare');
    if (runCompareBtn) {
       runCompareBtn.disabled = docs.length < 2;
    }
  },

  // Render Analysis
  renderAnalysis(analysis) {
    // Top headers
    document.getElementById('doc-title-badge').textContent = analysis.document.type || 'Document';
    
    // Main Analysis Area
    const contentArea = document.getElementById('analysis-content');
    let html = `
      <div class="card mb-4">
        <h4>Document Overview</h4>
        <p><strong>Title:</strong> ${analysis.document.title}</p>
        <p><strong>Parties:</strong> ${analysis.document.parties.join(', ')}</p>
        <p><strong>Effective Date:</strong> ${analysis.document.effectiveDate}</p>
        <p><strong>Expiration Date:</strong> ${analysis.document.expirationDate}</p>
      </div>

      <div class="card mb-4">
        <h4>AI Summary</h4>
        <p>${analysis.summary.detailed || analysis.summary.short}</p>
      </div>
    `;

    // Key Terms
    if (analysis.keyTerms && analysis.keyTerms.length > 0) {
      html += `<div class="card mb-4"><h4>Key Terms</h4><ul style="padding-left:1.5rem">`;
      analysis.keyTerms.forEach(term => {
        html += `<li><strong>${term.name}:</strong> ${term.value} <span class="badge badge-info">${term.category}</span>
          <div class="source-link" onclick="UI.showSource(${JSON.stringify(term.source).replace(/"/g, '&quot;')})">ℹ️ View Source</div>
        </li>`;
      });
      html += `</ul></div>`;
    }

    // Obligations
    if (analysis.obligations && analysis.obligations.length > 0) {
      html += `<div class="card mb-4"><h4>Obligations</h4><ul style="padding-left:1.5rem">`;
      analysis.obligations.forEach(ob => {
        html += `<li><strong>${ob.party}:</strong> ${ob.obligation} <span class="text-muted">(${ob.frequency})</span>
          <div class="source-link" onclick="UI.showSource(${JSON.stringify(ob.source).replace(/"/g, '&quot;')})">ℹ️ View Source</div>
        </li>`;
      });
      html += `</ul></div>`;
    }

    // Important Clauses
    if (analysis.clauses && analysis.clauses.length > 0) {
      html += `<h4>Important Clauses</h4>`;
      analysis.clauses.forEach(clause => {
        const severityClass = this.getSeverityClass(clause.severity);
        html += `
          <div class="card">
            <div class="card-header">
              <span class="badge ${severityClass}">${clause.severity.toUpperCase()}</span>
              <strong>${clause.title}</strong>
            </div>
            <p>${clause.summary}</p>
            <p class="text-muted small" style="margin-top:0.5rem"><strong>Why it matters:</strong> ${clause.whyItMatters}</p>
            <div style="display:flex; justify-content:space-between; margin-top:0.5rem;">
              <div class="source-link" onclick="UI.showSource(${JSON.stringify(clause.source).replace(/"/g, '&quot;')})">ℹ️ Source</div>
              <div class="source-link" onclick="UI.askSuggested('${clause.suggestedQuestion.replace(/'/g, "\\'")}')">💬 Ask about this</div>
            </div>
          </div>
        `;
      });
    }

    contentArea.innerHTML = html;

    // Insights (Right Column)
    document.getElementById('attention-score').innerHTML = `${analysis.attentionScore}<span class="score-max">/100</span>`;
    document.getElementById('attention-label').textContent = analysis.attentionLabel.toUpperCase();
    document.getElementById('count-high').textContent = analysis.attentionBreakdown.highPriority;
    document.getElementById('count-medium').textContent = analysis.attentionBreakdown.review;
    document.getElementById('count-info').textContent = analysis.attentionBreakdown.informational;

    const nextStepsList = document.getElementById('steps-list');
    nextStepsList.innerHTML = '';
    analysis.nextSteps.forEach(step => {
      const li = document.createElement('li');
      li.style.marginBottom = '0.5rem';
      li.innerHTML = `<strong>${step.action}</strong><br><span class="text-muted" style="font-size:0.8rem">${step.reason}</span>`;
      nextStepsList.appendChild(li);
    });
    
    // Stats update (Dashboard)
    document.getElementById('stat-docs').textContent = AppState.documents.size;
    document.getElementById('stat-clauses').textContent = parseInt(document.getElementById('stat-clauses').textContent || '0') + (analysis.clauses?.length || 0);
  },

  // Chat UI
  appendChatMessage(text, isUser = false, sources = [], confidence = null) {
    const chatHistory = document.getElementById('chat-history');
    const msgDiv = document.createElement('div');
    msgDiv.className = `chat-message ${isUser ? 'user-message' : 'system-message'}`;
    
    let contentHtml = `<p>${text}</p>`;
    
    if (!isUser) {
      if (confidence) {
        contentHtml += `<div class="badge badge-${this.getSeverityClass(confidence, true)}" style="margin-top:0.5rem">Confidence: ${confidence.toUpperCase()}</div>`;
      }
      
      if (sources && sources.length > 0) {
        contentHtml += `<div style="margin-top:0.5rem;">`;
        sources.forEach(src => {
          contentHtml += `<span class="badge badge-info" style="cursor:pointer; margin-right:0.25rem" onclick="UI.showSource(${JSON.stringify(src).replace(/"/g, '&quot;')})">📑 Source: ${src.section || 'Page '+src.page}</span>`;
        });
        contentHtml += `</div>`;
      }
    }
    
    msgDiv.innerHTML = `
      <div class="avatar">${isUser ? '👤' : '⚖️'}</div>
      <div class="message-content">${contentHtml}</div>
    `;
    
    chatHistory.appendChild(msgDiv);
    chatHistory.scrollTop = chatHistory.scrollHeight;
  },

  populateAskSuggestions(questions) {
    const container = document.getElementById('suggested-questions');
    if (!container) return;
    container.innerHTML = '';
    questions.slice(0, 3).forEach(q => {
      const btn = document.createElement('button');
      btn.className = 'suggest-pill';
      btn.textContent = q;
      btn.onclick = () => this.askSuggested(q);
      container.appendChild(btn);
    });
  },

  askSuggested(question) {
    this.switchView('ask');
    const input = document.getElementById('chat-input');
    input.value = question;
    document.getElementById('btn-send-chat').click();
  },

  // Compare UI
  renderCompare(result) {
    document.getElementById('compare-setup').hidden = true;
    document.getElementById('compare-loading').hidden = true;
    
    const resultsArea = document.getElementById('compare-results');
    resultsArea.hidden = false;
    
    document.getElementById('compare-summary-text').textContent = result.summary.text;
    document.getElementById('comp-high').textContent = result.summary.highImportance;
    document.getElementById('comp-med').textContent = result.summary.mediumImportance;
    document.getElementById('comp-low').textContent = result.summary.lowImportance;
    
    const changesList = document.getElementById('changes-list');
    changesList.innerHTML = '';
    
    result.changes.forEach(change => {
      const severityClass = this.getSeverityClass(change.importance, true);
      const html = `
        <div class="card mt-4">
          <div class="card-header">
            <span class="badge ${severityClass}">${change.importance.toUpperCase()}</span>
            <strong>${change.title}</strong>
          </div>
          <p>${change.explanation}</p>
          <div class="diff-box">
            <div class="diff-col diff-old">
              <div class="small font-weight-bold mb-2">Original</div>
              <div>${change.oldValue}</div>
              <div class="source-link mt-2" onclick="UI.showSource(${JSON.stringify(change.sourceA).replace(/"/g, '&quot;')})">ℹ️ Source A</div>
            </div>
            <div class="diff-col diff-new">
              <div class="small font-weight-bold mb-2">Updated</div>
              <div>${change.newValue}</div>
              <div class="source-link mt-2" onclick="UI.showSource(${JSON.stringify(change.sourceB).replace(/"/g, '&quot;')})">ℹ️ Source B</div>
            </div>
          </div>
        </div>
      `;
      changesList.innerHTML += html;
    });
  },

  // Consultation UI
  renderConsultation(result) {
    document.getElementById('consultation-setup').hidden = true;
    document.getElementById('consult-loading').hidden = true;
    
    const resultsArea = document.getElementById('consultation-results');
    resultsArea.hidden = false;
    
    const content = document.getElementById('brief-content');
    let html = `
      <div class="brief-content-section">
        <h4>Situation Summary</h4>
        <p>${result.caseSummary}</p>
      </div>
      
      <div class="brief-content-section">
        <h4>Key Issues</h4>
        <ul style="padding-left:1.5rem">
          ${result.keyIssues.map(i => `<li><strong>${i.issue}</strong> (${i.importance}): ${i.description}</li>`).join('')}
        </ul>
      </div>

      <div class="brief-content-section">
        <h4>Important Clauses to Discuss</h4>
        <ul style="padding-left:1.5rem">
          ${result.importantClauses.map(c => `<li><strong>${c.title}</strong>: ${c.reason}</li>`).join('')}
        </ul>
      </div>

      <div class="brief-content-section">
        <h4>Questions for Lawyer</h4>
        <ul style="padding-left:1.5rem">
          ${result.questionsForLawyer.map(q => `<li>${q.question}</li>`).join('')}
        </ul>
      </div>

      <div class="brief-content-section">
        <h4>Documents to Bring</h4>
        <ul style="padding-left:1.5rem">
          ${result.documentsToBring.map(d => `<li>${d}</li>`).join('')}
        </ul>
      </div>
    `;
    
    content.innerHTML = html;
  },

  // Source Modal
  showSource(source) {
    if (!source) return;
    const modal = document.getElementById('source-modal');
    document.getElementById('source-page').textContent = source.page ? `Page ${source.page}` : 'Page N/A';
    document.getElementById('source-section').textContent = source.section || 'Unknown Section';
    document.getElementById('source-quote').textContent = source.quote || 'No exact quote available.';
    modal.classList.add('active');
  },
  
  closeSourceModal() {
    document.getElementById('source-modal').classList.remove('active');
  },

  // Helpers
  getSeverityClass(severity, isImportance = false) {
    const s = String(severity).toLowerCase();
    if (s === 'high') return 'badge-high';
    if (s === 'medium' || s === 'moderate') return 'badge-medium';
    if (s === 'low') return 'badge-low';
    return 'badge-info';
  },

  showError(message) {
    alert(`Error: ${message}`);
  }
};
