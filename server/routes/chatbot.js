const express = require('express');
const router = express.Router();

const SYSTEM_PROMPT = `You are a professional, courteous skincare consultation assistant. This chat is for collecting the user's preferences; the app's Generate My Routine button creates recommendations.
Ask one concise question per reply to learn the user's skin type, concerns, current products, allergies or ingredients to avoid, and budget. Do not combine questions, repeat details already shared, or ask for several details at once. Keep replies to one or two brief sentences.
Never recommend specific products, list products, create a routine, or give product order, frequency, or application instructions in chat. If the user asks for products, a routine, or how to use products, briefly ask them to select the Generate My Routine button below instead. If they have already shared enough information, invite them to select that button; otherwise, ask the next single relevant question.
Discuss skincare only. Do not diagnose medical conditions or give medical advice. Use clear, professional wording.`;

router.post('/', async (req, res) => {
  try {
    const { message, history = [] } = req.body;
    const apiKey = process.env.GEMINI_API_KEY?.trim();

    if (!apiKey) return res.status(500).json({ error: 'API key missing' });

    const contents = [
      ...history.map(h => ({
        role: (h.role === 'bot' || h.role === 'model') ? 'model' : 'user',
        parts: [{ text: h.text }]
      })),
      { role: 'user', parts: [{ text: message }] }
    ];

    const apiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-3.5-flash:generateContent?key=${apiKey}`;

    const response = await fetch(apiUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        system_instruction: { parts: [{ text: SYSTEM_PROMPT }] },
        contents,
      }),
    });

    const data = await response.json();

    if (!response.ok) {
      console.error("Gemini Error:", JSON.stringify(data, null, 2));
      return res.status(502).json({ error: 'API Error', details: data.error?.message });
    }

    const reply = data?.candidates?.[0]?.content?.parts?.[0]?.text || "I'm here to help. What is your skin type?";
    res.json({ reply });

  } catch (err) {
    console.error("Route Error:", err);
    res.status(500).json({ error: err.message });
  }
});

// POST /api/chatbot/extract-profile
// Reads back over the conversation and asks Gemini to distill it into the
// structured fields /api/recommend needs (skinType, concerns, allergies, budget...).
// Used by the "Generate Routine" button — lets the user just chat normally,
// then convert that conversation into a recommendation without re-typing anything.
const EXTRACTION_PROMPT = `You are a data extraction assistant. Read the conversation below between a
user and a skincare chatbot. Output ONLY a single valid JSON object (no markdown fences, no extra text)
with exactly these fields:

{
  "skinType": one of "dry" | "oily" | "combination" | "sensitive" | "normal" (best guess; default "normal" if truly unclear),
  "concerns": array of short lowercase strings (e.g. ["acne","aging"]; empty array if none mentioned),
  "allergies": array of short lowercase ingredient names to avoid (empty array if none mentioned),
  "budget": a number in LKR (best guess from what the user said; default 3000 if not mentioned),
  "fragranceFree": true or false (true only if user said they need fragrance-free),
  "veganOnly": true or false (true only if user said they need vegan products)
}

Only output the JSON object, nothing else.`;

router.post('/extract-profile', async (req, res) => {
  try {
    const { history = [] } = req.body;
    const apiKey = process.env.GEMINI_API_KEY?.trim();

    if (!apiKey) return res.status(500).json({ error: 'API key missing' });
    if (!history.length) return res.status(400).json({ error: 'No conversation to extract from yet' });

    const transcript = history
      .map(h => `${(h.role === 'bot' || h.role === 'model') ? 'Assistant' : 'User'}: ${h.text}`)
      .join('\n');

    const apiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-3.5-flash:generateContent?key=${apiKey}`;

    const response = await fetch(apiUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        system_instruction: { parts: [{ text: EXTRACTION_PROMPT }] },
        contents: [{ role: 'user', parts: [{ text: transcript }] }],
      }),
    });

    const data = await response.json();

    if (!response.ok) {
      console.error("Gemini Extraction Error:", JSON.stringify(data, null, 2));
      return res.status(502).json({ error: 'API Error', details: data.error?.message });
    }

    const rawText = data?.candidates?.[0]?.content?.parts?.[0]?.text || '{}';
    // Strip any accidental markdown fences before parsing
    const cleaned = rawText.replace(/```json|```/g, '').trim();

    let profile;
    try {
      profile = JSON.parse(cleaned);
    } catch (parseErr) {
      console.error('Could not parse extracted profile:', rawText);
      return res.status(502).json({ error: 'Could not understand the conversation well enough. Please try answering a couple more questions first.' });
    }

    // Safe defaults in case the model omits a field
    const safeProfile = {
      skinType: ['dry', 'oily', 'combination', 'sensitive', 'normal'].includes(profile.skinType) ? profile.skinType : 'normal',
      concerns: Array.isArray(profile.concerns) ? profile.concerns : [],
      allergies: Array.isArray(profile.allergies) ? profile.allergies : [],
      budget: typeof profile.budget === 'number' ? profile.budget : 3000,
      fragranceFree: !!profile.fragranceFree,
      veganOnly: !!profile.veganOnly,
    };

    res.json({ profile: safeProfile });
  } catch (err) {
    console.error("Extraction Route Error:", err);
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
