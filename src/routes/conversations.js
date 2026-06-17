const express = require("express");
const router = express.Router();
const supabase = require("../database/client");

// Get all conversations for a contact
router.get("/:contactId", async (req, res) => {
  const { data, error } = await supabase
    .from("conversations")
    .select("*")
    .eq("contact_id", req.params.contactId)
    .order("created_at", { ascending: true });

  if (error) return res.status(500).json({ error: error.message });
  res.json(data);
});

module.exports = router;
