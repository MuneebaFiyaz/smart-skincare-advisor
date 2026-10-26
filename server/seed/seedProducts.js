require('dotenv').config();
const mongoose = require('mongoose');
const connectDB = require('../config/db');
const Product = require('../models/Product');

// 100-product catalogue spanning 12 real skincare brands, across all 4 routine
// categories (cleanser, treatment, moisturizer, sunscreen). imageUrl is left
// unset intentionally — add real photos later via the /admin.html image manager.
const products = [

  // ==================== CLEANSERS (24) ====================
  { name: 'Squalane Cleanser', brand: 'The Ordinary', price: 2100, category: 'cleanser',
    ingredients: ['squalane'], suitableSkinTypes: ['dry', 'normal', 'sensitive'],
    targetsConcerns: ['hydration'], fragranceFree: true, vegan: false,
    description: 'Gentle, hydrating everyday cleanser.' },

  { name: 'Balancing Gel Cleanser', brand: 'The Ordinary', price: 2000, category: 'cleanser',
    ingredients: ['salicylic acid'], suitableSkinTypes: ['oily', 'combination'],
    targetsConcerns: ['acne', 'oil-control'], fragranceFree: true, vegan: true,
    description: 'Lightweight gel cleanser for oily/combination skin.' },

  { name: 'Oat Cleansing Balm', brand: 'The Ordinary', price: 2600, category: 'cleanser',
    ingredients: ['oat', 'squalane'], suitableSkinTypes: ['dry', 'sensitive'],
    targetsConcerns: ['hydration'], fragranceFree: true, vegan: false,
    description: 'Gentle balm cleanser that removes makeup without stripping skin.' },

  { name: 'Glycolipid Cream Cleanser', brand: 'The Ordinary', price: 2050, category: 'cleanser',
    ingredients: ['glycolipids'], suitableSkinTypes: ['dry', 'sensitive', 'normal'],
    targetsConcerns: ['hydration'], fragranceFree: true, vegan: true,
    description: 'Cream cleanser that respects the skin barrier.' },

  { name: 'Mattifying Toner', brand: 'The Ordinary', price: 1900, category: 'cleanser',
    ingredients: ['witch hazel', 'niacinamide'], suitableSkinTypes: ['oily'],
    targetsConcerns: ['oil-control', 'acne'], fragranceFree: true, vegan: true,
    description: 'Lightweight toner that helps control excess shine.' },

  { name: 'Hydrating Facial Cleanser', brand: 'CeraVe', price: 2800, category: 'cleanser',
    ingredients: ['ceramides', 'hyaluronic acid'], suitableSkinTypes: ['dry', 'normal', 'sensitive'],
    targetsConcerns: ['hydration'], fragranceFree: true, vegan: false,
    description: 'Non-foaming cleanser that restores the protective skin barrier.' },

  { name: 'Foaming Facial Cleanser', brand: 'CeraVe', price: 2900, category: 'cleanser',
    ingredients: ['ceramides', 'niacinamide'], suitableSkinTypes: ['oily', 'combination', 'normal'],
    targetsConcerns: ['oil-control'], fragranceFree: true, vegan: false,
    description: 'Foaming gel cleanser for normal to oily skin.' },

  { name: 'Salicylic Acid Cleanser', brand: 'CeraVe', price: 3100, category: 'cleanser',
    ingredients: ['salicylic acid', 'ceramides'], suitableSkinTypes: ['oily', 'combination'],
    targetsConcerns: ['acne'], fragranceFree: true, vegan: false,
    description: 'Exfoliating cleanser for rough, bumpy skin prone to breakouts.' },

  { name: 'Miceller Cleansing Water', brand: 'Simple', price: 1600, category: 'cleanser',
    ingredients: ['glycerin'], suitableSkinTypes: ['sensitive', 'normal', 'dry'],
    targetsConcerns: ['hydration'], fragranceFree: true, vegan: true,
    description: 'No-rinse micellar water for gentle daily makeup removal.' },

  { name: 'Purifying Facial Wash', brand: 'Simple', price: 1500, category: 'cleanser',
    ingredients: ['chamomile', 'vitamin b5'], suitableSkinTypes: ['sensitive', 'normal'],
    targetsConcerns: ['hydration'], fragranceFree: true, vegan: true,
    description: 'Soap-free wash formulated for sensitive skin.' },

  { name: 'Micellar Cleansing Wipes', brand: 'Simple', price: 1400, category: 'cleanser',
    ingredients: ['glycerin', 'vitamin b5'], suitableSkinTypes: ['sensitive', 'normal', 'dry'],
    targetsConcerns: ['hydration'], fragranceFree: true, vegan: true,
    description: 'On-the-go makeup-removing wipes, gentle enough for sensitive skin.' },

  { name: 'Low pH Good Morning Gel Cleanser', brand: 'COSRX', price: 2400, category: 'cleanser',
    ingredients: ['tea tree oil', 'bha'], suitableSkinTypes: ['oily', 'combination'],
    targetsConcerns: ['acne', 'oil-control'], fragranceFree: true, vegan: true,
    description: 'Low-pH gel cleanser that gently exfoliates while cleansing.' },

  { name: 'Advanced Snail 96 Mucin Cleanser', brand: 'COSRX', price: 2500, category: 'cleanser',
    ingredients: ['snail mucin'], suitableSkinTypes: ['dry', 'normal', 'sensitive'],
    targetsConcerns: ['hydration'], fragranceFree: true, vegan: false,
    description: 'Nourishing cleanser with snail secretion filtrate.' },

  { name: 'Toleriane Purifying Foaming Cleanser', brand: 'La Roche-Posay', price: 3300, category: 'cleanser',
    ingredients: ['glycerin', 'niacinamide'], suitableSkinTypes: ['sensitive', 'oily', 'combination'],
    targetsConcerns: ['oil-control'], fragranceFree: true, vegan: false,
    description: 'Foaming cleanser suited to sensitive, reactive skin.' },

  { name: 'Ultra Facial Cleanser', brand: 'Kiehl\u2019s', price: 4200, category: 'cleanser',
    ingredients: ['glycerin', 'squalane'], suitableSkinTypes: ['dry', 'normal'],
    targetsConcerns: ['hydration'], fragranceFree: true, vegan: false,
    description: 'Daily hydrating cleanser suitable for all skin types.' },

  { name: 'Deep Clean Foaming Cleanser', brand: 'Neutrogena', price: 1800, category: 'cleanser',
    ingredients: ['glycolic acid'], suitableSkinTypes: ['oily', 'combination', 'normal'],
    targetsConcerns: ['oil-control', 'hyperpigmentation'], fragranceFree: false, vegan: true,
    description: 'Deep-cleaning foaming wash that removes excess oil and makeup.' },

  { name: 'Gentle Skin Cleanser', brand: 'Cetaphil', price: 2200, category: 'cleanser',
    ingredients: ['glycerin', 'panthenol'], suitableSkinTypes: ['dry', 'sensitive', 'normal'],
    targetsConcerns: ['hydration'], fragranceFree: true, vegan: true,
    description: 'Dermatologist-recommended non-foaming cleanser for daily use.' },

  { name: 'Oily Skin Cleanser', brand: 'Cetaphil', price: 2300, category: 'cleanser',
    ingredients: ['niacinamide', 'zinc'], suitableSkinTypes: ['oily', 'combination'],
    targetsConcerns: ['oil-control', 'acne'], fragranceFree: true, vegan: true,
    description: 'Foaming cleanser formulated for oily and blemish-prone skin.' },

  { name: 'Sensibio H2O Micellar Water', brand: 'Bioderma', price: 3500, category: 'cleanser',
    ingredients: ['glycerin'], suitableSkinTypes: ['sensitive', 'dry', 'normal'],
    targetsConcerns: ['hydration'], fragranceFree: true, vegan: true,
    description: 'Iconic micellar water for sensitive skin, no rinse required.' },

  { name: 'Purete Thermale Cleansing Gel', brand: 'Vichy', price: 3200, category: 'cleanser',
    ingredients: ['glycerin', 'vitamin b5'], suitableSkinTypes: ['normal', 'combination', 'oily'],
    targetsConcerns: ['hydration'], fragranceFree: true, vegan: true,
    description: 'Mineralizing thermal water gel cleanser for daily use.' },

  { name: 'Skin Balancing Cleanser', brand: 'Paula\u2019s Choice', price: 4100, category: 'cleanser',
    ingredients: ['glycerin', 'niacinamide'], suitableSkinTypes: ['combination', 'oily'],
    targetsConcerns: ['oil-control'], fragranceFree: true, vegan: true,
    description: 'Water-soluble cleanser that balances combination skin.' },

  { name: 'AHA BHA PHA 30 Days Miracle Cleanser', brand: 'Some By Mi', price: 2700, category: 'cleanser',
    ingredients: ['aha', 'bha', 'tea tree oil'], suitableSkinTypes: ['oily', 'combination'],
    targetsConcerns: ['acne', 'oil-control'], fragranceFree: true, vegan: true,
    description: 'Exfoliating cleanser targeting acne and congested pores.' },

  { name: 'Green Tea Foam Cleanser', brand: 'Innisfree', price: 2300, category: 'cleanser',
    ingredients: ['green tea extract'], suitableSkinTypes: ['normal', 'combination', 'oily'],
    targetsConcerns: ['oil-control'], fragranceFree: true, vegan: true,
    description: 'Antioxidant-rich foaming cleanser with green tea extract.' },

  { name: 'Oat Cleansing Balm', brand: 'The Inkey List', price: 2900, category: 'cleanser',
    ingredients: ['oat', 'squalane'], suitableSkinTypes: ['dry', 'sensitive'],
    targetsConcerns: ['hydration'], fragranceFree: true, vegan: true,
    description: 'Balm-to-milk cleanser that removes makeup while soothing skin.' },

  // ==================== TREATMENTS / SERUMS (38) ====================
  { name: 'Niacinamide 10% + Zinc 1%', brand: 'The Ordinary', price: 2500, category: 'treatment',
    ingredients: ['niacinamide', 'zinc'], suitableSkinTypes: ['oily', 'combination'],
    targetsConcerns: ['acne', 'oil-control'], fragranceFree: true, vegan: true,
    description: 'Targets blemishes and congestion while balancing visible sebum activity.' },

  { name: 'Hyaluronic Acid 2% + B5', brand: 'The Ordinary', price: 2200, category: 'treatment',
    ingredients: ['hyaluronic acid', 'vitamin b5'], suitableSkinTypes: ['dry', 'normal', 'sensitive'],
    targetsConcerns: ['hydration'], fragranceFree: true, vegan: true,
    description: 'Multi-molecular-weight hyaluronic acid for deep hydration.' },

  { name: 'Salicylic Acid 2% Solution', brand: 'The Ordinary', price: 2300, category: 'treatment',
    ingredients: ['salicylic acid'], suitableSkinTypes: ['oily', 'combination'],
    targetsConcerns: ['acne', 'oil-control'], fragranceFree: true, vegan: true,
    description: 'BHA exfoliant that helps clear pore congestion.' },

  { name: 'Retinol 0.5% in Squalane', brand: 'The Ordinary', price: 2600, category: 'treatment',
    ingredients: ['retinol', 'squalane'], suitableSkinTypes: ['normal', 'combination'],
    targetsConcerns: ['aging', 'hyperpigmentation'], fragranceFree: true, vegan: false,
    description: 'Moderate-strength retinol for visible signs of aging.' },

  { name: 'Vitamin C Suspension 23% + HA Spheres 2%', brand: 'The Ordinary', price: 2700, category: 'treatment',
    ingredients: ['vitamin c', 'hyaluronic acid'], suitableSkinTypes: ['normal', 'combination'],
    targetsConcerns: ['hyperpigmentation', 'aging'], fragranceFree: true, vegan: true,
    description: 'High-strength vitamin C for brightening and antioxidant protection.' },

  { name: 'AHA 30% + BHA 2% Peeling Solution', brand: 'The Ordinary', price: 2800, category: 'treatment',
    ingredients: ['aha', 'bha', 'glycolic acid'], suitableSkinTypes: ['normal', 'oily', 'combination'],
    targetsConcerns: ['hyperpigmentation', 'acne'], fragranceFree: true, vegan: true,
    description: 'Intensive weekly exfoliating treatment.' },

  { name: 'Azelaic Acid Suspension 10%', brand: 'The Ordinary', price: 2650, category: 'treatment',
    ingredients: ['azelaic acid'], suitableSkinTypes: ['oily', 'combination', 'sensitive'],
    targetsConcerns: ['acne', 'hyperpigmentation'], fragranceFree: true, vegan: true,
    description: 'Brightens and evens skin tone, gentle enough for sensitive skin.' },

  { name: 'Marine Hyaluronics', brand: 'The Ordinary', price: 2450, category: 'treatment',
    ingredients: ['hyaluronic acid', 'algae extract'], suitableSkinTypes: ['sensitive', 'dry'],
    targetsConcerns: ['hydration'], fragranceFree: true, vegan: true,
    description: 'Ultra-gentle hydrating serum for sensitive or reactive skin.' },

  { name: 'Buffet + Copper Peptides', brand: 'The Ordinary', price: 3400, category: 'treatment',
    ingredients: ['peptides', 'copper peptides'], suitableSkinTypes: ['normal', 'combination', 'dry'],
    targetsConcerns: ['aging'], fragranceFree: true, vegan: false,
    description: 'Multi-technology anti-aging serum.' },

  { name: 'Lactic Acid 5% + HA', brand: 'The Ordinary', price: 2350, category: 'treatment',
    ingredients: ['lactic acid', 'hyaluronic acid'], suitableSkinTypes: ['sensitive', 'dry', 'normal'],
    targetsConcerns: ['hyperpigmentation', 'aging'], fragranceFree: true, vegan: true,
    description: 'Mild AHA exfoliant suited to sensitive/dry skin.' },

  { name: 'Resurfacing Retinol Serum', brand: 'CeraVe', price: 3600, category: 'treatment',
    ingredients: ['retinol', 'ceramides', 'niacinamide'], suitableSkinTypes: ['normal', 'combination', 'oily'],
    targetsConcerns: ['aging', 'hyperpigmentation'], fragranceFree: true, vegan: false,
    description: 'Retinol serum formulated with ceramides to reduce irritation.' },

  { name: 'Vitamin C Serum', brand: 'CeraVe', price: 3400, category: 'treatment',
    ingredients: ['vitamin c', 'hyaluronic acid', 'ceramides'], suitableSkinTypes: ['normal', 'combination'],
    targetsConcerns: ['hyperpigmentation', 'aging'], fragranceFree: true, vegan: false,
    description: 'Brightening vitamin C serum with barrier-supporting ceramides.' },

  { name: 'Skin Renewing Vitamin C Serum', brand: 'CeraVe', price: 3550, category: 'treatment',
    ingredients: ['vitamin c', 'ceramides'], suitableSkinTypes: ['normal', 'dry', 'combination'],
    targetsConcerns: ['hyperpigmentation', 'aging'], fragranceFree: true, vegan: false,
    description: 'Antioxidant serum that brightens while supporting the skin barrier.' },

  { name: 'Salicylic Acid Anti-Acne Serum', brand: 'La Roche-Posay', price: 3800, category: 'treatment',
    ingredients: ['salicylic acid', 'niacinamide'], suitableSkinTypes: ['oily', 'combination'],
    targetsConcerns: ['acne', 'oil-control'], fragranceFree: true, vegan: false,
    description: 'Targeted serum for acne-prone and blemish-prone skin.' },

  { name: 'Retinol B3 Serum', brand: 'La Roche-Posay', price: 4500, category: 'treatment',
    ingredients: ['retinol', 'niacinamide'], suitableSkinTypes: ['normal', 'combination'],
    targetsConcerns: ['aging'], fragranceFree: true, vegan: false,
    description: 'Anti-aging retinol serum with niacinamide to soothe skin.' },

  { name: 'Advanced Snail 96 Mucin Power Essence', brand: 'COSRX', price: 2900, category: 'treatment',
    ingredients: ['snail mucin', 'hyaluronic acid'], suitableSkinTypes: ['dry', 'normal', 'sensitive'],
    targetsConcerns: ['hydration', 'aging'], fragranceFree: true, vegan: false,
    description: 'Lightweight essence for hydration and skin repair.' },

  { name: 'BHA Blackhead Power Liquid', brand: 'COSRX', price: 2700, category: 'treatment',
    ingredients: ['salicylic acid', 'bha'], suitableSkinTypes: ['oily', 'combination'],
    targetsConcerns: ['acne', 'oil-control'], fragranceFree: true, vegan: true,
    description: 'BHA exfoliating liquid that targets blackheads and congestion.' },

  { name: 'Niacinamide 10% Serum', brand: 'COSRX', price: 2600, category: 'treatment',
    ingredients: ['niacinamide'], suitableSkinTypes: ['oily', 'combination', 'normal'],
    targetsConcerns: ['oil-control', 'hyperpigmentation'], fragranceFree: true, vegan: true,
    description: 'Concentrated niacinamide serum to even skin tone and control oil.' },

  { name: 'Centella Blemish Cream', brand: 'COSRX', price: 2400, category: 'treatment',
    ingredients: ['centella asiatica'], suitableSkinTypes: ['sensitive', 'oily', 'combination'],
    targetsConcerns: ['acne'], fragranceFree: true, vegan: true,
    description: 'Soothing spot-treatment cream for blemishes and irritation.' },

  { name: 'Rapid Wrinkle Repair Retinol Serum', brand: 'Neutrogena', price: 3200, category: 'treatment',
    ingredients: ['retinol', 'hyaluronic acid'], suitableSkinTypes: ['normal', 'combination', 'dry'],
    targetsConcerns: ['aging'], fragranceFree: false, vegan: false,
    description: 'Fast-acting retinol serum aimed at fine lines and wrinkles.' },

  { name: 'Bright Boost Vitamin C Serum', brand: 'Neutrogena', price: 3000, category: 'treatment',
    ingredients: ['vitamin c'], suitableSkinTypes: ['normal', 'combination'],
    targetsConcerns: ['hyperpigmentation'], fragranceFree: false, vegan: true,
    description: 'Brightening vitamin C serum for dull, uneven skin tone.' },

  { name: 'Hydro Boost Hyaluronic Serum', brand: 'Neutrogena', price: 2400, category: 'treatment',
    ingredients: ['hyaluronic acid'], suitableSkinTypes: ['dry', 'normal', 'sensitive'],
    targetsConcerns: ['hydration'], fragranceFree: true, vegan: true,
    description: 'Water-gel serum that delivers intense, long-lasting hydration.' },

  { name: 'Midnight Recovery Concentrate', brand: 'Kiehl\u2019s', price: 6500, category: 'treatment',
    ingredients: ['lavender oil', 'squalane'], suitableSkinTypes: ['dry', 'normal', 'sensitive'],
    targetsConcerns: ['hydration', 'aging'], fragranceFree: false, vegan: true,
    description: 'Overnight facial oil that replenishes and repairs skin.' },

  { name: 'Clear Improvement Active Charcoal Mask', brand: 'Kiehl\u2019s', price: 5200, category: 'treatment',
    ingredients: ['charcoal', 'kaolin clay'], suitableSkinTypes: ['oily', 'combination'],
    targetsConcerns: ['oil-control', 'acne'], fragranceFree: true, vegan: true,
    description: 'Clay mask that draws out impurities and absorbs excess oil.' },

  { name: 'Clearly Corrective Dark Spot Solution', brand: 'Kiehl\u2019s', price: 6200, category: 'treatment',
    ingredients: ['vitamin c', 'niacinamide'], suitableSkinTypes: ['normal', 'combination'],
    targetsConcerns: ['hyperpigmentation'], fragranceFree: true, vegan: false,
    description: 'Brightening treatment that targets stubborn dark spots.' },

  { name: '2% BHA Liquid Exfoliant', brand: 'Paula\u2019s Choice', price: 4300, category: 'treatment',
    ingredients: ['salicylic acid'], suitableSkinTypes: ['oily', 'combination', 'normal'],
    targetsConcerns: ['acne', 'hyperpigmentation'], fragranceFree: true, vegan: true,
    description: 'Cult-favorite leave-on BHA exfoliant for smoother, clearer skin.' },

  { name: '10% Niacinamide Booster', brand: 'Paula\u2019s Choice', price: 4600, category: 'treatment',
    ingredients: ['niacinamide', 'zinc'], suitableSkinTypes: ['oily', 'combination'],
    targetsConcerns: ['oil-control', 'hyperpigmentation'], fragranceFree: true, vegan: true,
    description: 'Concentrated booster that refines the look of enlarged pores.' },

  { name: 'C15 Super Booster Vitamin C', brand: 'Paula\u2019s Choice', price: 5800, category: 'treatment',
    ingredients: ['vitamin c', 'vitamin e'], suitableSkinTypes: ['normal', 'combination'],
    targetsConcerns: ['aging', 'hyperpigmentation'], fragranceFree: true, vegan: false,
    description: 'High-potency vitamin C booster for firmer, brighter skin.' },

  { name: 'Galactomyces Pure Vitamin C Glow Serum', brand: 'Some By Mi', price: 3300, category: 'treatment',
    ingredients: ['vitamin c', 'galactomyces ferment'], suitableSkinTypes: ['normal', 'combination', 'dry'],
    targetsConcerns: ['hyperpigmentation'], fragranceFree: true, vegan: true,
    description: 'Fermented glow serum that brightens and evens skin tone.' },

  { name: 'Retinol Intense Reactivating Serum', brand: 'Some By Mi', price: 3600, category: 'treatment',
    ingredients: ['retinol', 'bakuchiol'], suitableSkinTypes: ['normal', 'combination'],
    targetsConcerns: ['aging'], fragranceFree: true, vegan: false,
    description: 'Anti-aging serum combining retinol with gentler bakuchiol.' },

  { name: 'Retinol Cica Serum', brand: 'Innisfree', price: 3100, category: 'treatment',
    ingredients: ['retinol', 'centella asiatica'], suitableSkinTypes: ['normal', 'sensitive', 'combination'],
    targetsConcerns: ['aging'], fragranceFree: true, vegan: true,
    description: 'Retinol serum paired with soothing centella for sensitive skin.' },

  { name: 'Hyaluronic Acid Serum', brand: 'The Inkey List', price: 2100, category: 'treatment',
    ingredients: ['hyaluronic acid'], suitableSkinTypes: ['dry', 'normal', 'sensitive'],
    targetsConcerns: ['hydration'], fragranceFree: true, vegan: true,
    description: 'Simple, effective hyaluronic acid serum for everyday hydration.' },

  { name: 'Niacinamide Serum', brand: 'The Inkey List', price: 2000, category: 'treatment',
    ingredients: ['niacinamide'], suitableSkinTypes: ['oily', 'combination'],
    targetsConcerns: ['oil-control', 'hyperpigmentation'], fragranceFree: true, vegan: true,
    description: 'Budget-friendly niacinamide serum to refine texture and tone.' },

  { name: 'Caffeine Eye Serum', brand: 'The Inkey List', price: 2300, category: 'treatment',
    ingredients: ['caffeine', 'hyaluronic acid'], suitableSkinTypes: ['normal', 'combination', 'dry'],
    targetsConcerns: ['aging'], fragranceFree: true, vegan: true,
    description: 'De-puffing eye serum with caffeine and EGCG.' },

  { name: 'Mineral 89 Hyaluronic Acid Booster', brand: 'Vichy', price: 3900, category: 'treatment',
    ingredients: ['hyaluronic acid', 'mineralizing water'], suitableSkinTypes: ['normal', 'dry', 'sensitive'],
    targetsConcerns: ['hydration'], fragranceFree: true, vegan: true,
    description: 'Fortifying daily booster serum with hyaluronic acid.' },

  { name: 'Hyaluron-Filler Serum', brand: 'Eucerin', price: 4200, category: 'treatment',
    ingredients: ['hyaluronic acid'], suitableSkinTypes: ['normal', 'dry'],
    targetsConcerns: ['aging', 'hydration'], fragranceFree: true, vegan: true,
    description: 'Anti-aging serum that plumps and smooths fine lines.' },

  { name: 'Sebium AKN Global Serum', brand: 'Bioderma', price: 4400, category: 'treatment',
    ingredients: ['salicylic acid', 'niacinamide'], suitableSkinTypes: ['oily', 'combination'],
    targetsConcerns: ['acne', 'oil-control'], fragranceFree: true, vegan: false,
    description: 'Corrective care targeting acne marks and blemishes.' },

  { name: 'Redermic C Anti-Wrinkle Vitamin C Serum', brand: 'La Roche-Posay', price: 5500, category: 'treatment',
    ingredients: ['vitamin c', 'hyaluronic acid'], suitableSkinTypes: ['normal', 'dry', 'combination'],
    targetsConcerns: ['aging', 'hyperpigmentation'], fragranceFree: true, vegan: false,
    description: 'Pure vitamin C anti-aging serum for firmer, brighter skin.' },

  // ==================== MOISTURIZERS (22) ====================
  { name: 'Natural Moisturizing Factors + HA', brand: 'The Ordinary', price: 2400, category: 'moisturizer',
    ingredients: ['hyaluronic acid', 'amino acids'], suitableSkinTypes: ['dry', 'normal', 'sensitive'],
    targetsConcerns: ['hydration'], fragranceFree: true, vegan: true,
    description: 'Lightweight moisturizer that mimics skin\u2019s natural moisturizing factors.' },

  { name: 'Niacinamide + Ceramide Moisturizer', brand: 'The Ordinary', price: 2900, category: 'moisturizer',
    ingredients: ['niacinamide', 'ceramides'], suitableSkinTypes: ['combination', 'oily', 'normal'],
    targetsConcerns: ['oil-control', 'aging'], fragranceFree: true, vegan: true,
    description: 'Barrier-supporting moisturizer that also helps control shine.' },

  { name: 'Rich Ceramide Barrier Cream', brand: 'The Ordinary', price: 3000, category: 'moisturizer',
    ingredients: ['ceramides', 'fatty acids'], suitableSkinTypes: ['dry', 'sensitive'],
    targetsConcerns: ['hydration', 'aging'], fragranceFree: true, vegan: false,
    description: 'Rich, barrier-repairing cream for very dry or compromised skin.' },

  { name: 'Moisturizing Cream', brand: 'CeraVe', price: 3300, category: 'moisturizer',
    ingredients: ['ceramides', 'hyaluronic acid'], suitableSkinTypes: ['dry', 'normal', 'sensitive'],
    targetsConcerns: ['hydration'], fragranceFree: true, vegan: false,
    description: 'Rich, non-greasy cream for 24-hour hydration.' },

  { name: 'PM Facial Moisturizing Lotion', brand: 'CeraVe', price: 3100, category: 'moisturizer',
    ingredients: ['ceramides', 'niacinamide'], suitableSkinTypes: ['normal', 'combination'],
    targetsConcerns: ['hydration'], fragranceFree: true, vegan: false,
    description: 'Lightweight night lotion that restores the skin barrier.' },

  { name: 'AM Facial Moisturizing Lotion SPF 30', brand: 'CeraVe', price: 3400, category: 'moisturizer',
    ingredients: ['ceramides', 'niacinamide', 'uv filters'], suitableSkinTypes: ['normal', 'combination'],
    targetsConcerns: ['hydration', 'aging'], fragranceFree: true, vegan: false,
    description: 'Daily moisturizer with broad-spectrum SPF protection.' },

  { name: 'Water Gel Moisturizer', brand: 'Neutrogena', price: 2200, category: 'moisturizer',
    ingredients: ['hyaluronic acid', 'glycerin'], suitableSkinTypes: ['oily', 'combination', 'normal'],
    targetsConcerns: ['hydration', 'oil-control'], fragranceFree: true, vegan: true,
    description: 'Oil-free water gel that hydrates without clogging pores.' },

  { name: 'Ultra Facial Cream', brand: 'Kiehl\u2019s', price: 5800, category: 'moisturizer',
    ingredients: ['squalane', 'glycerin'], suitableSkinTypes: ['dry', 'normal', 'sensitive'],
    targetsConcerns: ['hydration'], fragranceFree: true, vegan: false,
    description: '24-hour hydrating cream suitable for all skin types.' },

  { name: 'Avocado Nourishing Moisturizer', brand: 'Kiehl\u2019s', price: 5400, category: 'moisturizer',
    ingredients: ['avocado oil', 'squalane'], suitableSkinTypes: ['dry', 'sensitive'],
    targetsConcerns: ['hydration'], fragranceFree: false, vegan: false,
    description: 'Nutrient-rich cream for very dry, dehydrated skin.' },

  { name: 'Toleriane Sensitive Fluid', brand: 'La Roche-Posay', price: 3900, category: 'moisturizer',
    ingredients: ['ceramides', 'niacinamide'], suitableSkinTypes: ['sensitive', 'normal'],
    targetsConcerns: ['hydration'], fragranceFree: true, vegan: false,
    description: 'Soothing daily fluid moisturizer for sensitive, reactive skin.' },

  { name: 'Hydro Boost Water Gel', brand: 'Simple', price: 2100, category: 'moisturizer',
    ingredients: ['hyaluronic acid', 'glycerin'], suitableSkinTypes: ['normal', 'combination', 'oily'],
    targetsConcerns: ['hydration'], fragranceFree: true, vegan: true,
    description: 'Lightweight gel-cream that absorbs quickly without residue.' },

  { name: 'Aloe Vera Soothing Gel Moisturizer', brand: 'COSRX', price: 1900, category: 'moisturizer',
    ingredients: ['aloe vera', 'glycerin'], suitableSkinTypes: ['sensitive', 'normal', 'oily'],
    targetsConcerns: ['hydration'], fragranceFree: true, vegan: true,
    description: 'Cooling gel moisturizer that soothes irritated or sun-exposed skin.' },

  { name: 'Moisturizing Cream', brand: 'Cetaphil', price: 2700, category: 'moisturizer',
    ingredients: ['glycerin', 'niacinamide'], suitableSkinTypes: ['dry', 'sensitive', 'normal'],
    targetsConcerns: ['hydration'], fragranceFree: true, vegan: true,
    description: 'Fragrance-free daily moisturizer for dry, sensitive skin.' },

  { name: 'Sensibio Light Cream', brand: 'Bioderma', price: 3600, category: 'moisturizer',
    ingredients: ['glycerin'], suitableSkinTypes: ['sensitive', 'normal', 'combination'],
    targetsConcerns: ['hydration'], fragranceFree: true, vegan: true,
    description: 'Lightweight soothing moisturizer for intolerant, sensitive skin.' },

  { name: 'Aqualia Thermal Rich Cream', brand: 'Vichy', price: 4100, category: 'moisturizer',
    ingredients: ['hyaluronic acid', 'mineralizing water'], suitableSkinTypes: ['dry', 'sensitive'],
    targetsConcerns: ['hydration'], fragranceFree: true, vegan: true,
    description: '48-hour rich hydrating cream for dry skin.' },

  { name: 'Q10 Anti-Wrinkle Cream', brand: 'Eucerin', price: 4300, category: 'moisturizer',
    ingredients: ['coenzyme q10', 'creatine'], suitableSkinTypes: ['normal', 'dry'],
    targetsConcerns: ['aging'], fragranceFree: true, vegan: false,
    description: 'Anti-wrinkle cream that firms and smooths with Q10.' },

  { name: 'Yuja Niacin Brightening Cream', brand: 'Some By Mi', price: 3000, category: 'moisturizer',
    ingredients: ['niacinamide', 'vitamin c'], suitableSkinTypes: ['normal', 'combination', 'dry'],
    targetsConcerns: ['hyperpigmentation', 'hydration'], fragranceFree: true, vegan: true,
    description: 'Brightening daily cream infused with yuja and niacinamide.' },

  { name: 'Green Tea Seed Hyaluronic Cream', brand: 'Innisfree', price: 2800, category: 'moisturizer',
    ingredients: ['hyaluronic acid', 'green tea extract'], suitableSkinTypes: ['normal', 'dry', 'combination'],
    targetsConcerns: ['hydration'], fragranceFree: true, vegan: true,
    description: 'Antioxidant-rich hydrating cream with green tea seed oil.' },

  { name: 'Peptide Moisturizer', brand: 'The Inkey List', price: 2500, category: 'moisturizer',
    ingredients: ['peptides', 'squalane'], suitableSkinTypes: ['normal', 'dry', 'combination'],
    targetsConcerns: ['aging'], fragranceFree: true, vegan: false,
    description: 'Peptide-rich moisturizer that supports skin firmness.' },

  { name: 'Omega+ Complex Moisturizer', brand: 'Paula\u2019s Choice', price: 4700, category: 'moisturizer',
    ingredients: ['omega fatty acids', 'ceramides'], suitableSkinTypes: ['dry', 'sensitive'],
    targetsConcerns: ['hydration'], fragranceFree: true, vegan: false,
    description: 'Barrier-restoring moisturizer rich in omega fatty acids.' },

  { name: 'Kind To Skin Hydrating Light Moisturizer', brand: 'Simple', price: 1900, category: 'moisturizer',
    ingredients: ['glycerin', 'vitamin b5'], suitableSkinTypes: ['normal', 'combination', 'sensitive'],
    targetsConcerns: ['hydration'], fragranceFree: true, vegan: true,
    description: 'Lightweight daily moisturizer for sensitive skin.' },

  { name: 'Toleriane Ultra Cream', brand: 'La Roche-Posay', price: 4200, category: 'moisturizer',
    ingredients: ['ceramides', 'glycerin'], suitableSkinTypes: ['sensitive', 'dry'],
    targetsConcerns: ['hydration'], fragranceFree: true, vegan: false,
    description: 'Intense soothing cream for very sensitive, allergic-prone skin.' },

  // ==================== SUNSCREENS (16) ====================
  { name: 'Mineral UV Filters SPF 30', brand: 'The Ordinary', price: 3200, category: 'sunscreen',
    ingredients: ['zinc oxide', 'titanium dioxide'], suitableSkinTypes: ['sensitive', 'dry', 'normal'],
    targetsConcerns: ['aging', 'hyperpigmentation'], fragranceFree: true, vegan: true,
    description: 'Broad-spectrum mineral sunscreen, gentle on sensitive skin.' },

  { name: 'Ultra-Light UV Defense SPF 50', brand: 'The Ordinary', price: 3100, category: 'sunscreen',
    ingredients: ['uv filters', 'niacinamide'], suitableSkinTypes: ['oily', 'combination'],
    targetsConcerns: ['oil-control', 'aging'], fragranceFree: true, vegan: true,
    description: 'Non-greasy, fast-absorbing daily sunscreen.' },

  { name: 'Hydrating Mineral Sunscreen SPF 30', brand: 'CeraVe', price: 3600, category: 'sunscreen',
    ingredients: ['zinc oxide', 'ceramides'], suitableSkinTypes: ['dry', 'sensitive', 'normal'],
    targetsConcerns: ['hydration', 'aging'], fragranceFree: true, vegan: false,
    description: 'Mineral sunscreen formulated with ceramides for dry or sensitive skin.' },

  { name: 'Anthelios Ultra Fluid SPF 50+', brand: 'La Roche-Posay', price: 4800, category: 'sunscreen',
    ingredients: ['uv filters', 'niacinamide'], suitableSkinTypes: ['sensitive', 'normal', 'combination'],
    targetsConcerns: ['aging'], fragranceFree: true, vegan: false,
    description: 'High-protection facial sunscreen for sensitive and reactive skin.' },

  { name: 'Anthelios Oil Correct SPF 50', brand: 'La Roche-Posay', price: 4600, category: 'sunscreen',
    ingredients: ['uv filters', 'niacinamide'], suitableSkinTypes: ['oily', 'combination'],
    targetsConcerns: ['oil-control', 'acne'], fragranceFree: true, vegan: false,
    description: 'Mattifying sunscreen designed for oily and acne-prone skin.' },

  { name: 'Anthelios UVMune 400 Invisible Fluid SPF 50+', brand: 'La Roche-Posay', price: 5000, category: 'sunscreen',
    ingredients: ['uv filters'], suitableSkinTypes: ['normal', 'combination', 'sensitive'],
    targetsConcerns: ['aging'], fragranceFree: true, vegan: false,
    description: 'Next-generation UV filter technology in an invisible finish.' },

  { name: 'Ultra Sheer Dry-Touch Sunscreen SPF 50', brand: 'Neutrogena', price: 2600, category: 'sunscreen',
    ingredients: ['uv filters'], suitableSkinTypes: ['normal', 'combination', 'oily'],
    targetsConcerns: ['aging'], fragranceFree: false, vegan: true,
    description: 'Lightweight, dry-touch daily sunscreen.' },

  { name: 'Hydro Boost Sunscreen Lotion SPF 50', brand: 'Neutrogena', price: 2800, category: 'sunscreen',
    ingredients: ['uv filters', 'hyaluronic acid'], suitableSkinTypes: ['dry', 'normal'],
    targetsConcerns: ['hydration', 'aging'], fragranceFree: false, vegan: true,
    description: 'Hydrating sunscreen lotion with hyaluronic acid.' },

  { name: 'Ultra Sheer Face Sunscreen SPF 70', brand: 'Neutrogena', price: 2900, category: 'sunscreen',
    ingredients: ['uv filters'], suitableSkinTypes: ['normal', 'oily', 'combination'],
    targetsConcerns: ['aging'], fragranceFree: false, vegan: true,
    description: 'Very high protection facial sunscreen with a lightweight feel.' },

  { name: 'Aloe Soothing Sun Cream SPF 50+', brand: 'COSRX', price: 2500, category: 'sunscreen',
    ingredients: ['uv filters', 'aloe vera'], suitableSkinTypes: ['sensitive', 'normal', 'oily'],
    targetsConcerns: ['hydration', 'aging'], fragranceFree: true, vegan: true,
    description: 'Lightweight, soothing sunscreen suited to sensitive skin.' },

  { name: 'Daily Facial Moisturizer SPF 15', brand: 'Cetaphil', price: 2400, category: 'sunscreen',
    ingredients: ['uv filters', 'glycerin'], suitableSkinTypes: ['dry', 'sensitive', 'normal'],
    targetsConcerns: ['hydration'], fragranceFree: true, vegan: true,
    description: 'Daily light moisturizer with SPF for sensitive skin.' },

  { name: 'Photoderm Max SPF 50+', brand: 'Bioderma', price: 4900, category: 'sunscreen',
    ingredients: ['uv filters'], suitableSkinTypes: ['sensitive', 'normal', 'dry'],
    targetsConcerns: ['aging'], fragranceFree: true, vegan: false,
    description: 'Very high, broad-spectrum protection for photo-sensitive skin.' },

  { name: 'Capital Soleil UV Age Daily SPF 50', brand: 'Vichy', price: 4700, category: 'sunscreen',
    ingredients: ['uv filters', 'niacinamide'], suitableSkinTypes: ['normal', 'combination'],
    targetsConcerns: ['aging', 'hyperpigmentation'], fragranceFree: true, vegan: false,
    description: 'Daily anti-aging sunscreen with a tinted, skin-perfecting finish.' },

  { name: 'Sun Oil Control SPF 50', brand: 'Eucerin', price: 4500, category: 'sunscreen',
    ingredients: ['uv filters'], suitableSkinTypes: ['oily', 'combination'],
    targetsConcerns: ['oil-control', 'acne'], fragranceFree: true, vegan: false,
    description: 'Mattifying sunscreen designed specifically for oily, acne-prone skin.' },

  { name: 'Yuja Niacin 30 Days Miracle Sunscreen', brand: 'Some By Mi', price: 2600, category: 'sunscreen',
    ingredients: ['uv filters', 'niacinamide'], suitableSkinTypes: ['normal', 'combination', 'oily'],
    targetsConcerns: ['hyperpigmentation'], fragranceFree: true, vegan: true,
    description: 'Brightening daily sunscreen with niacinamide and yuja extract.' },

  { name: 'Daily UV Defense Sunscreen SPF 36', brand: 'Innisfree', price: 2300, category: 'sunscreen',
    ingredients: ['uv filters', 'green tea extract'], suitableSkinTypes: ['normal', 'combination', 'oily'],
    targetsConcerns: ['aging'], fragranceFree: true, vegan: true,
    description: 'Lightweight daily sunscreen with antioxidant green tea extract.' },
];

async function seed() {
  await connectDB();
  await Product.deleteMany({});
  await Product.insertMany(products);
  console.log(`Seeded ${products.length} products.`);
  await mongoose.connection.close();
}

seed().catch((err) => {
  console.error(err);
  process.exit(1);
});
