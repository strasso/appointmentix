// airtable_setup_leads.mjs
// Node 18+ required (built-in fetch)

const BASE_ID = "apphfTtIe0YFSJBqc";
const API = "https://api.airtable.com/v0";
const META = `${API}/meta/bases/${BASE_ID}`;

const token = process.env.AIRTABLE_TOKEN;
if (!token) {
  console.error("ERROR: Missing AIRTABLE_TOKEN env var (Airtable Personal Access Token).");
  process.exit(1);
}

const headers = {
  Authorization: `Bearer ${token}`,
  "Content-Type": "application/json",
};

async function req(method, url, body) {
  const res = await fetch(url, {
    method,
    headers,
    body: body ? JSON.stringify(body) : undefined,
  });
  const text = await res.text();
  let json;
  try { json = text ? JSON.parse(text) : null; } catch { json = text; }
  if (!res.ok) {
    throw new Error(`${method} ${url} -> ${res.status} ${res.statusText}\n${JSON.stringify(json, null, 2)}`);
  }
  return json;
}

async function listTables() {
  return req("GET", `${META}/tables`);
}

async function patchTable(tableId, body) {
  return req("PATCH", `${META}/tables/${tableId}`, body);
}

async function createField(tableId, body) {
  return req("POST", `${META}/tables/${tableId}/fields`, body);
}

async function patchField(tableId, fieldId, body) {
  return req("PATCH", `${META}/tables/${tableId}/fields/${fieldId}`, body);
}

async function deleteField(tableId, fieldId) {
  return req("DELETE", `${META}/tables/${tableId}/fields/${fieldId}`);
}

function findFieldByName(fields, name) {
  return fields.find(f => f.name.trim().toLowerCase() === name.trim().toLowerCase());
}

async function ensureField(tableId, fields, spec) {
  // spec: { name, type, options?, description? }
  const existing = findFieldByName(fields, spec.name);
  if (existing) {
    // Update type/options only if needed (Airtable doesn't allow changing type in all cases; we keep safe updates)
    const patch = { name: spec.name };
    if (spec.description !== undefined) patch.description = spec.description;

    // For select/rating fields we can safely update options.
    if (spec.type === "singleSelect") {
      patch.type = "singleSelect";
      patch.options = spec.options;
    }
    if (spec.type === "rating") {
      patch.type = "rating";
      patch.options = spec.options;
    }
    // For basic types, just ensure name/description (type changes can error if mismatched)
    await patchField(tableId, existing.id, patch);
    return { action: "updated", fieldId: existing.id };
  }

  // Create new field
  const createBody = {
    name: spec.name,
    type: spec.type,
  };
  if (spec.description !== undefined) createBody.description = spec.description;
  if (spec.options) createBody.options = spec.options;

  const created = await createField(tableId, createBody);
  return { action: "created", fieldId: created.id };
}

async function main() {
  const changes = [];

  const tablesPayload = await listTables();
  const table = tablesPayload.tables.find(t => t.name === "Table 1") || tablesPayload.tables[0];
  if (!table) throw new Error("No table found in base.");

  const tableId = table.id;

  // Rename table -> Leads (idempotent)
  if (table.name !== "Leads") {
    await patchTable(tableId, { name: "Leads" });
    changes.push(`Table renamed: "${table.name}" -> "Leads"`);
  }

  // Refresh schema after rename
  const fresh = await listTables();
  const leadsTable = fresh.tables.find(t => t.id === tableId);
  if (!leadsTable) throw new Error("Could not re-fetch table schema.");
  const fields = leadsTable.fields;

  // Rename Name -> Klinikname
  const fName = findFieldByName(fields, "Name");
  if (fName && fName.name !== "Klinikname") {
    await patchField(tableId, fName.id, { name: "Klinikname" });
    changes.push(`Field renamed: "Name" -> "Klinikname"`);
  }

  // Rename Notes -> Notizen
  const fNotes = findFieldByName(fields, "Notes");
  if (fNotes && fNotes.name !== "Notizen") {
    await patchField(tableId, fNotes.id, { name: "Notizen" });
    changes.push(`Field renamed: "Notes" -> "Notizen"`);
  }

  // Update Status single select options (and ensure it’s named "Status")
  const fStatus = findFieldByName(fields, "Status");
  if (fStatus) {
    const desiredChoices = [
      "Neu",
      "Angerufen",
      "Termin vereinbart",
      "Demo gehabt",
      "Follow-up",
      "Kein Interesse",
      "Später melden",
    ].map(name => ({ name }));

    await patchField(tableId, fStatus.id, {
      name: "Status",
      type: "singleSelect",
      options: { choices: desiredChoices },
    });
    changes.push(`Status options updated (${desiredChoices.length} choices)`);
  } else {
    // Create Status if missing
    const desiredChoices = [
      "Neu","Angerufen","Termin vereinbart","Demo gehabt","Follow-up","Kein Interesse","Später melden",
    ].map(name => ({ name }));
    await createField(tableId, { name: "Status", type: "singleSelect", options: { choices: desiredChoices } });
    changes.push(`Status field created + options set`);
  }

  // Delete unwanted fields if present
  const deleteNames = ["Assignee", "Attachments", "Attachment Summary"];
  for (const dn of deleteNames) {
    const f = findFieldByName(fields, dn);
    if (f) {
      await deleteField(tableId, f.id);
      changes.push(`Field deleted: "${dn}"`);
    }
  }

  // Re-fetch schema again after deletes (field list changed)
  const fresh2 = await listTables();
  const leads2 = fresh2.tables.find(t => t.id === tableId);
  const fields2 = leads2.fields;

  // Create/ensure new fields
  const fieldSpecs = [
    { name: "Ansprechpartner", type: "singleLineText" },
    { name: "Telefon", type: "phoneNumber" },
    { name: "Email", type: "email" },
    { name: "Stadt", type: "singleLineText" },
    { name: "Größe", type: "singleSelect", options: { choices: [{name:"Solo"},{name:"2-5 Mitarbeiter"},{name:"Klinik"}] } },
    { name: "Quelle", type: "singleSelect", options: { choices: [{name:"Google"},{name:"Instagram"},{name:"Empfehlung"},{name:"Walk-in"},{name:"Event"}] } },
    { name: "Letzter Kontakt", type: "date", options: { dateFormat: { name: "local" } } },
    { name: "Nächster Follow-up", type: "date", options: { dateFormat: { name: "local" } } },
    { name: "Interesse", type: "rating", options: { max: 5, icon: "star", color: "yellowBright" } },
    { name: "Einwand", type: "multilineText" },
  ];

  for (const spec of fieldSpecs) {
    const result = await ensureField(tableId, fields2, spec);
    changes.push(`${spec.name}: ${result.action}`);
  }

  console.log("✅ Airtable setup complete.");
  console.log("Changes:");
  for (const c of changes) console.log(" -", c);
}

main().catch(err => {
  console.error("❌ Failed:", err.message);
  process.exit(1);
});
