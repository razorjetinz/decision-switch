'use strict';

const HISTORY_KEY = 'decision-switch-history-v1';
const HISTORY_LIMIT = 10;

const elements = {
  questionInput: document.getElementById('questionInput'),
  characterCount: document.getElementById('characterCount'),
  drawButton: document.getElementById('drawButton'),
  resultStage: document.getElementById('resultStage'),
  resultNumber: document.getElementById('resultNumber'),
  answerKicker: document.getElementById('answerKicker'),
  answerWord: document.getElementById('answerWord'),
  resultMark: document.getElementById('resultMark'),
  historyList: document.getElementById('historyList'),
  historyCount: document.getElementById('historyCount'),
  clearHistoryButton: document.getElementById('clearHistoryButton'),
  toast: document.getElementById('toast')
};

let history = loadHistory();
let toastTimeout;

function randomInteger(min, max) {
  const range = max - min + 1;

  // Use Web Crypto when available, with rejection sampling to avoid modulo bias.
  if (window.crypto && typeof window.crypto.getRandomValues === 'function') {
    const uint32Range = 0x100000000;
    const limit = uint32Range - (uint32Range % range);
    const buffer = new Uint32Array(1);
    let value;
    do {
      window.crypto.getRandomValues(buffer);
      value = buffer[0];
    } while (value >= limit);
    return min + (value % range);
  }

  return Math.floor(Math.random() * range) + min;
}

function makeDecision() {
  const number = randomInteger(10, 99);
  const answer = number % 2 === 0 ? 'YES' : 'NO';
  const decision = {
    question: elements.questionInput.value.trim().slice(0, 180),
    number,
    answer,
    createdAt: new Date().toISOString()
  };

  showDecision(decision);
  history.unshift(decision);
  history = history.slice(0, HISTORY_LIMIT);
  saveHistory();
  renderHistory();
}

function showDecision(decision) {
  const isYes = decision.answer === 'YES';
  elements.resultStage.dataset.result = isYes ? 'yes' : 'no';
  elements.resultNumber.textContent = `RANDOM PICK  ·  ${decision.number}`;
  elements.answerKicker.textContent = decision.question ? 'FOR YOUR QUESTION' : 'YOUR RANDOM PICK';
  elements.answerWord.textContent = decision.answer;
  elements.resultMark.textContent = isYes ? '✓' : '×';
}

function loadHistory() {
  try {
    const stored = JSON.parse(localStorage.getItem(HISTORY_KEY) || '[]');
    if (!Array.isArray(stored)) return [];
    return stored
      .filter(item => Number.isInteger(item.number) && item.number >= 10 && item.number <= 99
        && (item.answer === 'YES' || item.answer === 'NO') && typeof item.createdAt === 'string')
      .map(item => ({
        question: typeof item.question === 'string' ? item.question.slice(0, 180) : '',
        number: item.number,
        answer: item.answer,
        createdAt: item.createdAt
      }))
      .slice(0, HISTORY_LIMIT);
  } catch {
    return [];
  }
}

function saveHistory() {
  try {
    localStorage.setItem(HISTORY_KEY, JSON.stringify(history));
  } catch {
    showToast('This browser could not save your history. Your current pick is still shown.');
  }
}

function renderHistory() {
  elements.historyList.replaceChildren();
  elements.clearHistoryButton.disabled = history.length === 0;
  elements.historyCount.textContent = String(history.length);

  if (history.length === 0) {
    const empty = document.createElement('div');
    empty.className = 'empty-history';
    const icon = document.createElement('span');
    icon.className = 'empty-icon';
    icon.setAttribute('aria-hidden', 'true');
    icon.textContent = '↳';
    const message = document.createElement('p');
    message.append('Your questions and picks', document.createElement('br'), 'will show up here.');
    empty.append(icon, message);
    elements.historyList.append(empty);
    return;
  }

  history.forEach(item => {
    const entry = document.createElement('article');
    entry.className = 'history-entry';

    const content = document.createElement('div');
    content.className = 'history-content';

    const question = document.createElement('p');
    question.className = `history-question${item.question ? '' : ' no-question'}`;
    question.textContent = item.question || 'Quick pick — no question added';

    const detail = document.createElement('div');
    detail.className = 'history-detail';
    const pickId = document.createElement('span');
    pickId.className = 'pick-id';
    pickId.textContent = `PICK ${item.number}`;
    const separator = document.createElement('span');
    separator.setAttribute('aria-hidden', 'true');
    separator.textContent = '·';
    const time = document.createElement('time');
    time.dateTime = item.createdAt;
    time.textContent = formatTime(item.createdAt);
    detail.append(pickId, separator, time);
    content.append(question, detail);

    const answer = document.createElement('span');
    answer.className = `history-answer ${item.answer.toLowerCase()}`;
    answer.textContent = item.answer;
    entry.append(content, answer);
    elements.historyList.append(entry);
  });
}

function formatTime(value) {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return 'Time unavailable';
  return new Intl.DateTimeFormat(undefined, {
    month: 'short', day: 'numeric', hour: 'numeric', minute: '2-digit'
  }).format(date);
}

function clearHistory() {
  history = [];
  try {
    localStorage.removeItem(HISTORY_KEY);
  } catch {
    // The visible list is still cleared for this session if storage is unavailable.
  }
  renderHistory();
  showToast('Your decision history has been cleared.');
}

function updateCharacterCount() {
  elements.characterCount.textContent = `${elements.questionInput.value.length} / 180`;
}

function showToast(message) {
  window.clearTimeout(toastTimeout);
  elements.toast.textContent = message;
  elements.toast.classList.add('show');
  toastTimeout = window.setTimeout(() => elements.toast.classList.remove('show'), 2600);
}

elements.drawButton.addEventListener('click', makeDecision);
elements.clearHistoryButton.addEventListener('click', clearHistory);
elements.questionInput.addEventListener('input', updateCharacterCount);
elements.questionInput.addEventListener('keydown', event => {
  if ((event.ctrlKey || event.metaKey) && event.key === 'Enter') makeDecision();
});

updateCharacterCount();
renderHistory();