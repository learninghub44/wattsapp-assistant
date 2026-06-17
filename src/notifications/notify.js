const { sendMessage } = require("../services/whatsapp");

// Add as many numbers as you want here (international format with +)
const NOTIFY_NUMBERS = [
  process.env.YOUR_WHATSAPP_NUMBER_1,
  process.env.YOUR_WHATSAPP_NUMBER_2,
  process.env.YOUR_WHATSAPP_NUMBER_3,
].filter(Boolean); // removes any that are empty

async function notifyHotLead(lead) {
  const message = `🔥 *New Hot Lead!*

👤 Name: ${lead.name || "Unknown"}
📱 Phone: ${lead.phone}
💼 Project: ${lead.project_type || "Not specified"}
💰 Budget: ${lead.budget || "Not specified"}
📅 Timeline: ${lead.timeline || "Not specified"}
⭐ Score: ${lead.score}

Reply to them now before they go elsewhere!`;

  for (const number of NOTIFY_NUMBERS) {
    await sendMessage(number, message).catch((err) =>
      console.error(`Notify error for ${number}:`, err.message)
    );
  }
}

module.exports = { notifyHotLead };