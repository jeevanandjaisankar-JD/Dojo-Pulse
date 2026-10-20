
const MENTOR_DOMAIN = '@kalvium.com';
const STUDENT_DOMAIN = '@kalvium.community';

// Example: student1.surname.s.138@kalvium.community
const STUDENT_EMAIL_PATTERN =
  /^([a-z0-9]+(?:[._-][a-z0-9]+)*)\.s\.(\d+)@kalvium\.community$/i;

const classifyKalviumEmail = (email) => {
  if (typeof email !== 'string') {
    return null;
  }

  const normalizedEmail = email.trim().toLowerCase();

  if (
    !normalizedEmail ||
    normalizedEmail.length > 254 ||
    !/^[^\s@]+@[^\s@]+$/.test(normalizedEmail)
  ) {
    return null;
  }

  if (normalizedEmail.endsWith(MENTOR_DOMAIN)) {
    return {
      email: normalizedEmail,
      role: 'mentor',
      squad: null
    };
  }

  if (normalizedEmail.endsWith(STUDENT_DOMAIN)) {
    const match = normalizedEmail.match(STUDENT_EMAIL_PATTERN);

    if (!match) {
      return null;
    }

    return {
      email: normalizedEmail,
      role: 'student',
      squad: `S.${match[2]}`
    };
  }

  return null;
};

module.exports = { classifyKalviumEmail };
