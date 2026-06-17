const twilio = require("twilio");

const client = twilio(
  process.env.TWILIO_ACCOUNT_SID,
  process.env.TWILIO_AUTH_TOKEN
);

const FROM = `whatsapp:${process.env.TWILIO_WHATSAPP_NUMBER}`;

/**
 * Send a WhatsApp message via Twilio
 */
async function sendMessage(to, text) {
  try {
    const msg = await client.messages.create({
      from: FROM,
      to: `whatsapp:${to}`,
      body: text,
    });
    return msg;
  } catch (err) {
    console.error("Twilio send error:", err.message);
    throw err;
  }
}

/**
 * Mark as read — not supported in Twilio sandbox, no-op
 */
async function markAsRead(messageId) {
  // Twilio sandbox does not support read receipts
}

module.exports = { sendMessage, markAsRead };
