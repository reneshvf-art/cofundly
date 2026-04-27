/* ============================================
   CoFundly — donate.js
   Amount selection + fake checkout flow
   ============================================ */

let selectedAmount = 10;
let isCustom = false;

function initDonateForm() {
  const form = document.getElementById('donate-form');
  if (!form) return;

  // Amount pill selection
  document.querySelectorAll('.amount-pill').forEach(pill => {
    pill.addEventListener('click', () => {
      document.querySelectorAll('.amount-pill').forEach(p => p.classList.remove('active'));
      pill.classList.add('active');

      const customWrap = document.getElementById('custom-amount-wrap');
      if (pill.dataset.custom) {
        isCustom = true;
        selectedAmount = null;
        customWrap.style.display = 'block';
        document.getElementById('custom-amount')?.focus();
      } else {
        isCustom = false;
        selectedAmount = parseInt(pill.dataset.amount);
        customWrap.style.display = 'none';
      }
      clearError('amount-error');
    });
  });

  // Real-time email validation on blur
  const emailInput = document.getElementById('donor-email');
  const nameInput = document.getElementById('donor-name');

  nameInput?.addEventListener('blur', () => validateDonorField(nameInput, 'donor-name-error'));
  nameInput?.addEventListener('input', () => {
    if (nameInput.classList.contains('has-error')) validateDonorField(nameInput, 'donor-name-error');
  });
  emailInput?.addEventListener('blur', () => validateDonorField(emailInput, 'donor-email-error'));
  emailInput?.addEventListener('input', () => {
    if (emailInput.classList.contains('has-error')) validateDonorField(emailInput, 'donor-email-error');
  });

  // Submit
  form.addEventListener('submit', (e) => {
    e.preventDefault();
    let allValid = true;

    // Validate amount
    if (isCustom) {
      const customVal = parseFloat(document.getElementById('custom-amount')?.value);
      if (!customVal || customVal < 1) {
        showError('amount-error', 'Please enter a valid donation amount (minimum $1).');
        allValid = false;
      } else {
        selectedAmount = customVal;
        clearError('amount-error');
      }
    } else if (!selectedAmount) {
      showError('amount-error', 'Please select a donation amount.');
      allValid = false;
    } else {
      clearError('amount-error');
    }

    // Validate name
    if (!validateDonorField(nameInput, 'donor-name-error')) allValid = false;

    // Validate email
    if (!validateDonorField(emailInput, 'donor-email-error')) allValid = false;

    if (!allValid) return;

    // Simulate async payment
    const submitBtn = document.getElementById('donate-submit');
    submitBtn.disabled = true;
    submitBtn.innerHTML = `<span style="display:inline-block;width:16px;height:16px;border:2px solid rgba(255,255,255,0.4);border-top-color:#fff;border-radius:50%;animation:spin 0.7s linear infinite"></span> Processing...`;

    setTimeout(() => {
      showDonateSuccess();
    }, 1600);
  });
}

function validateDonorField(input, errorId) {
  if (!input) return true;
  let valid = true;
  let message = '';

  if (input.dataset.required === 'true' && !input.value.trim()) {
    valid = false;
    message = 'This field is required.';
  } else if (input.dataset.type === 'email' && input.value && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(input.value)) {
    valid = false;
    message = 'Please enter a valid email address.';
  }

  input.classList.toggle('has-error', !valid);
  if (valid) clearError(errorId);
  else showError(errorId, message);
  return valid;
}

function showError(id, message) {
  const el = document.getElementById(id);
  if (!el) return;
  el.textContent = message;
  el.classList.add('visible');
}

function clearError(id) {
  const el = document.getElementById(id);
  if (!el) return;
  el.textContent = '';
  el.classList.remove('visible');
}

function showDonateSuccess() {
  const formWrapper = document.getElementById('form-wrapper');
  const successState = document.getElementById('success-state');
  const summary = document.getElementById('donation-summary');
  const name = document.getElementById('donor-name')?.value || 'Friend';
  const email = document.getElementById('donor-email')?.value || '';
  const amount = selectedAmount;

  if (summary) {
    summary.innerHTML = `
      <strong>Donation summary</strong><br>
      Amount: <strong>$${parseFloat(amount).toFixed(2)}</strong> ·
      Name: <strong>${name}</strong>${email ? ` · Confirmation to: <strong>${email}</strong>` : ''}
    `;
  }

  if (formWrapper && successState) {
    formWrapper.style.display = 'none';
    successState.style.display = 'block';
    successState.scrollIntoView({ behavior: 'smooth', block: 'start' });
    window.showToast?.('Thank you for your donation! 💛', '💛', 3500);
  }
}

function resetDonateForm() {
  const formWrapper = document.getElementById('form-wrapper');
  const successState = document.getElementById('success-state');
  const form = document.getElementById('donate-form');

  if (formWrapper && successState) {
    successState.style.display = 'none';
    formWrapper.style.display = 'block';
    form?.reset();

    // Reset amount pills to default $10
    document.querySelectorAll('.amount-pill').forEach(p => p.classList.remove('active'));
    document.querySelector('.amount-pill[data-amount="10"]')?.classList.add('active');
    selectedAmount = 10;
    isCustom = false;
    document.getElementById('custom-amount-wrap').style.display = 'none';

    const submitBtn = document.getElementById('donate-submit');
    if (submitBtn) {
      submitBtn.disabled = false;
      submitBtn.innerHTML = 'Complete donation →';
    }

    formWrapper.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }
}

window.resetDonateForm = resetDonateForm;

document.addEventListener('DOMContentLoaded', initDonateForm);
