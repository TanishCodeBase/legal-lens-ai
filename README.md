# LegalLens AI

"Understand. Compare. Act — with AI-powered legal document assistance."

LegalLens AI is a GenAI-powered legal document intelligence application that helps users analyze complex legal documents, extract critical clauses, ask grounded questions, compare versions, and prepare for lawyer consultations.

## Features

- **Upload & Analyze**: Drag and drop PDF documents. The application uses Google's Gemini 2.5 Flash native document understanding to extract key terms, obligations, and important clauses.
- **AI Attention Score**: Highlights clauses that may require your attention based on financial exposure, termination conditions, or unusual obligations.
- **Ask Your Document**: A chat interface that grounds answers strictly in the uploaded document. If information is not in the document, it will tell you.
- **Compare Documents**: Compare two versions of a document to highlight substantive changes (money, deadlines, liabilities) rather than formatting differences.
- **Prepare for Lawyer**: Generates a structured briefing document containing case summaries, key issues, and questions for your lawyer.

## Architecture

LegalLens AI is built with a modern, modular architecture:

Frontend (HTML/CSS/Vanilla JS)
  ↓
Node.js / Express Backend
  ↓
Gemini Files API (Upload Document)
  ↓
Gemini 2.5 Flash Model
  ↓
Structured JSON Output
  ↓
Zod Schema Validation
  ↓
Source-Grounded UI Rendering

## Security & Legal Safety

- **API Keys are Hidden**: The Gemini API key is strictly maintained server-side via the `.env` file and is never exposed to the client.
- **Untrusted Input**: Uploaded PDFs are treated as untrusted data and sent to Gemini with explicit prompt-injection defense instructions.
- **No Legal Advice**: The application emphasizes informational assistance only and clearly displays persistent legal disclaimers.
- **No Hallucinations**: Responses require exact source citations (page, section, quote). If a document lacks information, the AI is instructed to explicitly state it was not found.

## Local Setup

1. **Install dependencies:**
   ```bash
   npm install
   ```

2. **Environment Configuration:**
   Copy `.env.example` to `.env` and add your Google Gemini API key:
   ```bash
   cp .env.example .env
   # Edit .env to set GEMINI_API_KEY
   ```

3. **Start the Application:**
   ```bash
   npm run dev
   ```

4. **Access the App:**
   Open `http://localhost:3000` in your browser.

## API Endpoints

- `GET /api/health` - Check service status.
- `POST /api/analyze` - Analyzes a document and extracts structured data.
- `POST /api/ask` - Answers a question strictly based on the uploaded document.
- `POST /api/compare` - Compares two uploaded documents.
- `POST /api/consultation` - Prepares a brief for a legal professional.

*All endpoints enforce strict JSON schema validation.*
