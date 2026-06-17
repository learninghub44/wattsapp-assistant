const { GoogleGenerativeAI } = require("@google/generative-ai");
const supabase = require("../database/client");

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

const SYSTEM_PROMPT = `You are Chris AI Assistant, a professional sales and support bot for a software development business based in Kenya.

Services offered:
- Business Websites (KES 20,000–50,000)
- E-commerce Websites (KES 50,000–150,000)
- POS Systems (Retail, Wholesale, Pharmacy, Supermarket)
- SaaS/Custom Platform Development (quoted after consultation)
- Mobile Apps (quoted after consultation)
- School Management Systems

Rules:
1. Be warm, professional, and concise.
2. Ask ONE question at a time — never overwhelm the client.
3. Qualify leads by collecting: name, business name, project type, budget range, timeline.
4. When asking about budget, give them ranges to pick from (e.g. "Under KES 20k / KES 20–50k / Above KES 50k").
5. Never promise exact prices — always say prices are quoted after a detailed consultation.
6. If a client has a budget above KES 50,000 or timeline under 30 days, tag the conversation as HOT_LEAD in your response using [HOT_LEAD] marker.
7. If requirements become complex or the client is frustrated, say: "Let me connect you with Chris directly for this."
8. Always end conversations by summarizing what was collected and saying Chris will follow up soon.
9. Respond in the same language the client uses (Swahili/English).
10. Keep responses short — this is WhatsApp, not email.`;

/**
 * Get conversation history for a contact from Supabase
 */
async function getConversationHistory(contactId, limit = 20) {
  const { data } = await supabase
    .from("conversations")
    .select("message, sender, created_at")
    .eq("contact_id", contactId)
    .order("created_at", { ascending: true })
    .limit(limit);

  return (data || []).map((row) => ({
    role: row.sender === "bot" ? "model" : "user",
    parts: [{ text: row.message }],
  }));
}

/**
 * Generate AI reply using Gemini (free)
 */
async function generateReply(contactId, userMessage) {
  try {
    const history = await getConversationHistory(contactId);

    console.log(`🧠 Gemini history length: ${history.length}`);
    console.log(`🔑 Gemini API key set: ${!!process.env.GEMINI_API_KEY}`);

    const model = genAI.getGenerativeModel({
      model: "gemini-2.0-flash",
      systemInstruction: SYSTEM_PROMPT,
    });

    const chat = model.startChat({ history });

    const result = await chat.sendMessage(userMessage);
    const rawReply = result.response.text().trim();

    console.log(`🤖 Gemini raw reply: "${rawReply}"`);

    const isHotLead = rawReply.includes("[HOT_LEAD]");
    const cleanReply = rawReply.replace("[HOT_LEAD]", "").trim();

    return { reply: cleanReply, isHotLead };
  } catch (err) {
    console.error("❌ Gemini error:", err.message);
    return { reply: "Sorry, I'm having trouble right now. Please try again in a moment.", isHotLead: false };
  }
}

module.exports = { generateReply };
