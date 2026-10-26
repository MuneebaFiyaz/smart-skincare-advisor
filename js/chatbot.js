const chatWindow = document.getElementById('chatWindow');
const chatInput = document.getElementById('chatInput');
const sendBtn = document.getElementById('sendBtn');
const profileForm = document.getElementById('profileForm');
const typingIndicator = document.getElementById('typingIndicator');
const generateRoutineBtn = document.getElementById('generateRoutineBtn');
const generateRoutineHint = document.getElementById('generateRoutineHint');
const startOverBtn = document.getElementById('startOverBtn');

const CHAT_STORAGE_KEY = 'ssa_chat_history';

let history = []; // [{ role: 'user'|'model', text: '...' }]

// Show the "Generate Routine" button once there's been a bit of back-and-forth —
// enough that Gemini has something real to extract from.
const MIN_EXCHANGES_BEFORE_GENERATE = 2; // user+bot pairs

function saveHistory() {
  localStorage.setItem(CHAT_STORAGE_KEY, JSON.stringify(history));
}

function clearHistory() {
  localStorage.removeItem(CHAT_STORAGE_KEY);
  history = [];
  chatWindow.innerHTML = '';
  generateRoutineBtn.style.display = 'none';
  generateRoutineHint.style.display = 'block';
  addBubble("Hello. I'm your skincare assistant.", 'bot');
  addBotOptions('Please select your skin type.', [
    { label: 'Dry', value: 'dry' },
    { label: 'Oily', value: 'oily' },
    { label: 'Combination', value: 'combination' },
    { label: 'Sensitive', value: 'sensitive' },
    { label: 'Normal', value: 'normal' },
  ]);
}

