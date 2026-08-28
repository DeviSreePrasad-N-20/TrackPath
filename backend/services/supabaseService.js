const { createClient } = require("@supabase/supabase-js");
const configured = Boolean(
  process.env.SUPABASE_URL && process.env.SUPABASE_SERVICE_ROLE_KEY,
);
const client = configured
  ? createClient(
      process.env.SUPABASE_URL,
      process.env.SUPABASE_SERVICE_ROLE_KEY,
    )
  : null;
const tables = {
  schemes: "schemes",
  trainees: "trainees",
  checkins: "check_ins",
  employerValidations: "employer_validations",
};

// A small adapter for the write flows. JSON remains the local-demo fallback;
// database reads can be migrated table-by-table without touching UI routes.
async function insert(table, row) {
  if (!configured) return null;
  const { data, error } = await client
    .from(tables[table])
    .insert(row)
    .select()
    .single();
  if (error) throw error;
  return data;
}
async function updateConsent(traineeId, consent) {
  if (!configured) return null;
  const { data, error } = await client
    .from("trainees")
    .update({ consent })
    .eq("id", traineeId)
    .select()
    .single();
  if (error) throw error;
  return data;
}
module.exports = { configured, insert, updateConsent };
