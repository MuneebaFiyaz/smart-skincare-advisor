// Shared across routine.js, cart.js, product-detail.js, compatibility.js.
// Renders one compatibility "match" object (from /api/compatibility/check or
// the routine builder) as a styled HTML card.

function severityToClass(severity) {
  if (severity === 'avoid') return 'high';
  if (severity === 'caution') return '';
  if (severity === 'good' || severity === 'great') return 'positive';
  if (severity === 'essential') return 'info';
  return '';
}

function severityToLabel(severity) {
  const labels = {
    avoid: 'Avoid combining',
    caution: 'Use with caution',
    good: 'Works well together',
    great: 'Great combination',
    essential: 'Good to know',
  };
  return labels[severity] || severity;
}

// Turns a raw group key like "vitamin_c_pure" into "Vitamin C Pure" for display
// when we don't have a server-provided label handy (e.g. the raw rules reference list).
function humanizeGroupKey(key) {
  return key
    .split('_')
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');
}

// Renders a raw rule straight from GET /api/compatibility/rules (no matched
// ingredients, just the two group keys involved) — used on the reference list.
function renderRawRule(rule) {
  const cssClass = severityToClass(rule.severity);
  const label = severityToLabel(rule.severity);

  return `
    <div class="warning ${cssClass}">
      <strong>${label}:</strong> ${humanizeGroupKey(rule.groupA)} + ${humanizeGroupKey(rule.groupB)}
      <p style="margin:0.4rem 0 0;">${rule.reason}</p>
      <p style="margin:0.3rem 0 0; font-style:italic;">${rule.recommendation}</p>
    </div>
  `;
}

function renderCompatibilityMatch(match) {
  const cssClass = severityToClass(match.severity);
  const label = severityToLabel(match.severity);
  const ingredientsA = match.matchedIngredientsA.join(', ');
  const ingredientsB = match.matchedIngredientsB.join(', ');

  return `
    <div class="warning ${cssClass}">
      <strong>${label}:</strong> ${match.groupALabel} (${ingredientsA}) + ${match.groupBLabel} (${ingredientsB})
      <p style="margin:0.4rem 0 0;">${match.reason}</p>
      <p style="margin:0.3rem 0 0; font-style:italic;">${match.recommendation}</p>
    </div>
  `;
}

// Renders a full list of matches, or a friendly "all clear" message if empty.
function renderCompatibilityMatches(matches, emptyMessage = 'No notes for this combination.') {
  if (!matches || !matches.length) {
    return `<p>${emptyMessage}</p>`;
  }
  return matches.map(renderCompatibilityMatch).join('');
}
