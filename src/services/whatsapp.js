const twilio = require("twilio");

const client = twilio(
  process.env.TWILIO_ACCOUNT_SID,
  process.env.TWILIO_AUTH_TOKEN
);

// ALWAYS fixed for WhatsApp Sandbox
const FROM = "whatsapp:+14155238886";

/**
 * Send WhatsApp message via Twilio
 */
async function sendMessage(to, text) {
  try {
    const msg = await client.messages.create({
      from: FROM,
      to: `whatsapp:${to}`,
      body: text,
    });

    console.log("✅ Message sent:", msg.sid);
    return msg;

  } catch (err) {
    console.error("❌ Twilio send error:", err);
  }
}

/**
 * No-op for sandbox
 */
async function markAsRead() {}

module.exports = { sendMessage, markAsRead };
