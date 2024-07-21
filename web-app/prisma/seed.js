import { PrismaClient } from "@prisma/client";
import {
  hashPassword,
  generatePassword,
  generateVerificationCode,
} from "../backend/utils/userPasswordUtils.js";
import { sendEmail } from "../backend/utils/sendEmail.js";
import dotenv from "dotenv";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({ path: path.resolve(__dirname, "../.env") });

const prisma = new PrismaClient();

async function createAdminUser() {
  const userFirstName = process.env.ADMIN_FIRST_NAME;
  const userLastName = process.env.ADMIN_LAST_NAME;
  const userEmail = process.env.ADMIN_EMAIL;
  const userUserName = process.env.ADMIN_USERNAME;
  const userRole = "admin";

  try {
    const adminExists = await prisma.user.findFirst({
      where: {
        userRole: "admin",
      },
    });

    if (adminExists) {
      console.log("An admin user already exists.");
      return;
    }

    const userPassword = generatePassword();
    const hashedPassword = await hashPassword(userPassword);
    if (!hashedPassword) {
      console.log("Failed to process userPassword, please try again.");
      return;
    }

    const verificationCode = generateVerificationCode();
    const verificationCodeExpires = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 hours from now

    const newUser = await prisma.user.create({
      data: {
        userFirstName,
        userLastName,
        userUserName,
        userEmail,
        userPassword: hashedPassword,
        userRole,
        mustChangePassword: true,
        isVerified: true,
        agreedPolicy: true,
        agreedCgvCgu: true,
        verificationCode,
        verificationCodeExpires,
      },
    });

    const verificationLink = `${process.env.WEB_APP_FRONTEND_URL}verify-email?code=${verificationCode}`;
    await sendEmail({
      from: `Cinéphoria <bonjour@${process.env.MAILGUN_DOMAIN}>`,
      to: userEmail,
      subject: "Votre compte administrateur Cinéphoria",
      template: "create_new_user",
      variables: {
        verificationLink,
        userPassword,
        userFirstName,
        userLastName,
        userUserName,
        userEmail,
      },
    });

    console.log("Admin user created successfully.");
    console.log("Admin Details:", {
      id: newUser.id,
      userFirstName: newUser.userFirstName,
      userLastName: newUser.userLastName,
      userUserName: newUser.userUserName,
      userEmail: newUser.userEmail,
      userRole: newUser.userRole,
    });
    console.log("An email has been sent to the admin with login details.");
  } catch (error) {
    console.error("Error creating admin user:", error);
  }
}

async function main() {
  await createAdminUser();
}

main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
