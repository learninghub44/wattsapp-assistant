const { v4: uuidv4 } = require("uuid");
const supabase = require("../database/client");
const { scoreLead } = require("./leadScoring");
const { notifyHotLead } = require("../notifications/notify");

/**
 * Upsert a lead for a contact.
 * Scores it and sends notification if hot.
 */
async function upsertLead({ contactId, phone, name, projectType, budget, timeline, isHotLead }) {
  const { score, tier } = scoreLead({ budget, timeline, isHotLead });

  // Check if lead already exists for this contact
  const { data: existing } = await supabase
    .from("leads")
    .select("id")
    .eq("phone", phone)
    .single();

  const leadData = {
    name,
    phone,
    project_type: projectType,
    budget,
    timeline,
    score,
    status: tier,
    updated_at: new Date().toISOString(),
  };

  let leadId;

  if (existing) {
    await supabase.from("leads").update(leadData).eq("id", existing.id);
    leadId = existing.id;
  } else {
    const newLead = {
      id: uuidv4(),
      ...leadData,
      created_at: new Date().toISOString(),
    };
    await supabase.from("leads").insert(newLead);
    leadId = newLead.id;
  }

  // Notify Chris if hot lead
  if (tier === "hot") {
    await notifyHotLead({ name, phone, project_type: projectType, budget, timeline, score }).catch(
      (err) => console.error("Notification error:", err.message)
    );
  }

  return { leadId, score, tier };
}

module.exports = { upsertLead };
