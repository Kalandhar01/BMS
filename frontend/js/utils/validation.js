const VALIDATION_RULES = {
  EMAIL: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
  PHONE: /^[6-9]\d{9}$/,
  PASSWORD_MIN: 6,
  PASSWORD_MAX: 20,
  NAME_MIN: 2,
  NAME_MAX: 50,
};

function validateEmail(email) {
  if (!email) return { valid: false, message: 'Email is required' };
  if (!VALIDATION_RULES.EMAIL.test(email)) return { valid: false, message: 'Please enter a valid email address' };
  return { valid: true };
}

function validatePassword(password) {
  if (!password) return { valid: false, message: 'Password is required' };
  if (password.length < VALIDATION_RULES.PASSWORD_MIN) return { valid: false, message: `Password must be at least ${VALIDATION_RULES.PASSWORD_MIN} characters` };
  if (password.length > VALIDATION_RULES.PASSWORD_MAX) return { valid: false, message: `Password must be at most ${VALIDATION_RULES.PASSWORD_MAX} characters` };
  return { valid: true };
}

function validatePhone(phone) {
  if (!phone) return { valid: true };
  if (!VALIDATION_RULES.PHONE.test(phone)) return { valid: false, message: 'Please enter a valid 10-digit phone number' };
  return { valid: true };
}

function validateName(name, field = 'Name') {
  if (!name || !name.trim()) return { valid: false, message: `${field} is required` };
  if (name.trim().length < VALIDATION_RULES.NAME_MIN) return { valid: false, message: `${field} must be at least ${VALIDATION_RULES.NAME_MIN} characters` };
  if (name.trim().length > VALIDATION_RULES.NAME_MAX) return { valid: false, message: `${field} must be at most ${VALIDATION_RULES.NAME_MAX} characters` };
  return { valid: true };
}

function validateConfirmPassword(password, confirmPassword) {
  if (!confirmPassword) return { valid: false, message: 'Please confirm your password' };
  if (password !== confirmPassword) return { valid: false, message: 'Passwords do not match' };
  return { valid: true };
}
