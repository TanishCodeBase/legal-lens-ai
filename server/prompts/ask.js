const askPrompt = (question) => `Answer the following user question using only the provided document.

User Question: "${question}"

1. Determine whether the document contains sufficient information.
2. If yes, answer clearly and cite relevant sources.
3. If no, do not infer missing information.
4. Set grounded=false.
5. Set notFound=true.
6. State that the information was not found in the provided document.

Do not provide definitive legal advice.`;

module.exports = askPrompt;
