const express = require("express");
const router = express.Router();

const { getOrCreateContact } = require("../services/contacts");
const { saveMessage } = require("../services/conversations");
const { generateReply } = require("../ai/openai");
const { sendMessage } = require("../services/whatsapp");
const { upsertLead } = require("../services/leads");

/**
 * WhatsApp Webhook (Twilio)
 * Receives incoming messages from Twilio Sandbox
 */
router.post("/", async (req, res) => {
  try {
    const body = req.body;

    // Twilio WhatsApp format
    const phone = body.From?.replace("whatsapp:", "");
    const userText = body.Body?.trim();
    const profileName = body.ProfileName || null;

    if (!phone || !userText) {
      return res.sendStatus(200);
    }

    console.log(`📩 Incoming: ${phone} -> ${userText}`);

    // 1. Get or create contact
    const contact = await getOrCreateContact(phone, profileName);

    // 2. Generate AI reply (history fetched before saving current message)
    const { reply, isHotLead } = await generateReply(contact.id, userText);

    // 3. Save user message + bot reply AFTER generation
    await saveMessage(contact.id, userText, "user");
    await saveMessage(contact.id, reply, "bot");

    // 4. Send WhatsApp reply via Twilio API
    await sendMessage(phone, reply);

    // 5. Update lead data
    await upsertLead({
      contactId: contact.id,
      phone,
      name: contact.name || profileName,
      isHotLead,
      projectType: null,
      budget: null,
      timeline: null,
    });

    // IMPORTANT: Always respond quickly to Twilio
    return res.sendStatus(200);

  } catch (error) {
    console.error("❌ Webhook error:", error.message);

    // Still return 200 so Twilio doesn't retry spam
    return res.sendStatus(200);
  }
});

module.exports = router;
