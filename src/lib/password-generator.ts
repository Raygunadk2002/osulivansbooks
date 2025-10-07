/**
 * Generate a secure random password
 * @param length - Length of the password (default: 12)
 * @returns A secure random password
 */
export function generateSecurePassword(length: number = 12): string {
  const lowercase = 'abcdefghijklmnopqrstuvwxyz';
  const uppercase = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
  const numbers = '0123456789';
  const symbols = '!@#$%^&*';
  
  const allChars = lowercase + uppercase + numbers + symbols;
  
  let password = '';
  
  // Ensure at least one character from each category
  password += lowercase[Math.floor(Math.random() * lowercase.length)];
  password += uppercase[Math.floor(Math.random() * uppercase.length)];
  password += numbers[Math.floor(Math.random() * numbers.length)];
  password += symbols[Math.floor(Math.random() * symbols.length)];
  
  // Fill the rest with random characters
  for (let i = 4; i < length; i++) {
    password += allChars[Math.floor(Math.random() * allChars.length)];
  }
  
  // Shuffle the password to avoid predictable patterns
  return password.split('').sort(() => Math.random() - 0.5).join('');
}

/**
 * Generate a memorable password (easier to type/share)
 * @param length - Length of the password (default: 10)
 * @returns A memorable random password
 */
export function generateMemorablePassword(length: number = 10): string {
  const consonants = 'bcdfghjklmnpqrstvwxyz';
  const vowels = 'aeiou';
  
  let password = '';
  
  for (let i = 0; i < length; i++) {
    if (i % 2 === 0) {
      // Even positions: consonants
      password += consonants[Math.floor(Math.random() * consonants.length)];
    } else {
      // Odd positions: vowels
      password += vowels[Math.floor(Math.random() * vowels.length)];
    }
  }
  
  // Add a number at the end
  password += Math.floor(Math.random() * 10);
  
  return password;
}
