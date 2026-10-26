/**
 * Routine compatibility checker (group-based).
 *
 * Rules live between GROUPS (e.g. "retinoids" vs "aha"), not individual
 * ingredients — see server/seed/data/compatibility_rules.json. This means
 * one rule automatically covers every ingredient in both groups.
 *
 * Products store loose free-text ingredient names (e.g. "vitamin c",
 * "salicylic acid", "aha"). ALIAS_TO_SLUG / ALIAS_TO_GROUP below translate
 * that free text into the canonical slugs/groups used by the rules data.
 * Coverage will keep improving automatically as product ingredient lists
 * are tightened up over time — no code changes needed, just better data.
 */

const CompatibilityRule = require('../models/CompatibilityRule');
const IngredientGroup = require('../models/IngredientGroup');

// Free-text ingredient name -> canonical ingredient slug (matches ingredients.csv "id" column)
const ALIAS_TO_SLUG = {
  'niacinamide': 'niacinamide',
  'salicylic acid': 'salicylic-acid',
  'retinol': 'retinol',
  'squalane': 'squalane',
  'vitamin c': 'ascorbic-acid',
  'hyaluronic acid': 'hyaluronic-acid',
  'azelaic acid': 'azelaic-acid',
  'lactic acid': 'lactic-acid',
  'glycolic acid': 'glycolic-acid',
  'zinc oxide': 'zinc-oxide',
  'titanium dioxide': 'titanium-dioxide',
  'ceramides': 'ceramide-np',
  'glycerin': 'glycerin',
};

// Free-text ingredient name -> group key directly (used when a product lists a
// generic category rather than one specific ingredient, e.g. "aha", "uv filters")
const ALIAS_TO_GROUP = {
  'aha': 'aha',
  'bha': 'bha',
  'peptides': 'peptides',
  'copper peptides': 'copper_peptides',
  'uv filters': 'sunscreen',
};

const GROUP_LABELS = {
  retinoids: 'Retinoids',
  vitamin_c_pure: 'Vitamin C (Pure)',
  vitamin_c_derivative: 'Vitamin C (Derivative)',
  aha: 'AHA',
  bha: 'BHA',
  pha: 'PHA',
  benzoyl_peroxide: 'Benzoyl Peroxide',
  copper_peptides: 'Copper Peptides',
  peptides: 'Peptides',
  niacinamide: 'Niacinamide',
  hydrators: 'Hydrators',
  barrier_lipids: 'Barrier Lipids (Ceramides/Squalane)',
  soothers: 'Soothing Ingredients',
  azelaic: 'Azelaic Acid',
  sunscreen: 'Sunscreen Filters',
};

// Severities that count as an actual warning vs. a positive/informational match
const CONFLICT_SEVERITIES = ['avoid', 'caution'];

let slugToGroupsCache = null;

async function getSlugToGroupsMap() {
  if (slugToGroupsCache) return slugToGroupsCache;

  const groups = await IngredientGroup.find({});
  const map = {};
  groups.forEach((g) => {
    g.ingredientSlugs.forEach((slug) => {
      if (!map[slug]) map[slug] = [];
      map[slug].push(g.key);
    });
  });
  slugToGroupsCache = map;
  return map;
}

// Resolves one free-text ingredient name to whichever group key(s) it belongs to.
function resolveIngredientGroups(rawText, slugToGroups) {
  const text = String(rawText).trim().toLowerCase();

  if (ALIAS_TO_GROUP[text]) return [ALIAS_TO_GROUP[text]];

  const slug = ALIAS_TO_SLUG[text] || text.replace(/\s+/g, '-');
  return slugToGroups[slug] || [];
}

/**
 * Given a list of Product documents, figures out which ingredient groups
 * are present in the routine, and which specific ingredient(s) triggered each group.
 * @returns {Object} groupKey -> Set of matched ingredient display names
 */
