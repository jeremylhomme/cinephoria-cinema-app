import { test } from "vitest";
import dotenv from "dotenv";
import assert from "assert";
import prisma from "../../backend/config/prismaClient.js";

dotenv.config({ path: ".env.docker.test" });

test("Prisma client should be instantiated", () => {
  // Check if the Prisma client instance exists
  assert.ok(prisma, "Prisma client is not defined");
});

test("Prisma client should connect to the database", async () => {
  try {
    // Try to make a request to the database
    await prisma.$connect();
    // If the request is successful, the database connection works
    assert.doesNotThrow(() => prisma.$connect());
  } catch (error) {
    // If the request throws an error, the database connection doesn't work
    console.error("Prisma connection error:", error); // Log the error message
    assert.ok(false, "Prisma client could not connect to the database");
  } finally {
    // Disconnect from the database after the test
    if (prisma) {
      await prisma.$disconnect();
    }
  }
});
