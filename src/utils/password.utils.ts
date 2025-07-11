import { randomBytes } from 'crypto';

function generateRandomPassword(length: number): string {
  const byteLength = Math.ceil(length / 2); // Random bytes needed
  const randomBuffer = randomBytes(byteLength);

  // Convert the buffer into a string and limit to the desired password length
  return randomBuffer.toString('base64').slice(0, length);
}

export { generateRandomPassword };
