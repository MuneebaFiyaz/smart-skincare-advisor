const chatWindow = document.getElementById('chatWindow');
const chatInput = document.getElementById('chatInput');
const sendBtn = document.getElementById('sendBtn');
const profileForm = document.getElementById('profileForm');
const typingIndicator = document.getElementById('typingIndicator');
const generateRoutineBtn = document.getElementById('generateRoutineBtn');
const startOverBtn = document.getElementById('startOverBtn');
const chatProductsGrid = document.getElementById('chatProductsGrid');
const chatProductSearch = document.getElementById('chatProductSearch');
const chatProductCount = document.getElementById('chatProductCount');
const chatCategoryFilters = document.querySelectorAll('.chat-filter-btn');

const CHAT_STORAGE_KEY = 'ssa_chat_history';

let chatHistory = [];
let allChatProducts = [];
let activeProductCategory = 'all';

const MIN_EXCHANGES_BEFORE_GENERATE = 2;

function saveHistory() {
  localStorage.setItem(CHAT_STORAGE_KEY, JSON.stringify(chatHistory));
}

function clearHistory() {
  localStorage.removeItem(CHAT_STORAGE_KEY);
  chatHistory = [];
  chatWindow.innerHTML = '';
  generateRoutineBtn.style.display = 'none';
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

async function loadChatProducts() {
  try {
    const res = await fetch('/api/products');
    const products = await res.json();
    if (!res.ok) throw new Error(products.error || 'Could not load products');

    allChatProducts = products;
    renderChatProducts();
  } catch (err) {
    chatProductCount.textContent = 'Products unavailable';
    chatProductsGrid.innerHTML = '<p>Could not load products. Please try again later.</p>';
    console.error('Could not load consultation products:', err);
  }
}

function renderChatProducts() {
  const searchTerm = chatProductSearch.value.trim().toLowerCase();
  const products = allChatProducts.filter((product) => {
    const matchesCategory = activeProductCategory === 'all' || product.category === activeProductCategory;
    const searchableText = `${product.name} ${product.brand} ${product.category}`.toLowerCase();
    return matchesCategory && searchableText.includes(searchTerm);
  });

  chatProductCount.textContent = `${products.length} ${products.length === 1 ? 'product' : 'products'}`;
  if (!products.length) {
    chatProductsGrid.innerHTML = allChatProducts.length
      ? '<p>No products match those filters. Try another search or category.</p>'
      : '<p>No products are available right now. Please check back soon.</p>';
    return;
  }

  chatProductsGrid.innerHTML = products
      .map((product) => {
        const id = encodeURIComponent(product._id);
        const name = escapeHtml(product.name);
        const brand = escapeHtml(product.brand || product.category || 'Skincare');
        const image = product.imageUrl
          ? `<img src="${escapeHtml(product.imageUrl)}" alt="${name}" loading="lazy" />`
          : '<div class="product-image-slot"><i class="fa-solid fa-image" aria-hidden="true"></i>Image coming soon</div>';

        return `
          <article class="card product-card">
            <a href="product-detail.html?id=${id}" style="text-decoration:none; color:inherit;">
              ${image}
              <span class="category-label">${brand}</span>
              <h3>${name}</h3>
              <div class="price">LKR ${Number(product.price).toLocaleString()}</div>
            </a>
            <a class="chat-product-view" href="product-detail.html?id=${id}">
              <i class="fa-solid fa-eye" aria-hidden="true"></i> View product
            </a>
          </article>
        `;
      })
      .join('');
}

function addBubble(text, sender) {
  const row = document.createElement('div');
  row.className = `chat-row ${sender === 'user' ? 'user-row' : ''}`;

  if (sender === 'bot') {
    const avatar = document.createElement('div');
    avatar.className = 'chat-avatar small';
    avatar.innerHTML = '<img src="images/chatbot-avatar.png" alt="" aria-hidden="true">';
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
  const exchanges = Math.floor(chatHistory.length / 2);
  if (exchanges >= MIN_EXCHANGES_BEFORE_GENERATE) {
    generateRoutineBtn.style.display = 'block';
  }
}

function restoreOrGreet() {
  const saved = localStorage.getItem(CHAT_STORAGE_KEY);

  if (saved) {
    try {
      const parsed = JSON.parse(saved);
      if (Array.isArray(parsed) && parsed.length > 0) {
        chatHistory = parsed;
        chatHistory.forEach((entry) => {
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

function addBotOptions(text, options, onSelect = handleSkinSelection) {
  const row = document.createElement('div');
  row.className = 'chat-row';

  const avatar = document.createElement('div');
  avatar.className = 'chat-avatar small';
  avatar.innerHTML = '<img src="images/chatbot-avatar.png" alt="" aria-hidden="true">';
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
        container.querySelectorAll('button').forEach((optionButton) => {
          optionButton.disabled = true;
        });
        onSelect([{ value: opt.value, label: opt.label }]);
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

  addBubble(labels.join(' + '), 'user');
  chatHistory.push({ role: 'user', text: labels.join(', ') });
  saveHistory();

  const skinTypeField = profileForm.elements.skinType;
  if (skinTypeField) skinTypeField.value = primarySelection.value;

  showTyping(true);
  sendBtn.disabled = true;
  setTimeout(() => {
    showTyping(false);
    const reply = 'Thank you. What is your main skin concern?';
    addBubble(reply, 'bot');
    chatHistory.push({ role: 'model', text: reply });
    saveHistory();
    addBotOptions('Choose the main concern you would like to focus on:', [
      { label: 'Acne', value: 'acne' },
      { label: 'Hydration', value: 'hydration' },
      { label: 'Redness', value: 'redness' },
      { label: 'Dark spots', value: 'dark spots' },
      { label: 'Fine lines', value: 'fine lines' },
      { label: 'No specific concern', value: '' },
    ], handleConcernSelection);
    sendBtn.disabled = false;
  }, 700);
}

function handleConcernSelection(selections) {
  const concern = selections[0];
  const concernsField = profileForm.elements.concerns;
  concernsField.value = concern.value;

  addBubble(concern.label, 'user');
  chatHistory.push({ role: 'user', text: concern.value ? `My main concern is ${concern.value}.` : 'I do not have a specific skin concern.' });
  const reply = 'Got it. You can add allergies, products you use, or a budget in the chat—or generate your routine now.';
  addBubble(reply, 'bot');
  chatHistory.push({ role: 'model', text: reply });
  saveHistory();
  updateGenerateButtonVisibility();
}

function addErrorBubble(errorText, lastUserMessage) {
  const row = document.createElement('div');
  row.className = 'chat-row';

  const avatar = document.createElement('div');
  avatar.className = 'chat-avatar small';
  avatar.innerHTML = '<img src="images/chatbot-avatar.png" alt="" aria-hidden="true">';
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
    // pass the bubble row into sendMessage so it can update the bubble with a "Retrying..." message
    sendMessage(lastUserMessage, row);
  });
}

restoreOrGreet();
loadChatProducts();

startOverBtn.addEventListener('click', () => {
  if (chatHistory.length > 0 && !confirm('Start a new conversation? This will clear your current chat.')) {
    return;
  }
  clearHistory();
});

async function sendMessage(overrideMessage, errorBubble) {
  const isRetry = typeof overrideMessage === 'string' && overrideMessage.length > 0;
  const message = isRetry ? overrideMessage : chatInput.value.trim();
  if (!message) return;

  if (!isRetry) {
    addBubble(message, 'user');
    chatInput.value = '';
  } else if (errorBubble) {

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
      body: JSON.stringify({ message, history: chatHistory }),
    });
    const data = await res.json();

    showTyping(false);

    if (data.error) {
      if (errorBubble) {
        errorBubble.querySelector('.chat-bubble').innerHTML = '<p>Sorry, something went wrong talking to the assistant. Please try again in a moment.</p>';
        const retryBtn = errorBubble.querySelector('.retry-btn');
        if (retryBtn) retryBtn.disabled = false;
      } else {
        addErrorBubble('Sorry, something went wrong talking to the assistant. Please try again in a moment.', message);
      }
      console.error(data.error, data.details);
      return;
    }

    if (errorBubble && errorBubble.parentNode) errorBubble.parentNode.removeChild(errorBubble);

    addBubble(data.reply, 'bot');
    chatHistory.push({ role: 'user', text: message });
    chatHistory.push({ role: 'model', text: data.reply });
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
chatProductSearch.addEventListener('input', renderChatProducts);
chatCategoryFilters.forEach((button) => {
  button.addEventListener('click', () => {
    activeProductCategory = button.dataset.category;
    chatCategoryFilters.forEach((filterButton) => {
      const isActive = filterButton === button;
      filterButton.classList.toggle('active', isActive);
      filterButton.setAttribute('aria-pressed', String(isActive));
    });
    renderChatProducts();
  });
});

//Routine
generateRoutineBtn.addEventListener('click', async () => {
  generateRoutineBtn.disabled = true;
  generateRoutineBtn.innerHTML = '<i class="fa-solid fa-spinner fa-spin"></i>&nbsp; Reading your answers...';

  try {
    const extractRes = await fetch('/api/chatbot/extract-profile', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ history: chatHistory }),
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
