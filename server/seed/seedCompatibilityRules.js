require('dotenv').config();
const fs = require('fs');
const path = require('path');
const mongoose = require('mongoose');
const connectDB = require('../config/db');
const CompatibilityRule = require('../models/CompatibilityRule');
const IngredientGroup = require('../models/IngredientGroup');

const JSON_PATH = path.join(__dirname, 'data', 'compatibility_rules.json');

async function seed() {
  if (!fs.existsSync(JSON_PATH)) {
    console.error(`Could not find compatibility_rules.json at ${JSON_PATH}`);
    console.error('Make sure the file is at server/seed/data/compatibility_rules.json');
    process.exit(1);
  }

  const data = JSON.parse(fs.readFileSync(JSON_PATH, 'utf8'));

  // Turn { "retinoids": ["retinol", "adapalene", ...], ... } into IngredientGroup docs
  const groupDocs = Object.entries(data.groups).map(([key, ingredientSlugs]) => ({
    key,
    ingredientSlugs,
  }));

  // Turn each rule's { a, b, severity, reason, recommendation } into a CompatibilityRule doc
  const ruleDocs = data.rules.map((r) => ({
    groupA: r.a,
    groupB: r.b,
    severity: r.severity,
    reason: r.reason,
    recommendation: r.recommendation,
  }));

  await connectDB();
  await IngredientGroup.deleteMany({});
  await IngredientGroup.insertMany(groupDocs);
  await CompatibilityRule.deleteMany({});
  await CompatibilityRule.insertMany(ruleDocs);

  console.log(`Seeded ${groupDocs.length} ingredient groups.`);
  console.log(`Seeded ${ruleDocs.length} compatibility rules.`);
  await mongoose.connection.close();
}

seed().catch((err) => {
  console.error(err);
  process.exit(1);
});