function escapeHtml(str) {
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

function renderMarkdown(text) {
  let html = escapeHtml(text);
  html = html.replace(/^#{1,6}\s+(.+)$/gm, '<h4>$1</h4>');
  html = html.replace(/^\s*(?:\*{3,}|-{3,})\s*$/gm, '<hr>');
  html = html.replace(/^\s*\*\s+/gm, '&bull; ');
  html = html.replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>');
  html = html.replace(/\*(.+?)\*/g, '<em>$1</em>');
  html = html.replace(/\*/g, '');
  html = html.replace(/\n\n+/g, '</p><p>');
  html = html.replace(/\n/g, '<br>');
  return `<p>${html}</p>`;
}

function addBubble(text, sender) {
  const row = document.createElement('div');
  row.className = `chat-row ${sender === 'user' ? 'user-row' : ''}`;

  if (sender === 'bot') {
    const avatar = document.createElement('div');
    avatar.className = 'chat-avatar small';
    avatar.innerHTML = '<i class="fa-solid fa-spa"></i>';
    row.appendChild(avatar);
  }

  const bubble = document.createElement('div');
  bubble.className = `chat-bubble ${sender}`;
  bubble.innerHTML = sender === 'bot'
    ? renderMarkdown(text)
    : `<p>${escapeHtml(text).replace(/\n/g, '<br>')}</p>`;

  row.appendChild(bubble);
  chatWindow.appendChild(row);
  chatWindow.scrollTop = chatWindow.scrollHeight;
}

function showTyping(visible) {
  typingIndicator.style.display = visible ? 'flex' : 'none';
  if (visible) chatWindow.scrollTop = chatWindow.scrollHeight;
}

function updateGenerateButtonVisibility() {
  const exchanges = Math.floor(history.length / 2);
  if (exchanges >= MIN_EXCHANGES_BEFORE_GENERATE) {
    generateRoutineBtn.style.display = 'block';
    generateRoutineHint.style.display = 'none';
  }
}

// Restore a previous conversation if one exists, otherwise show the greeting
function restoreOrGreet() {
  const saved = localStorage.getItem(CHAT_STORAGE_KEY);

  if (saved) {
    try {
      const parsed = JSON.parse(saved);
      if (Array.isArray(parsed) && parsed.length > 0) {
        history = parsed;
        history.forEach((entry) => {
          addBubble(entry.text, entry.role === 'model' ? 'bot' : 'user');
        });
        updateGenerateButtonVisibility();
        return;
      }
    } catch (err) {
      console.error('Could not restore saved chat history:', err);
    }
  }
  addBubble("Hello. I'm your skincare assistant.", 'bot');
  addBotOptions('Please select your skin type.', [
    { label: 'Dry', value: 'dry' },
    { label: 'Oily', value: 'oily' },
    { label: 'Combination', value: 'combination' },
    { label: 'Sensitive', value: 'sensitive' },
    { label: 'Normal', value: 'normal' },
  ]);
}

// Render a bot bubble that includes clickable option buttons (skin types)
function addBotOptions(text, options) {
  const row = document.createElement('div');
  row.className = 'chat-row';

  const avatar = document.createElement('div');
  avatar.className = 'chat-avatar small';
  avatar.innerHTML = '<i class="fa-solid fa-spa"></i>';
  row.appendChild(avatar);

  const bubble = document.createElement('div');
  bubble.className = 'chat-bubble bot';
  bubble.innerHTML = renderMarkdown(text) + '<div class="skin-options"></div>';
  row.appendChild(bubble);

  chatWindow.appendChild(row);
  const container = bubble.querySelector('.skin-options');
  const selected = new Map();
  const allowMultiple = false;
  let confirmButton;

  options.forEach((opt) => {
    const btn = document.createElement('button');
    btn.type = 'button';
    btn.className = 'skin-option-btn';
    btn.textContent = opt.label;
    btn.addEventListener('click', () => {
      if (!allowMultiple) {
        handleSkinSelection([{ value: opt.value, label: opt.label }]);
        return;
      }

      if (selected.has(opt.value)) {
        selected.delete(opt.value);
        btn.classList.remove('selected');
      } else if (selected.size < 3) {
        selected.set(opt.value, opt.label);
        btn.classList.add('selected');
      }

      if (confirmButton) {
        confirmButton.hidden = selected.size < 2;
        confirmButton.textContent = `Continue with ${selected.size} selections`;
      }
    });
    container.appendChild(btn);
  });

  if (allowMultiple) {
    confirmButton = document.createElement('button');
    confirmButton.type = 'button';
    confirmButton.className = 'skin-confirm-btn';
    confirmButton.textContent = 'Continue with 2 selections';
    confirmButton.hidden = true;
    confirmButton.addEventListener('click', () => {
      handleSkinSelection(Array.from(selected, ([value, label]) => ({ value, label })));
      confirmButton.disabled = true;
    });
    container.appendChild(confirmButton);
  }

  chatWindow.scrollTop = chatWindow.scrollHeight;
}

function handleSkinSelection(selections) {
  const primarySelection = selections[0];
  const labels = selections.map((selection) => selection.label);

  // Add user's selection to chat and history
  addBubble(labels.join(' + '), 'user');
  history.push({ role: 'user', text: labels.join(', ') });
  saveHistory();

  // Prefill the quick profile form select if present
  try {
    const sel = document.querySelector('#profileForm select[name="skinType"]');
    if (sel) sel.value = primarySelection.value;
  } catch (e) {}

  // Simulate a short bot reply / follow-up question
  showTyping(true);
  sendBtn.disabled = true;
  setTimeout(() => {
    showTyping(false);
    const reply = 'Thank you. What is your main skin concern?';
    addBubble(reply, 'bot');
    history.push({ role: 'model', text: reply });
    saveHistory();
    updateGenerateButtonVisibility();
    sendBtn.disabled = false;
  }, 700);
}

// Render an error-style bot bubble with a Retry button that resends `lastUserMessage`.
function addErrorBubble(errorText, lastUserMessage) {
  const row = document.createElement('div');
  row.className = 'chat-row';

  const avatar = document.createElement('div');
  avatar.className = 'chat-avatar small';
  avatar.innerHTML = '<i class="fa-solid fa-spa"></i>';
  row.appendChild(avatar);

  const bubble = document.createElement('div');
  bubble.className = 'chat-bubble bot error';
  bubble.innerHTML = `<p>${escapeHtml(errorText)}</p><div style="margin-top:8px;"><button class="retry-btn">Retry</button></div>`;
  row.appendChild(bubble);

  chatWindow.appendChild(row);
  chatWindow.scrollTop = chatWindow.scrollHeight;

  const retryBtn = bubble.querySelector('.retry-btn');
  retryBtn.addEventListener('click', () => {
    retryBtn.disabled = true;
    // pass the bubble row into sendMessage so it can update/remove it
    sendMessage(lastUserMessage, row);
  });
}

restoreOrGreet();

startOverBtn.addEventListener('click', () => {
  if (history.length > 0 && !confirm('Start a new conversation? This will clear your current chat.')) {
    return;
  }
  clearHistory();
});

// Send a message to the chatbot. If `errorBubble` is provided this is a retry
// from an existing error bubble; the function will reuse that element instead
// of adding another user bubble.
async function sendMessage(overrideMessage, errorBubble) {
  const isRetry = typeof overrideMessage === 'string' && overrideMessage.length > 0;
  const message = isRetry ? overrideMessage : chatInput.value.trim();
  if (!message) return;

  if (!isRetry) {
    addBubble(message, 'user');
    chatInput.value = '';
  } else if (errorBubble) {
    // visually mark retrying state inside the error bubble
    const retryBtn = errorBubble.querySelector('.retry-btn');
    if (retryBtn) retryBtn.disabled = true;
    errorBubble.querySelector('.chat-bubble').innerHTML = '<p>Retrying…</p>';
  }

  showTyping(true);
  sendBtn.disabled = true;

  try {
    const res = await fetch('/api/chatbot', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ message, history }),
    });
    const data = await res.json();

    showTyping(false);

    if (data.error) {
      // show an error bubble (with retry) instead of a plain message
      if (errorBubble) {
        // restore error content and re-enable retry
        errorBubble.querySelector('.chat-bubble').innerHTML = '<p>Sorry, something went wrong talking to the assistant. Please try again in a moment.</p>';
        const retryBtn = errorBubble.querySelector('.retry-btn');
        if (retryBtn) retryBtn.disabled = false;
      } else {
        addErrorBubble('Sorry, something went wrong talking to the assistant. Please try again in a moment.', message);
      }
      console.error(data.error, data.details);
      return;
    }

    // on success: if we retried from an errorBubble, remove it before adding reply
    if (errorBubble && errorBubble.parentNode) errorBubble.parentNode.removeChild(errorBubble);

    addBubble(data.reply, 'bot');
    // ensure the user message and model reply are saved to history
    history.push({ role: 'user', text: message });
    history.push({ role: 'model', text: data.reply });
    saveHistory();
    updateGenerateButtonVisibility();
  } catch (err) {
    showTyping(false);
    if (errorBubble) {
      errorBubble.querySelector('.chat-bubble').innerHTML = '<p>Network error — please check the server is running.</p>';
      const retryBtn = errorBubble.querySelector('.retry-btn');
      if (retryBtn) retryBtn.disabled = false;
    } else {
      addErrorBubble('Network error — please check the server is running.', message);
    }
    console.error(err);
  } finally {
    sendBtn.disabled = false;
  }
}

