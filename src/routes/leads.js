const express = require("express");
const router = express.Router();
const supabase = require("../database/client");

// GET all leads with optional filter
router.get("/", async (req, res) => {
  const { status, search } = req.query;

  let query = supabase.from("leads").select("*").order("created_at", { ascending: false });

  if (status) query = query.eq("status", status);
  if (search) query = query.ilike("name", `%${search}%`);

  const { data, error } = await query;
  if (error) return res.status(500).json({ error: error.message });
  res.json(data);
});

// GET single lead
router.get("/:id", async (req, res) => {
  const { data, error } = await supabase.from("leads").select("*").eq("id", req.params.id).single();
  if (error) return res.status(404).json({ error: "Lead not found" });
  res.json(data);
});

// PATCH update lead status
router.patch("/:id", async (req, res) => {
  const { status, notes } = req.body;
  const { data, error } = await supabase
    .from("leads")
    .update({ status, notes, updated_at: new Date().toISOString() })
    .eq("id", req.params.id)
    .select()
    .single();

  if (error) return res.status(400).json({ error: error.message });
  res.json(data);
});

module.exports = router;
