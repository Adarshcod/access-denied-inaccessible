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
  const review = $('#registration-review');
  const reviewButton = $('#review-button');
  const finalButton = $('#final-register');
  const formControls = $$('#registration-form .form-grid input, #registration-form .form-grid select');
  const minimumReviewMs = 301000;
  let challengeStartedAt = null;
  let reviewTimer = null;
  let reviewing = false;

  function beginChallenge() {
    if (challengeStartedAt === null) challengeStartedAt = performance.now();
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
    { id: 'confirm-email', message: 'Enter the same email address again.', valid: (el) => el.value.trim().toLowerCase() === $('#email').value.trim().toLowerCase() },
    { id: 'department', message: 'Select your department.', valid: (el) => !!el.value },
    { id: 'year', message: 'Select your year of study.', valid: (el) => !!el.value },
    { id: 'participation', message: 'Choose Individual or Team of 2.', valid: () => !!registration.querySelector('input[name="participation"]:checked') },
    { id: 'event-venue', message: 'Select University Computer Lab.', valid: (el) => el.value === 'University Computer Lab' },
    { id: 'event-time', message: 'Select 2:00 PM.', valid: (el) => el.value === '2:00 PM' },
    { id: 'event-reference', message: 'Enter CC-AD-2309 from the event listing.', valid: (el) => el.value.trim().toUpperCase() === 'CC-AD-2309' }
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
  function updateReviewAvailability() {
    const remaining = Math.max(0, challengeStartedAt + minimumReviewMs - performance.now());
    finalButton.disabled = remaining > 0;
    if (remaining > 0) {
      const seconds = Math.ceil(remaining / 1000);
      $('#review-timer').textContent = `Final submission available in ${Math.floor(seconds / 60)}:${String(seconds % 60).padStart(2, '0')}.`;
    } else {
      $('#review-timer').textContent = 'Final submission is available.';
      if (reviewTimer !== null) clearInterval(reviewTimer);
      reviewTimer = null;
    }
  }
  function editRegistration() {
    if (reviewTimer !== null) clearInterval(reviewTimer);
    reviewTimer = null;
    reviewing = false;
    formControls.forEach((control) => { control.disabled = false; });
    review.hidden = true;
    reviewButton.hidden = false;
    reviewButton.focus();
  }
  registration.addEventListener('submit', (event) => {
    event.preventDefault();
    if (reviewing || !validate()) return;
    beginChallenge();
    $('#review-name').textContent = $('#full-name').value.trim();
    $('#review-email').textContent = $('#email').value.trim();
    $('#review-participation').textContent = registration.querySelector('input[name="participation"]:checked').value;
    $('#review-event').textContent = '2:00 PM · University Computer Lab · CC-AD-2309';
    formControls.forEach((control) => { control.disabled = true; });
    reviewing = true;
    reviewButton.hidden = true;
    review.hidden = false;
    updateReviewAvailability();
    if (finalButton.disabled) reviewTimer = setInterval(updateReviewAvailability, 1000);
    review.scrollIntoView({ block: 'start', behavior: 'smooth' });
  });
  $('#edit-registration').addEventListener('click', editRegistration);
  finalButton.addEventListener('click', () => {
    if (!reviewing || challengeStartedAt === null || performance.now() < challengeStartedAt + minimumReviewMs) {
      updateReviewAvailability();
      return;
    }
    if (!validate()) { editRegistration(); return; }
    if (reviewTimer !== null) clearInterval(reviewTimer);
    reviewTimer = null;
    registration.reset();
    challengeStartedAt = null;
    reviewing = false;
    formControls.forEach((control) => { control.disabled = false; });
    review.hidden = true;
    reviewButton.hidden = false;
    finalButton.disabled = true;
    showStage(confirmation, $('#confirmation-title'));
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
