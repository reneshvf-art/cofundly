/* ============================================
   CoFundly — suggest.js
   Form validation and submission handling
   ============================================ */

const VALIDATORS = {
  required: (v) => v.trim().length > 0,
  url: (v) => !v || /^(https?:\/\/)?[\w-]+(\.[\w-]+)+/.test(v.trim()),
  phone: (v) => !v || /^[\d\s\-\(\)\+]{7,}$/.test(v.trim()),
  email: (v) => !v || /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v.trim()),
  minLength: (min) => (v) => v.trim().length >= min,
};

function validateField(input) {
  const group = input.closest('.form-group');
  const errorEl = group?.querySelector('.form-error');
  let valid = true;
  let message = '';

  // Required
  if (input.dataset.required === 'true' && !VALIDATORS.required(input.value)) {
    valid = false;
    message = 'This field is required.';
  }
  // Min length
  else if (input.dataset.minlength && !VALIDATORS.minLength(parseInt(input.dataset.minlength))(input.value)) {
    valid = false;
    message = `Please enter at least ${input.dataset.minlength} characters.`;
  }
  // Email
  else if (input.type === 'email' && input.value && !VALIDATORS.email(input.value)) {
    valid = false;
    message = 'Please enter a valid email address.';
  }
  // URL
  else if (input.dataset.type === 'url' && input.value && !VALIDATORS.url(input.value)) {
    valid = false;
    message = 'Please enter a valid website URL.';
  }
  // Phone
  else if (input.dataset.type === 'phone' && input.value && !VALIDATORS.phone(input.value)) {
    valid = false;
    message = 'Please enter a valid phone number.';
  }

  input.classList.toggle('has-error', !valid);
  if (errorEl) {
    errorEl.textContent = message;
    errorEl.classList.toggle('visible', !valid);
  }

  return valid;
}

function initSuggestForm() {
  const form = document.getElementById('suggest-form');
  if (!form) return;

  // Real-time validation on blur
  form.querySelectorAll('input, textarea, select').forEach(input => {
    input.addEventListener('blur', () => validateField(input));
    input.addEventListener('input', () => {
      if (input.classList.contains('has-error')) validateField(input);
    });
  });

  // Submit
  form.addEventListener('submit', (e) => {
    e.preventDefault();
    const inputs = form.querySelectorAll('input[data-required], textarea[data-required], select[data-required]');
    let allValid = true;

    inputs.forEach(input => {
      if (!validateField(input)) allValid = false;
    });

    if (!allValid) {
      const firstError = form.querySelector('.has-error');
      firstError?.scrollIntoView({ behavior: 'smooth', block: 'center' });
      firstError?.focus();
      return;
    }

    // Simulate async submission
    const submitBtn = form.querySelector('[type="submit"]');
    const originalText = submitBtn.innerHTML;
    submitBtn.disabled = true;
    submitBtn.innerHTML = `<span style="display:inline-block;width:16px;height:16px;border:2px solid rgba(255,255,255,0.4);border-top-color:#fff;border-radius:50%;animation:spin 0.7s linear infinite"></span> Submitting...`;

    setTimeout(() => {
      showSuccess();
    }, 1400);
  });
}

function showSuccess() {
  const formWrapper = document.getElementById('form-wrapper');
  const successState = document.getElementById('success-state');
  if (formWrapper && successState) {
    formWrapper.style.display = 'none';
    successState.style.display = 'block';
    successState.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }
}

function resetForm() {
  const formWrapper = document.getElementById('form-wrapper');
  const successState = document.getElementById('success-state');
  const form = document.getElementById('suggest-form');
  if (formWrapper && successState) {
    successState.style.display = 'none';
    formWrapper.style.display = 'block';
    form?.reset();
    formWrapper.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }
}

window.resetForm = resetForm;

document.addEventListener('DOMContentLoaded', initSuggestForm);
