export const Validation = {
  required: (value, fieldName = 'This field') => {
    if (value === null || value === undefined || (typeof value === 'string' && value.trim() === '')) {
      return { valid: false, message: `${fieldName} is required` };
    }
    return { valid: true, message: '' };
  },

  email: (value) => {
    if (!value) return { valid: true, message: '' };
    const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!re.test(value)) {
      return { valid: false, message: 'Please enter a valid email address' };
    }
    return { valid: true, message: '' };
  },

  phone: (value) => {
    if (!value) return { valid: true, message: '' };
    const cleaned = value.replace(/[\s\-\(\)\.\+]/g, '');
    if (!/^\d{10,15}$/.test(cleaned)) {
      return { valid: false, message: 'Please enter a valid phone number (10-15 digits)' };
    }
    return { valid: true, message: '' };
  },

  url: (value) => {
    if (!value) return { valid: true, message: '' };
    try {
      new URL(value);
      return { valid: true, message: '' };
    } catch {
      return { valid: false, message: 'Please enter a valid URL' };
    }
  },

  minLength: (value, min) => {
    if (!value) return { valid: true, message: '' };
    if (value.length < min) {
      return { valid: false, message: `Must be at least ${min} characters` };
    }
    return { valid: true, message: '' };
  },

  maxLength: (value, max) => {
    if (!value) return { valid: true, message: '' };
    if (value.length > max) {
      return { valid: false, message: `Must be no more than ${max} characters` };
    }
    return { valid: true, message: '' };
  },

  min: (value, min, fieldName = 'Value') => {
    if (value === null || value === undefined || value === '') return { valid: true, message: '' };
    const num = Number(value);
    if (isNaN(num)) {
      return { valid: false, message: `${fieldName} must be a number` };
    }
    if (num < min) {
      return { valid: false, message: `${fieldName} must be at least ${min}` };
    }
    return { valid: true, message: '' };
  },

  max: (value, max, fieldName = 'Value') => {
    if (value === null || value === undefined || value === '') return { valid: true, message: '' };
    const num = Number(value);
    if (isNaN(num)) {
      return { valid: false, message: `${fieldName} must be a number` };
    }
    if (num > max) {
      return { valid: false, message: `${fieldName} must be no more than ${max}` };
    }
    return { valid: true, message: '' };
  },

  password: (value) => {
    if (!value) return { valid: true, message: '' };
    const errors = [];
    if (value.length < 8) errors.push('at least 8 characters');
    if (!/[A-Z]/.test(value)) errors.push('an uppercase letter');
    if (!/[a-z]/.test(value)) errors.push('a lowercase letter');
    if (!/[0-9]/.test(value)) errors.push('a number');
    if (!/[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(value)) errors.push('a special character');

    if (errors.length > 0) {
      return { valid: false, message: `Password must include ${errors.join(', ')}` };
    }
    return { valid: true, message: '' };
  },

  confirmPassword: (password, confirm) => {
    if (password !== confirm) {
      return { valid: false, message: 'Passwords do not match' };
    }
    return { valid: true, message: '' };
  },

  validateForm: (rules, data) => {
    const errors = {};
    let valid = true;

    for (const [field, fieldRules] of Object.entries(rules)) {
      const value = data[field];
      for (const rule of fieldRules) {
        const result = rule(value);
        if (!result.valid) {
          errors[field] = result.message;
          valid = false;
          break;
        }
      }
    }

    return { valid, errors };
  },
};