sendBtn.addEventListener('click', sendMessage);
chatInput.addEventListener('keydown', (e) => {
  if (e.key === 'Enter') sendMessage();
});

// "Generate My Routine" — reads back over the chat, asks the server to distill
// it into a structured profile, then runs the same /api/recommend flow the
// quick-profile form uses, and lands on the Routine page with results ready.
generateRoutineBtn.addEventListener('click', async () => {
  generateRoutineBtn.disabled = true;
  generateRoutineBtn.innerHTML = '<i class="fa-solid fa-spinner fa-spin"></i>&nbsp; Reading your answers...';

  try {
    const extractRes = await fetch('/api/chatbot/extract-profile', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ history }),
    });
    const extractData = await extractRes.json();

    if (extractData.error) {
      alert(extractData.error);
      return;
    }

    generateRoutineBtn.innerHTML = '<i class="fa-solid fa-spinner fa-spin"></i>&nbsp; Building your routine...';

    const recRes = await fetch('/api/recommend', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(extractData.profile),
    });
    const recData = await recRes.json();

    if (recData.error) {
      alert('Error: ' + recData.error);
      return;
    }

    localStorage.setItem('ssa_last_result', JSON.stringify(recData));
    window.location.href = 'routine.html';
  } catch (err) {
    alert('Network error — please check the server is running.');
    console.error(err);
  } finally {
    generateRoutineBtn.disabled = false;
    generateRoutineBtn.innerHTML = '<i class="fa-solid fa-wand-magic-sparkles"></i>&nbsp; Generate My Routine';
  }
});

// Direct form path — bypasses the chatbot and calls /api/recommend right away
profileForm.addEventListener('submit', async (e) => {
  e.preventDefault();
  const formData = new FormData(profileForm);

  const payload = {
    skinType: formData.get('skinType'),
    concerns: (formData.get('concerns') || '')
      .split(',')
      .map((s) => s.trim())
      .filter(Boolean),
    allergies: (formData.get('allergies') || '')
      .split(',')
      .map((s) => s.trim())
      .filter(Boolean),
    budget: Number(formData.get('budget')),
    fragranceFree: formData.get('fragranceFree') === 'on',
    veganOnly: formData.get('veganOnly') === 'on',
  };

  try {
    const res = await fetch('/api/recommend', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });
    const data = await res.json();

    if (data.error) {
      alert('Error: ' + data.error);
      return;
    }

    localStorage.setItem('ssa_last_result', JSON.stringify(data));
    window.location.href = 'routine.html';
  } catch (err) {
    alert('Network error — please check the server is running.');
    console.error(err);
  }
});
