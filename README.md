# LegalLens AI

> **Understand. Compare. Act — with AI-powered legal document assistance.**

LegalLens AI is a **GenAI-powered legal document intelligence platform** that helps users understand complex legal documents, identify important clauses and obligations, ask document-grounded questions, compare document versions, and prepare for conversations with legal professionals.

> ⚖️ **Legal Disclaimer:** LegalLens AI provides informational assistance based on documents supplied by the user. It does not provide legal advice, determine legal validity, predict legal outcomes, or replace a qualified legal professional.

---

## ✨ Features

### 📄 Upload & Analyze

Upload a legal PDF and let Gemini analyze the document to extract:

- Document information
- Key terms
- Parties and dates
- Obligations
- Important clauses
- Potential areas requiring attention
- Suggested next steps
- Questions to discuss with a lawyer

### 🎯 AI Attention Score

LegalLens generates an **AI Attention Score** to help users prioritize clauses that may deserve closer review.

The analysis considers factors such as:

- Financial exposure
- Duration and commitments
- Termination conditions
- Penalties
- Unusual or one-sided obligations
- Ambiguous language
- Missing important information

> **Important:** The Attention Score is a review-prioritization mechanism. It is **not** a legal validity score, compliance score, or prediction of legal outcomes.

### 💬 Ask Your Document

Ask questions about the uploaded legal document using a grounded AI interface.

LegalLens is designed to:

- Answer using the provided document
- Provide supporting source references
- Identify the relevant page or section
- Avoid inventing information not present in the document
- Indicate when the requested information cannot be found

**Example:**

> What happens if I terminate the lease early?

The AI provides an answer based on the relevant clause in the uploaded document.

### 🔄 Compare Documents

Compare two versions of a legal document and identify meaningful changes.

LegalLens can highlight changes involving:

- Money
- Deadlines
- Obligations
- Liabilities
- Termination conditions
- Other important contractual terms

Each identified change includes an explanation and source references from the relevant documents.

### 👨‍⚖️ Prepare for Lawyer

LegalLens can transform document findings into a structured preparation brief containing:

- Case/document summary
- Key issues
- Important clauses
- Questions to ask a lawyer
- Documents to bring
- Relevant timeline events

This feature helps users prepare for a discussion with a legal professional rather than attempting to replace one.

---

## 🧠 How It Works

```text
User
  ↓
LegalLens Web Interface
  ↓
Node.js / Express Backend
  ↓
Gemini Files API
  ↓
Gemini Flash Model
  ↓
Structured JSON Output
  ↓
Zod Schema Validation
  ↓
Source-Grounded UI
```

---

### Processing Flow

1. User uploads a legal PDF.
2. The backend uploads the document through the Gemini Files API.
3. Gemini performs native document understanding.
4. Gemini generates structured JSON according to the required schema.
5. Zod validates the generated response.
6. Validated results are passed to the frontend.
7. LegalLens renders summaries, clauses, sources, attention insights, and recommended actions.

---

## 🤖 GenAI Architecture

GenAI is central to the LegalLens workflow rather than being used only as a conversational chatbot.

### 1. Document Understanding

Gemini processes uploaded legal documents and extracts relevant information from their contents.

### 2. Structured Legal Document Analysis

Gemini generates structured information including:

- Document metadata
- Key terms
- Obligations
- Clauses
- Attention indicators
- Next steps
- Lawyer questions

### 3. Grounded Question Answering

Gemini answers questions using the provided document context and returns supporting source information.

If the requested information cannot be found, the system is instructed to indicate that rather than fabricate an answer.

### 4. Semantic Document Comparison

Gemini compares two documents and identifies substantive differences rather than simply comparing formatting or text positions.

### 5. Lawyer Consultation Preparation

Gemini transforms document findings into a structured preparation brief containing issues, questions, important clauses, and relevant timeline information.

### 6. Structured Output Validation

AI-generated JSON is validated using **Zod schemas** before being rendered by the application.

---

## 🔐 Security & Legal Safety

