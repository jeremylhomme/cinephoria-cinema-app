import { app } from "../backend/server";
import prisma from "../backend/config/prismaClient";

beforeAll(async () => {
  await prisma.$connect();
});

afterAll(async () => {
  await prisma.user.deleteMany();
  await prisma.$disconnect();
});

export default app;
