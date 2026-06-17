const express = require("express");
const router = express.Router();
const { v4: uuidv4 } = require("uuid");
const supabase = require("../database/client");

router.get("/", async (req, res) => {
  const { data, error } = await supabase
    .from("quotes")
    .select("*, leads(name, phone, project_type)")
    .order("created_at", { ascending: false });

  if (error) return res.status(500).json({ error: error.message });
  res.json(data);
});

router.post("/", async (req, res) => {
  const { lead_id, amount, notes } = req.body;
  if (!lead_id || !amount) return res.status(400).json({ error: "lead_id and amount required" });

  const { data, error } = await supabase
    .from("quotes")
    .insert({ id: uuidv4(), lead_id, amount, notes, created_at: new Date().toISOString() })
    .select()
    .single();

  if (error) return res.status(400).json({ error: error.message });
  res.status(201).json(data);
});

router.patch("/:id", async (req, res) => {
  const { amount, notes, status } = req.body;
  const { data, error } = await supabase
    .from("quotes")
    .update({ amount, notes, status })
    .eq("id", req.params.id)
    .select()
    .single();

  if (error) return res.status(400).json({ error: error.message });
  res.json(data);
});

module.exports = router;
