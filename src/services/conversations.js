const { v4: uuidv4 } = require("uuid");
const supabase = require("../database/client");

/**
 * Save a message to conversations table
 * sender: 'user' | 'bot'
 */
async function saveMessage(contactId, message, sender = "user") {
  const { error } = await supabase.from("conversations").insert({
    id: uuidv4(),
    contact_id: contactId,
    message,
    sender,
    created_at: new Date().toISOString(),
  });

  if (error) console.error("Save message error:", error.message);
}

module.exports = { saveMessage };
