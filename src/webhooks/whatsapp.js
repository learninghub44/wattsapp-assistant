const express = require("express");
const router = express.Router();

const { getOrCreateContact } = require("../services/contacts");
const { saveMessage } = require("../services/conversations");
const { generateReply } = require("../ai/openai");
const { sendMessage, markAsRead } = require("../services/whatsapp");
const { upsertLead } = require("../services/leads");

/**
 * Twilio sends POST with form data (not JSON)
 * No GET verification needed — Twilio uses a different auth model
 */
router.post("/", async (req, res) => {
  // Respond immediately with empty TwiML to prevent Twilio timeout
  res.set("Content-Type", "text/xml");
  res.send("<Response></Response>");

  try {
    const body = req.body;

    // Twilio fields
    const phone = body.From?.replace("whatsapp:", ""); // e.g. +2547XXXXXXXX
    const userText = body.Body?.trim();
    const profileName = body.ProfileName || null;

    if (!phone || !userText) return;

    console.log(`📩 Message from ${phone}: ${userText}`);

    await markAsRead(null); // no-op for Twilio

    // Get or create contact
    const contact = await getOrCreateContact(phone, profileName);

    // Save incoming message
    await saveMessage(contact.id, userText, "user");

    // Generate AI reply
    const { reply, isHotLead } = await generateReply(contact.id, userText);

    // Save bot reply
    await saveMessage(contact.id, reply, "bot");

    // Send reply via Twilio
    await sendMessage(phone, reply);

    // Upsert lead
    await upsertLead({
      contactId: contact.id,
      phone,
      name: contact.name || profileName,
      isHotLead,
      projectType: null,
      budget: null,
      timeline: null,
    });
  } catch (err) {
    console.error("Webhook processing error:", err.message);
  }
});

module.exports = router;
