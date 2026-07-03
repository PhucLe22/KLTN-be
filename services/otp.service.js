// services/otp.service.js
import crypto from 'crypto';
import bcrypt from 'bcrypt';
import { prisma } from '../lib/prisma.js';

/**
 * Generate a numeric OTP code of given length.
 * Uses crypto.randomInt for cryptographic randomness.
 */
function generateCode(length = 6) {
  const min = Math.pow(10, length - 1);
  const max = Math.pow(10, length) - 1;
  return crypto.randomInt(min, max + 1).toString();
}

/**
 * Create and store a new OTP for the given email.
 * Returns the plain text code (to be sent to the user).
 */
export async function createOtp(email, length = 6, expiresIn = '5m') {
  const code = generateCode(length);
  const hashed = await bcrypt.hash(code, 10);

  // Parse expiresIn like '5m' or '10m' -> minutes
  const minutes = parseInt(expiresIn);
  const expiresAt = new Date(Date.now() + minutes * 60 * 1000);

  await prisma.otp.create({
    data: {
      email,
      code: hashed,
      expiresAt,
    },
  });

  return { code, expiresAt };
}

/**
 * Verify a provided OTP code.
 * Throws an error if the OTP is invalid or expired.
 */
export async function verifyOtp(email, providedCode) {
  const record = await prisma.otp.findFirst({
    where: { email },
    orderBy: { createdAt: 'desc' },
  });

  if (!record) {
    throw new Error('OTP not found');
  }

  if (new Date() > record.expiresAt) {
    throw new Error('OTP expired');
  }

  const valid = await bcrypt.compare(providedCode, record.code);
  if (!valid) {
    throw new Error('Invalid OTP');
  }

  // Invalidate the OTP after successful verification (delete it)
  await prisma.otp.delete({ where: { id: record.id } });
  return true;
}
