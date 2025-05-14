// src/lib/server/authUtils.js
import { createHash } from 'crypto';

export function hashPassword(password) {
  const sha256 = createHash('sha256');
  sha256.update(password);
  return sha256.digest('hex');
}

console.log(hashPassword("ex123PLETUM"));