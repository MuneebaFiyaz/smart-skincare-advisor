/**
 * Ingredient-based recommendation engine.
 * Scores each product against a user profile using a transparent, explainable
 * weighting: ingredient/concern match 60%, skin-type compatibility 30%, price fit 10%.
 * (Mirrors the scoring breakdown described in the project proposal.)
 */

const CONCERN_WEIGHT = 60;
const SKIN_TYPE_WEIGHT = 30;
const PRICE_WEIGHT = 10;

function normalize(list = []) {
  return list.map((s) => String(s).toLowerCase().trim());
}

/**
 * @param {object} product   Mongoose Product document (or plain object)
 * @param {object} userProfile  { skinType, concerns, allergies, budget, fragranceFree, veganOnly }
 * @returns {object} { product, score, disqualified, reasons }
 */
function scoreProduct(product, userProfile) {
  const reasons = [];
  const allergies = normalize(userProfile.allergies);
  const productIngredients = normalize(product.ingredients);

  // Hard disqualifiers first — safety before scoring.
  const allergyHit = productIngredients.find((ing) => allergies.includes(ing));
  if (allergyHit) {
    return {
      product,
      score: 0,
      disqualified: true,
      reasons: [`Contains ${allergyHit}, which matches a listed allergy`],
    };
  }

  if (userProfile.fragranceFree && !product.fragranceFree) {
    return {
      product,
      score: 0,
      disqualified: true,
      reasons: ['Not fragrance-free, but user requested fragrance-free only'],
    };
  }

  if (userProfile.veganOnly && !product.vegan) {
    return {
      product,
      score: 0,
      disqualified: true,
      reasons: ['Not vegan, but user requested vegan-only products'],
    };
  }

  let score = 0;

  // 1) Concern / ingredient match (60%)
  const concerns = normalize(userProfile.concerns);
  const productConcerns = normalize(product.targetsConcerns);
  const matchedConcerns = productConcerns.filter((c) => concerns.includes(c));
  if (concerns.length > 0) {
    const concernScore = (matchedConcerns.length / concerns.length) * CONCERN_WEIGHT;
    score += concernScore;
    if (matchedConcerns.length > 0) {
      reasons.push(`Targets your concern(s): ${matchedConcerns.join(', ')}`);
    }
  }

  // 2) Skin type compatibility (30%)
  const suitableTypes = normalize(product.suitableSkinTypes);
  if (suitableTypes.includes(String(userProfile.skinType).toLowerCase())) {
    score += SKIN_TYPE_WEIGHT;
    reasons.push(`Suitable for ${userProfile.skinType} skin`);
  }

  // 3) Price fit (10%) — full credit if within budget, partial credit if close
  if (typeof userProfile.budget === 'number') {
    if (product.price <= userProfile.budget) {
      score += PRICE_WEIGHT;
    } else if (product.price <= userProfile.budget * 1.15) {
      // small overshoot still gets partial credit
      score += PRICE_WEIGHT * 0.4;
      reasons.push('Slightly above budget');
    }
  }

  return { product, score: Math.round(score), disqualified: false, reasons };
}

/**
 * Ranks all candidate products for a given user profile.
 * @param {Array} products  list of Product documents
 * @param {object} userProfile
 * @param {number} limit  how many recommendations to return
 */
function recommendProducts(products, userProfile, limit = 5) {
  const scored = products
    .map((p) => scoreProduct(p, userProfile))
    .filter((r) => !r.disqualified)
    .sort((a, b) => b.score - a.score);

  return scored.slice(0, limit);
}

module.exports = { scoreProduct, recommendProducts };
