const { v4: uuidv4 } = require("uuid");
const supabase = require("../database/client");

/**
 * Get existing contact or create a new one by phone number
 */
async function getOrCreateContact(phone, name = null) {
  // Try to find existing
  const { data: existing } = await supabase
    .from("contacts")
    .select("*")
    .eq("phone", phone)
    .single();

  if (existing) {
    // Update name if we have one now
    if (name && !existing.name) {
      await supabase.from("contacts").update({ name }).eq("id", existing.id);
      return { ...existing, name };
    }
    return existing;
  }

  // Create new contact
  const newContact = {
    id: uuidv4(),
    phone,
    name,
    created_at: new Date().toISOString(),
  };

  const { data, error } = await supabase
    .from("contacts")
    .insert(newContact)
    .select()
    .single();

  if (error) throw new Error(`Failed to create contact: ${error.message}`);
  return data;
}

module.exports = { getOrCreateContact };
