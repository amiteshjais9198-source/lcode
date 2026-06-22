const { GoogleGenerativeAI } = require("@google/generative-ai");

const GEMINI_API_KEYS = (process.env.GEMINI_API_KEYS || process.env.GEMINI_API_KEY || '').split(',').map(s => s.trim()).filter(Boolean);

const solveDoubt = async (req, res) => {
    try {
        const { messages, code, problemTitle, language } = req.body;

        if (!messages || !Array.isArray(messages) || messages.length === 0) {
            return res.status(400).json({ success: false, message: "Messages array is required" });
        }

        if (GEMINI_API_KEYS.length === 0) {
            throw new Error("Gemini API keys are missing in environment variables");
        }

        // The frontend sends the entire chat history including the latest message.
        // We separate the latest message (the actual prompt) from the past history.
        const latestMessage = messages[messages.length - 1];

        // Format history for Gemini API (roles must be "user" or "model")
        let history = messages.slice(0, -1).map(msg => ({
            role: msg.role === 'user' ? 'user' : 'model',
            parts: [{ text: msg.content }]
        }));

        // Gemini strictly requires the first message in history to be from 'user'
        if (history.length > 0 && history[0].role === 'model') {
            history.shift(); // Remove the initial 'Hi there' greeting
        }

        // If it's the very first user message, we append the problem details and code as context.
        let promptText = latestMessage.content;
        if (messages.length === 2 && code) { // length is 2 because frontend adds an initial greeting message
            promptText = `Context:\nProblem Title: ${problemTitle}\nSelected Language: ${language}\nCurrent Editor Code:\n\`\`\`${language}\n${code}\n\`\`\`\n\nUser's Question: ${latestMessage.content}`;
        }

        let responseText = null;
        let lastError = null;

        for (let i = 0; i < GEMINI_API_KEYS.length; i++) {
            try {
                // Initialize the Gemini model with current key in the loop
                const genAI = new GoogleGenerativeAI(GEMINI_API_KEYS[i]);
                const model = genAI.getGenerativeModel({
                    model: "gemini-3.5-flash",
                    systemInstruction: "You are a helpful expert AI coding assistant on AlgoVerse. You help users debug their code, explain concepts, and provide hints. Keep your answers concise, clear, and formatted using markdown. Avoid giving away the full exact solution immediately unless the user explicitly asks for the full code. Encourage them to learn AND abuse the user if they ask other question in place of coding then reply him warmly to do coding question only  the answer should be professional and in english and if u are giving code than it should be in editor format ."
                });

                // Start chat with history
                const chat = model.startChat({
                    history: history,
                });

                const result = await chat.sendMessage(promptText);
                responseText = result.response.text();
                break; // Success! Break out of the retry loop.
            } catch (err) {
                lastError = err;
                console.warn(`Gemini key index ${i} failed. Trying next... (${err.message})`);
                continue; // Try next key
            }
        }

        if (responseText === null) {
            throw lastError || new Error("All Gemini API keys exhausted or failed.");
        }

        return res.status(200).json({
            success: true,
            data: {
                role: 'ai',
                content: responseText
            }
        });

    } catch (error) {
        console.error("AI Error:", error.message || error);
        return res.status(500).json({ success: false, message: "AI Assistant is currently unavailable." });
    }
}

module.exports = solveDoubt;