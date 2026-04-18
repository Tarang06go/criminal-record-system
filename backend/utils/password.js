const crypto = require("crypto");

const DEFAULT_ITERATIONS = 100000;
const KEY_LENGTH = 64;
const DIGEST = "sha512";

function hashPassword(password) {
  const salt = crypto.randomBytes(16).toString("hex");
  const hash = crypto
    .pbkdf2Sync(password, salt, DEFAULT_ITERATIONS, KEY_LENGTH, DIGEST)
    .toString("hex");

  return `${DEFAULT_ITERATIONS}:${salt}:${hash}`;
}

function verifyPassword(password, storedHash) {
  if (!storedHash || typeof storedHash !== "string") {
    return false;
  }

  const [iterationsText, salt, originalHash] = storedHash.split(":");
  const iterations = Number(iterationsText);

  if (!iterations || !salt || !originalHash) {
    return false;
  }

  const calculatedHash = crypto
    .pbkdf2Sync(password, salt, iterations, originalHash.length / 2, DIGEST)
    .toString("hex");

  if (calculatedHash.length !== originalHash.length) {
    return false;
  }

  return crypto.timingSafeEqual(
    Buffer.from(calculatedHash, "hex"),
    Buffer.from(originalHash, "hex")
  );
}

module.exports = {
  hashPassword,
  verifyPassword
};