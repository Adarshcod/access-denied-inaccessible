(() => {
  const accessible = document.body.dataset.version === 'Accessible';
  const $ = (selector) => document.querySelector(selector);
  const $$ = (selector) => [...document.querySelectorAll(selector)];
  const dashboard = $('#dashboard');
  const confirmation = $('#confirmation');
  const reflection = $('#reflection');
  const comparison = $('#comparison');
  const details = $('#event-details');
  const registration = $('#registration-form');
  const search = $('#event-search');
  const filter = $('#event-filter');
  const cards = $$('.event-card');
  const noResults = $('#no-results');
  const searchStatus = $('#search-status');
  const minimumReviewMs = 301000;
  const challengeStartKey = 'access-denied-inaccessible-start';
  let challengeStartedAt = null;
  let completionTimer = null;

  function beginChallenge() {
    if (challengeStartedAt !== null) return;
    try {
      const saved = Number(sessionStorage.getItem(challengeStartKey));
      if (Number.isFinite(saved) && saved > 0 && saved <= Date.now()) challengeStartedAt = saved;
    } catch { /* The timer still works when session storage is unavailable. */ }
    if (challengeStartedAt === null) {
      challengeStartedAt = Date.now();
      try { sessionStorage.setItem(challengeStartKey, String(challengeStartedAt)); } catch { /* Continue without persistence. */ }
    }
  }

  function showStage(stage, heading) {
    [dashboard, confirmation, reflection, comparison].forEach((item) => { item.hidden = item !== stage; });
    window.scrollTo({ top: 0, behavior: 'instant' });
    if (heading) requestAnimationFrame(() => heading.focus());
  }
  $$('.sidebar a').forEach((link) => link.addEventListener('click', () => {
    if (dashboard.hidden) showStage(dashboard);
    $$('.sidebar a').forEach((item) => item.removeAttribute('aria-current'));
    link.setAttribute('aria-current', 'page');
  }));

  function updateEvents() {
    const term = search.value.trim().toLowerCase();
    let count = 0;
    cards.forEach((card) => {
      const matches = card.dataset.event.includes(term) && (filter.value === 'all' || card.dataset.category === filter.value);
      card.hidden = !matches;
      if (matches) count++;
    });
    noResults.hidden = count !== 0;
    if (searchStatus) searchStatus.textContent = `${count} event${count === 1 ? '' : 's'} shown`;
  }
  search.addEventListener('input', updateEvents);
  filter.addEventListener('change', updateEvents);

  $('#details-button').addEventListener('click', (event) => {
    beginChallenge();
    details.hidden = false;
    event.currentTarget.setAttribute('aria-expanded', 'true');
    details.scrollIntoView({ block: 'start', behavior: 'smooth' });
    if (accessible) $('#detail-title').focus({ preventScroll: true });
  });

  const fields = [
    { id: 'full-name', message: 'Enter your full name (at least 2 characters).', valid: (el) => el.value.trim().length >= 2 },
    { id: 'email', message: 'Enter a valid email address, such as name@example.com.', valid: (el) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(el.value.trim()) },
    { id: 'department', message: 'Select your department.', valid: (el) => !!el.value },
    { id: 'year', message: 'Select your year of study.', valid: (el) => !!el.value },
    { id: 'participation', message: 'Choose Individual or Team of 2.', valid: () => !!registration.querySelector('input[name="participation"]:checked') }
  ];
  function clearError(field) {
    const error = $(`#${field.id}-error`);
    if (error) error.textContent = '';
    if (field.id !== 'participation') {
      const input = $(`#${field.id}`);
      input.removeAttribute('aria-invalid');
      input.removeAttribute('aria-describedby');
    }
  }
  function validate() {
    const invalid = fields.filter((field) => !field.valid($(`#${field.id}`)));
    fields.forEach(clearError);
    const summary = $('#form-errors');
    if (!invalid.length) { summary.hidden = true; summary.innerHTML = ''; return true; }
    if (accessible) {
      invalid.forEach((field) => {
        $(`#${field.id}-error`).textContent = field.message;
        if (field.id !== 'participation') {
          $(`#${field.id}`).setAttribute('aria-invalid', 'true');
          $(`#${field.id}`).setAttribute('aria-describedby', `${field.id}-error`);
        }
      });
      summary.innerHTML = `<strong>Check ${invalid.length} field${invalid.length === 1 ? '' : 's'} before registering:</strong><ul>${invalid.map((field) => `<li><a href="#${field.id}">${field.message}</a></li>`).join('')}</ul>`;
      summary.hidden = false;
      summary.focus();
    } else {
      summary.textContent = 'Invalid input.';
      summary.hidden = false;
    }
    return false;
  }
  registration.addEventListener('submit', (event) => {
    event.preventDefault();
    if (completionTimer !== null) return;
    if (!validate()) return;
    beginChallenge();
    const pending = $('#registration-pending');
    const countdown = $('#registration-countdown');
    const submit = registration.querySelector('[type="submit"]');
    submit.disabled = true;
    pending.hidden = false;
    const finish = () => {
      if (completionTimer !== null) clearInterval(completionTimer);
      completionTimer = null;
      try { sessionStorage.removeItem(challengeStartKey); } catch { /* Storage may be unavailable. */ }
      registration.reset();
      submit.disabled = false;
      pending.hidden = true;
      showStage(confirmation, $('#confirmation-title'));
    };
    const updateCountdown = () => {
      const remaining = Math.max(0, challengeStartedAt + minimumReviewMs - Date.now());
      if (remaining === 0) { finish(); return; }
      const seconds = Math.ceil(remaining / 1000);
      countdown.textContent = `${Math.floor(seconds / 60)}:${String(seconds % 60).padStart(2, '0')}`;
    };
    updateCountdown();
    if (!pending.hidden) completionTimer = setInterval(updateCountdown, 1000);
  });
  if (accessible) {
    fields.forEach((field) => {
      const el = $(`#${field.id}`);
      if (field.id === 'participation') {
        registration.querySelectorAll('input[name="participation"]').forEach((radio) => radio.addEventListener('change', () => clearError(field)));
      } else {
        el.addEventListener(el.tagName === 'SELECT' ? 'change' : 'input', () => clearError(field));
      }
    });
  }
  $('#continue-button').addEventListener('click', () => showStage(reflection, $('#reflection-title')));
  $$('.comparison-trigger').forEach((button) => button.addEventListener('click', () => showStage(comparison, $('#comparison-title'))));
  $('#back-reflection').addEventListener('click', () => showStage(reflection, $('#reflection-title')));

  const reflectionForm = $('#reflection-form');
  try {
    const saved = JSON.parse(sessionStorage.getItem('access-denied-reflection') || '[]');
    saved.forEach((value, index) => { const field = $(`#reflection-${index + 1}`); if (field) field.value = value; });
  } catch { /* Storage may be unavailable in private browsing. */ }
  reflectionForm.addEventListener('submit', (event) => {
    event.preventDefault();
    try {
      sessionStorage.setItem('access-denied-reflection', JSON.stringify([1, 2, 3, 4, 5].map((i) => $(`#reflection-${i}`).value)));
      $('#reflection-status').textContent = 'Your reflections are saved for this browser session.';
    } catch {
      $('#reflection-status').textContent = 'Your reflections could not be saved in this browser.';
    }
  });

  const facilitator = $('#facilitator');
  const close = $('#close-facilitator');
  let previousFocus = null;
  function closeFacilitator() {
    facilitator.hidden = true;
    if (previousFocus && previousFocus.focus) previousFocus.focus();
  }
  function openFacilitator() {
    previousFocus = document.activeElement;
    facilitator.hidden = false;
    close.focus();
  }
  document.addEventListener('keydown', (event) => {
    if (event.ctrlKey && event.shiftKey && event.key.toLowerCase() === 'a') {
      event.preventDefault();
      facilitator.hidden ? openFacilitator() : closeFacilitator();
    } else if (!facilitator.hidden && event.key === 'Escape') {
      closeFacilitator();
    } else if (!facilitator.hidden && event.key === 'Tab') {
      const focusable = [...facilitator.querySelectorAll('button, a[href], input, select, textarea')].filter((el) => !el.disabled);
      const first = focusable[0], last = focusable.at(-1);
      if (event.shiftKey && document.activeElement === first) { event.preventDefault(); last.focus(); }
      else if (!event.shiftKey && document.activeElement === last) { event.preventDefault(); first.focus(); }
    }
  });
  close.addEventListener('click', closeFacilitator);
  facilitator.addEventListener('click', (event) => { if (event.target === facilitator) closeFacilitator(); });
})();
