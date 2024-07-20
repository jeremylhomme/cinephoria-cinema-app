import bcrypt from "bcryptjs";
import crypto from "crypto";

const hashPassword = async (userPassword) => {
  const saltRounds = 10;
  const hashedPassword = await bcrypt.hash(userPassword, saltRounds);
  return hashedPassword;
};

const generatePassword = () => {
  const chars =
    "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!@#$%^&*()";
  let password = "";
  for (let i = 0; i < 12; i++) {
    password += chars[Math.floor(Math.random() * chars.length)];
  }
  return password;
};

const generateVerificationCode = () => {
  return crypto.randomBytes(32).toString("hex");
};

const isStrongPassword = (password) => {
  const minLength = 8;
  const hasUpperCase = /[A-Z]/.test(password);
  const hasLowerCase = /[a-z]/.test(password);
  const hasNumbers = /\d/.test(password);
  const hasSpecialChar = /[!@#$%^&*(),.?":{}|<>]/.test(password);

  return (
    password.length >= minLength &&
    hasUpperCase &&
    hasLowerCase &&
    hasNumbers &&
    hasSpecialChar
  );
};

export {
  hashPassword,
  generatePassword,
  generateVerificationCode,
  isStrongPassword,
};
