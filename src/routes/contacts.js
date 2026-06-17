const express = require("express");
const router = express.Router();
const supabase = require("../database/client");

router.get("/", async (req, res) => {
  const { search } = req.query;
  let query = supabase.from("contacts").select("*").order("created_at", { ascending: false });
  if (search) query = query.ilike("name", `%${search}%`);

  const { data, error } = await query;
  if (error) return res.status(500).json({ error: error.message });
  res.json(data);
});

router.get("/:id", async (req, res) => {
  const { data, error } = await supabase
    .from("contacts")
    .select("*, conversations(*)")
    .eq("id", req.params.id)
    .single();

  if (error) return res.status(404).json({ error: "Contact not found" });
  res.json(data);
});

module.exports = router;
