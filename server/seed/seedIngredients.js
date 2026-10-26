require('dotenv').config();
const fs = require('fs');
const path = require('path');
const mongoose = require('mongoose');
const connectDB = require('../config/db');
const Ingredient = require('../models/Ingredient');

const CSV_PATH = path.join(__dirname, 'data', 'ingredients.csv');

// Minimal RFC4180-style CSV parser (handles quoted fields containing commas,
// escaped "" quotes, and quoted newlines). No external dependency required.
function parseCSV(text) {
  const rows = [];
  let row = [];
  let field = '';
  let inQuotes = false;

  for (let i = 0; i < text.length; i++) {
    const char = text[i];
    const next = text[i + 1];

    if (inQuotes) {
      if (char === '"' && next === '"') {
        field += '"';
        i++;
      } else if (char === '"') {
        inQuotes = false;
      } else {
        field += char;
      }
    } else {
      if (char === '"') {
        inQuotes = true;
      } else if (char === ',') {
        row.push(field);
        field = '';
      } else if (char === '\n' || char === '\r') {
        if (char === '\r' && next === '\n') i++; // handle \r\n
        row.push(field);
        rows.push(row);
        row = [];
        field = '';
      } else {
        field += char;
      }
    }
  }
  // last field/row (if file doesn't end with a newline)
  if (field.length > 0 || row.length > 0) {
    row.push(field);
    rows.push(row);
  }

  return rows.filter((r) => r.length > 1 || (r.length === 1 && r[0] !== ''));
}

// Splits a semicolon-separated CSV cell into a clean array of strings.
// e.g. "oily; acne-prone; combination" -> ["oily", "acne-prone", "combination"]
function splitList(value) {
  if (!value) return [];
  return value
    .split(';')
    .map((s) => s.trim())
    .filter(Boolean);
}

function toBoolean(value) {
  return String(value).trim().toLowerCase() === 'yes';
}

function toNumberOrNull(value) {
  const n = parseInt(value, 10);
  return Number.isNaN(n) ? null : n;
}

function mapRow(row) {
  return {
    slug: row.id,
    inciName: row.inci_name,
    commonName: row.common_name,
    alsoKnownAs: splitList(row.also_known_as),
    category: splitList(row.category),
    description: row.description || '',
    benefits: splitList(row.benefits),
    skinTypes: splitList(row.skin_types),
    concerns: splitList(row.concerns),
    comedogenicRating: toNumberOrNull(row.comedogenic_rating),
    irritancy: (row.irritancy || '').toLowerCase(),
    pregnancySafe: (row.pregnancy_safe || '').toLowerCase(),
    vegan: toBoolean(row.vegan),
    origin: (row.origin || '').toLowerCase(),
    typicalConcentration: row.typical_concentration || '',
    phRange: row.ph_range || '',
    timeOfUse: row.time_of_use || '',
    evidenceLevel: (row.evidence_level || '').toLowerCase(),
    pairsWellWith: splitList(row.pairs_well_with),
    avoidWith: splitList(row.avoid_with),
  };
}

async function seed() {
  if (!fs.existsSync(CSV_PATH)) {
    console.error(`Could not find ingredients.csv at ${CSV_PATH}`);
    console.error('Make sure the file is at server/seed/data/ingredients.csv');
    process.exit(1);
  }

  const csvText = fs.readFileSync(CSV_PATH, 'utf8');
  const rows = parseCSV(csvText);
  const header = rows[0];
  const dataRows = rows.slice(1);

  const ingredients = dataRows
    .map((cells) => {
      const obj = {};
      header.forEach((col, idx) => {
        obj[col] = cells[idx] !== undefined ? cells[idx] : '';
      });
      return obj;
    })
    .filter((row) => row.id)
    .map(mapRow);

  await connectDB();
  await Ingredient.deleteMany({});
  await Ingredient.insertMany(ingredients);
  console.log(`Seeded ${ingredients.length} ingredients.`);
  await mongoose.connection.close();
}

seed().catch((err) => {
  console.error(err);
  process.exit(1);
});