async function getGroupsPresent(products) {
  const slugToGroups = await getSlugToGroupsMap();
  const groupsPresent = {};

  products.forEach((product) => {
    (product.ingredients || []).forEach((ingredientText) => {
      const groups = resolveIngredientGroups(ingredientText, slugToGroups);
      groups.forEach((groupKey) => {
        if (!groupsPresent[groupKey]) groupsPresent[groupKey] = new Set();
        groupsPresent[groupKey].add(ingredientText);
      });
    });
  });

  return groupsPresent;
}

/**
 * @param {Array} selectedProducts  array of Product documents/objects in the routine
 * @returns {Array} matches — [{ groupA, groupB, groupALabel, groupBLabel,
 *                                matchedIngredientsA, matchedIngredientsB,
 *                                severity, reason, recommendation }]
 */
async function checkRoutineCompatibility(selectedProducts) {
  const groupsPresent = await getGroupsPresent(selectedProducts);
  const presentKeys = Object.keys(groupsPresent);
  if (presentKeys.length < 2) return [];

  const rules = await CompatibilityRule.find({});

  const matches = rules
    .filter((rule) => groupsPresent[rule.groupA] && groupsPresent[rule.groupB])
    .map((rule) => ({
      groupA: rule.groupA,
      groupB: rule.groupB,
      groupALabel: GROUP_LABELS[rule.groupA] || rule.groupA,
      groupBLabel: GROUP_LABELS[rule.groupB] || rule.groupB,
      matchedIngredientsA: Array.from(groupsPresent[rule.groupA]),
      matchedIngredientsB: Array.from(groupsPresent[rule.groupB]),
      severity: rule.severity,
      reason: rule.reason,
      recommendation: rule.recommendation,
    }));

  // Warnings first (avoid, caution), then essential reminders, then positive synergies
  const severityOrder = { avoid: 0, caution: 1, essential: 2, great: 3, good: 4 };
  matches.sort((a, b) => (severityOrder[a.severity] ?? 9) - (severityOrder[b.severity] ?? 9));

  return matches;
}

/**
 * Builds a basic 4-step routine (Cleanse -> Treat -> Moisturize -> Protect)
 * from a list of recommended/scored products, picking the top-scoring product
 * per category, then checks it for conflicts.
 *
 * @param {Array} scoredProducts  output of recommendationEngine.recommendProducts
 *                                 i.e. [{ product, score, reasons }, ...]
 */
async function buildRoutine(scoredProducts) {
  const stepOrder = ['cleanser', 'treatment', 'moisturizer', 'sunscreen'];
  const steps = [];

  // Metadata about each routine step to make the routine more structured
  const STEP_META = {
    cleanser: {
      displayName: 'Cleanse',
      times: ['morning', 'night'],
      usage: 'Use a gentle cleanser to remove dirt and makeup. Apply to damp skin, massage, then rinse.'
    },
    treatment: {
      displayName: 'Treat',
      times: ['night'],
      usage: 'Apply targeted treatments (serums, retinoids, acids) after cleansing and before moisturizing.'
    },
    moisturizer: {
      displayName: 'Moisturize',
      times: ['morning', 'night'],
      usage: 'Apply a moisturizer to lock in hydration. Use lighter textures in the morning if preferred.'
    },
    sunscreen: {
      displayName: 'Protect',
      times: ['morning', 'day'],
      usage: 'Apply sunscreen as the last step in your morning routine. Reapply every 2 hours when outdoors.'
    },
  };

  for (const stepKey of stepOrder) {
    const best = scoredProducts.find((r) => r.product.category === stepKey);
    if (best) {
      const meta = STEP_META[stepKey] || { displayName: stepKey, times: [], usage: '' };
      steps.push({
        step: stepKey,
        displayName: meta.displayName,
        times: meta.times,
        usage: meta.usage,
        product: best.product,
        score: best.score,
        reasons: best.reasons,
      });
    }
  }

  const matches = await checkRoutineCompatibility(steps.map((s) => s.product));
  const warnings = matches.filter((m) => CONFLICT_SEVERITIES.includes(m.severity));
  const synergiesAndReminders = matches.filter((m) => !CONFLICT_SEVERITIES.includes(m.severity));

  return { steps, warnings, synergiesAndReminders };
}

module.exports = { checkRoutineCompatibility, buildRoutine, CONFLICT_SEVERITIES };
