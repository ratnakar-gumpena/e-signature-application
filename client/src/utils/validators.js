export const validateEmail = (email) => {
  const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return re.test(email);
};

export const validatePassword = (password) => {
  return password.length >= 6;
};

export const validateRequired = (value) => {
  return value && value.trim().length > 0;
};

export const validateFile = (file) => {
  if (!file) return { valid: false, error: 'File is required' };

  const allowedTypes = ['application/pdf'];
  if (!allowedTypes.includes(file.type)) {
    return { valid: false, error: 'Only PDF files are allowed' };
  }

  const maxSize = 10 * 1024 * 1024;
  if (file.size > maxSize) {
    return { valid: false, error: 'File size must be less than 10MB' };
  }

  return { valid: true };
};

export const validateRecipients = (recipients) => {
  if (!Array.isArray(recipients) || recipients.length === 0) {
    return { valid: false, error: 'At least one recipient is required' };
  }

  for (let i = 0; i < recipients.length; i++) {
    const recipient = recipients[i];

    if (!validateRequired(recipient.name)) {
      return { valid: false, error: `Recipient ${i + 1}: Name is required` };
    }

    if (!validateEmail(recipient.email)) {
      return { valid: false, error: `Recipient ${i + 1}: Invalid email address` };
    }
  }

  return { valid: true };
};
