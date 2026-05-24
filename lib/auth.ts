export interface PasswordValidationItem {
  id: string;
  label: string;
  isValid: boolean;
}

export const passwordValidationRules = [
  {
    id: "length",
    label: "At least 8 characters",
    test: (password: string) => password.length >= 8,
  },
  {
    id: "uppercase",
    label: "At least one uppercase letter",
    test: (password: string) => /[A-Z]/.test(password),
  },
  {
    id: "number",
    label: "At least one number",
    test: (password: string) => /\d/.test(password),
  },
  {
    id: "special",
    label: "At least one special character",
    test: (password: string) => /[^A-Za-z0-9]/.test(password),
  },
] as const;

export type PasswordValidationRule = (typeof passwordValidationRules)[number];

export function getPasswordValidation(password: string): PasswordValidationItem[] {
  return passwordValidationRules.map((rule) => ({
    id: rule.id,
    label: rule.label,
    isValid: rule.test(password),
  }));
}

export function isPasswordStrong(password: string): boolean {
  return getPasswordValidation(password).every((rule) => rule.isValid);
}

export function isEmailValid(email: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim());
}

export function getAuthErrorMessage(errorMessage: string | null | undefined): string {
  if (!errorMessage) return "Unable to complete authentication. Please try again.";

  const normalized = errorMessage.toLowerCase();

  if (normalized.includes("invalid login credentials") || normalized.includes("invalid password")) {
    return "Invalid email or password.";
  }

  if (normalized.includes("user already registered") || normalized.includes("duplicate")) {
    return "An account with that email already exists.";
  }

  if (normalized.includes("password should be at least")) {
    return "Password must be at least 8 characters and include uppercase, numbers, and symbols.";
  }

  if (normalized.includes("email not verified") || normalized.includes("verification")) {
    return "Confirm your email address before signing in.";
  }

  return errorMessage;
}
