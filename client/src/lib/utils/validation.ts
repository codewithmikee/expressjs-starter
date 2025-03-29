/**
 * Validates a username string
 * @param username - The username to validate
 * @returns boolean - True if the username is valid
 */
export function isValidUsername(username: string): boolean {
  // Username should be 3-20 characters and only contain letters, numbers, underscores
  const usernameRegex = /^[a-zA-Z0-9_]{3,20}$/;
  return usernameRegex.test(username);
}

/**
 * Checks if a password meets security requirements
 * @param password - The password to validate
 * @returns Object containing validation result and message
 */
export function validatePassword(password: string): { isValid: boolean; message?: string } {
  if (password.length < 8) {
    return { isValid: false, message: "Password must be at least 8 characters long" };
  }
  
  // Check for at least one number
  if (!/\d/.test(password)) {
    return { isValid: false, message: "Password must contain at least one number" };
  }
  
  // Check for at least one uppercase letter
  if (!/[A-Z]/.test(password)) {
    return { isValid: false, message: "Password must contain at least one uppercase letter" };
  }
  
  return { isValid: true };
}