LegalLens includes safeguards designed specifically for document-grounded legal assistance.

### API Key Protection

The Gemini API key is stored server-side through environment variables and is never exposed to the frontend.

### Untrusted Document Handling

Uploaded documents are treated as **untrusted input**.

The AI instructions explicitly tell the model not to follow instructions contained inside uploaded documents.

### Source Grounding

The system requests source information such as:

- Page
- Section
- Quote

The application is designed to avoid fabricating source information.

### Legal Safety

LegalLens is designed to provide **informational assistance**, not legal advice.

The system distinguishes between:

- Facts found in the document
- Interpretation of document language
- Uncertainty or missing information

Users are encouraged to consult a qualified legal professional for advice concerning their specific situation.

---

## 🏗️ Project Structure

```text
legal-lens-ai/
│
├── client/
│   ├── index.html
│   ├── css/
│   └── js/
│
├── server/
│   ├── routes/
│   │   ├── analyze.js
│   │   ├── ask.js
│   │   ├── compare.js
│   │   └── consultation.js
│   │
│   ├── services/
│   │   ├── gemini.js
│   │   ├── document.js
│   │   └── validation.js
│   │
│   ├── prompts/
│   │   ├── system.js
│   │   ├── analyze.js
│   │   ├── qa.js
│   │   └── comparison.js
│   │
│   ├── schemas/
│   │   ├── analyze.schema.js
│   │   ├── ask.schema.js
│   │   ├── compare.schema.js
│   │   └── consultation.schema.js
│   │
│   └── server.js
│
├── .env.example
├── .gitignore
├── package.json
├── package-lock.json
└── README.md
```

---

### Directory Overview

| Directory | Purpose |
|---|---|
| `client/` | Frontend interface |
| `server/routes/` | API endpoint handlers |
| `server/services/` | Gemini integration, document processing, and validation |
| `server/prompts/` | System and feature-specific AI prompts |
| `server/schemas/` | Structured response schemas |
| `.env.example` | Environment variable template |

---

## 🛠️ Tech Stack

- **Frontend:** HTML, CSS, Vanilla JavaScript
- **Backend:** Node.js, Express
- **AI:** Google Gemini API
- **Document Processing:** Gemini Files API
- **Structured Output:** JSON Schema
- **Validation:** Zod
- **Development:** npm / Node.js

### Gemini Configuration

LegalLens uses a primary and fallback Gemini Flash model:

```env
GEMINI_MODEL=gemini-3.8-flash
GEMINI_FALLBACK_MODEL=gemini-3.7-flash
```

---

## 🧪 AI Reliability & Error Handling

LegalLens includes backend safeguards for AI service failures.

The Gemini integration supports:

- Primary model retry for temporary `503` service-unavailable errors
- Fallback to a secondary Gemini model
- `429` quota-exhaustion handling
- Structured JSON validation
- Safe error responses
- Protection against infinite fallback/retry loops

These mechanisms help the application handle temporary AI service availability issues without exposing internal errors or API credentials to users.

---

## ⚖️ Legal Disclaimer

**LegalLens AI provides informational assistance based on documents supplied by the user.**

It does not:

- Provide legal advice
- Determine whether a document is legally valid
- Determine legal compliance
- Predict legal outcomes
- Replace a lawyer or other qualified legal professional

Users should consult an appropriate legal professional for advice regarding their specific legal situation.

---

## 🚧 Project Status

LegalLens AI is a **GenAI hackathon project/prototype** focused on improving access to understandable, document-grounded legal information.

The current implementation focuses on:

- Legal document analysis
- Source-grounded Q&A
- Document comparison
- Attention prioritization
- Lawyer consultation preparation

---

## 🔮 Future Improvements

Potential future improvements include:

- 📑 Rich PDF viewer with clickable source navigation
- 📚 Persistent document history
- 📄 Support for additional document formats
- 🌐 Multilingual legal document support
- 🔐 User authentication and secure document storage
- 📊 Expanded document analysis and evaluation
- 🔎 More advanced source and clause navigation
