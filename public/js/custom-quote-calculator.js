// public/js/custom-quote-calculator.js — IIFE UI for the Custom Quote request.
// POSTs to /api/custom-quote (Resend email). Falls back to a mailto on failure.
(function () {
  'use strict';
  var EMAIL = 'jimmy@fishbeckinnovations.com';

  var nameInput = document.getElementById('name-input');
  var emailInput = document.getElementById('email-input');
  var phoneInput = document.getElementById('phone-input');
  var typeSelect = document.getElementById('type-select');
  var descInput = document.getElementById('desc-input');
  var filesInput = document.getElementById('files-input');
  var submitBtn = document.getElementById('submit-btn');
  var formError = document.getElementById('form-error');
  var formCard = document.getElementById('form-card');
  var successCard = document.getElementById('success-card');
  var fallbackLink = document.getElementById('fallback-link');
  var fallbackWrap = document.getElementById('fallback-wrap');
  var footerYear = document.getElementById('footer-year');

  var EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

  function show(el) { if (el) el.classList.remove('hidden'); }
  function hide(el) { if (el) el.classList.add('hidden'); }

  function values() {
    return {
      name: (nameInput.value || '').trim(),
      email: (emailInput.value || '').trim(),
      phone: (phoneInput.value || '').trim(),
      projectType: typeSelect.value,
      description: (descInput.value || '').trim(),
      fileNote: (filesInput.value || '').trim()
    };
  }

  function setLoading(on) {
    submitBtn.disabled = on;
    submitBtn.querySelector('.btn-text').textContent = on ? 'Sending…' : 'Send My Request';
  }

  function mailtoFallback(v) {
    var lines = [
      'Custom quote request', '',
      'Name: ' + v.name, 'Email: ' + v.email,
      v.phone ? 'Phone: ' + v.phone : null,
      v.projectType ? 'Project type: ' + v.projectType : null,
      '', 'Description:', v.description,
      v.fileNote ? '\nFiles: ' + v.fileNote : '',
      '', '(Attach any files to this email.)'
    ].filter(function (x) { return x !== null; });
    return 'mailto:' + EMAIL + '?subject=' + encodeURIComponent('Custom quote request — ' + v.name) +
      '&body=' + encodeURIComponent(lines.join('\n'));
  }

  async function submit() {
    hide(formError);
    var v = values();
    if (!v.name || !v.email || !v.description) {
      formError.textContent = 'Please include your name, email, and a project description.'; show(formError); return;
    }
    if (!EMAIL_RE.test(v.email)) { formError.textContent = 'Please enter a valid email address.'; show(formError); return; }

    setLoading(true);
    try {
      var resp = await fetch('/api/custom-quote', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(v)
      });
      if (resp.ok) {
        hide(formCard); show(successCard);
        successCard.scrollIntoView({ behavior: 'smooth', block: 'start' });
        setLoading(false); return;
      }
      // Server reachable but errored (e.g. email not configured) — offer mailto.
      offerFallback(v, 'We couldn’t send it automatically. Use the button below to email us directly.');
    } catch (e) {
      offerFallback(v, 'You appear to be offline. Use the button below to email us directly.');
    }
    setLoading(false);
  }

  function offerFallback(v, message) {
    formError.textContent = message; show(formError);
    fallbackLink.href = mailtoFallback(v);
    show(fallbackWrap);
  }

  if (submitBtn) submitBtn.addEventListener('click', submit);
  if (footerYear) footerYear.textContent = new Date().getFullYear();
})();
