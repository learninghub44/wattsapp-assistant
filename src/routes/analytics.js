const express = require("express");
const router = express.Router();
const supabase = require("../database/client");

router.get("/", async (req, res) => {
  const [contacts, conversations, leads, quotes] = await Promise.all([
    supabase.from("contacts").select("id", { count: "exact" }),
    supabase.from("conversations").select("id", { count: "exact" }),
    supabase.from("leads").select("id, status, score", { count: "exact" }),
    supabase.from("quotes").select("amount"),
  ]);

  const leadsData = leads.data || [];
  const hotLeads = leadsData.filter((l) => l.status === "hot").length;
  const warmLeads = leadsData.filter((l) => l.status === "warm").length;
  const coldLeads = leadsData.filter((l) => l.status === "cold").length;
  const pipeline = (quotes.data || []).reduce((sum, q) => sum + Number(q.amount || 0), 0);

  res.json({
    total_contacts: contacts.count || 0,
    total_conversations: conversations.count || 0,
    total_leads: leads.count || 0,
    hot_leads: hotLeads,
    warm_leads: warmLeads,
    cold_leads: coldLeads,
    revenue_pipeline: pipeline,
  });
});

module.exports = router;
