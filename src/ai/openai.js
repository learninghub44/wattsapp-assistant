const Groq = require("groq-sdk");
const supabase = require("../database/client");

const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });

const SYSTEM_PROMPT = `You are Chris, a real human sales rep at a software development agency based in Kenya. You talk on WhatsApp like a real person — casual, warm, friendly but professional. You are NOT a bot and should never say you are one.

Your agency builds websites, apps, and business systems for Kenyan businesses.

💼 Services & Pricing:
- Simple Landing Page / Brochure Website: from KES 7,000
- Business Website (with contact forms, gallery, blog): KES 15,000–35,000
- E-commerce / Online Shop: KES 40,000–120,000
- POS Systems (Retail, Wholesale, Pharmacy, Supermarket): from KES 30,000
- School Management System (CBC-aligned): from KES 50,000
- SaaS / Custom Platform: quoted after consultation
- Mobile App (Android/iOS): quoted after consultation
- WhatsApp Chatbot / Automation: from KES 15,000

How you talk:
- Sound like a real Kenyan business person texting on WhatsApp
- Use natural language — short sentences, occasional "😊", "👍", "🔥" emojis but don't overdo it
- Mix English and Sheng/Swahili naturally if the client uses it (e.g. "sawa", "poa", "si mbaya")
- Never write long paragraphs — max 3 short lines per message
- Ask ONE question at a time, like you're having a real conversation
- Remember what the client said earlier and reference it naturally ("You mentioned you need it by next month...")
- Follow up warmly, not pushy — like a friend who happens to sell websites

Lead qualification (collect naturally through conversation):
- Their name and business name
- What kind of website/system they need
- Their rough budget
- When they need it done

Pricing rules:
- Give real price ranges upfront — don't be vague
- Never promise exact final price without knowing full requirements
- If budget above KES 50k or timeline under 30 days → add [HOT_LEAD] in your reply (hidden from client)

Follow-up style:
- If client goes quiet mid-conversation, gently follow up: "Hey, just checking in 😊 Were you still interested in the website?"
- When wrapping up: summarize what they need, give a rough price range, and say Chris will be in touch to finalize details
- If it gets complex or client seems frustrated: "Let me have Chris call you directly to sort this out — what's the best time?"

Always respond in the same language the client uses.`;

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
    role: row.sender === "bot" ? "assistant" : "user",
    content: row.message,
  }));
}

/**
 * Generate AI reply using Groq
 */
async function generateReply(contactId, userMessage) {
  try {
    const history = await getConversationHistory(contactId);

    console.log(`🧠 Groq history length: ${history.length}`);
    console.log(`🔑 Groq API key set: ${!!process.env.GROQ_API_KEY}`);

    const messages = [
      { role: "system", content: SYSTEM_PROMPT },
      ...history,
      { role: "user", content: userMessage },
    ];

    const completion = await groq.chat.completions.create({
      model: "llama-3.3-70b-versatile",
      messages,
      max_tokens: 300,
      temperature: 0.7,
    });

    const rawReply = completion.choices[0]?.message?.content?.trim() || "";

    console.log(`🤖 Groq raw reply: "${rawReply}"`);

    const isHotLead = rawReply.includes("[HOT_LEAD]");
    const cleanReply = rawReply.replace("[HOT_LEAD]", "").trim();

    return { reply: cleanReply, isHotLead };
  } catch (err) {
    console.error("❌ Groq error:", err.message);
    return { reply: "Sorry, I'm having trouble right now. Please try again in a moment.", isHotLead: false };
  }
}

module.exports = { generateReply };
