import { beforeAll, afterAll, test, expect, vi } from "vitest";
import { connectMongoDB } from "../../backend/server.js";
import mongoose from "mongoose";

import dotenv from "dotenv";

dotenv.config({ path: ".env.docker.test" });

beforeAll(async () => {
  // Mock Mongoose connection
  vi.spyOn(mongoose, "connect").mockResolvedValue({
    connection: mongoose.connection,
    db: mongoose.connection,
  });
  vi.spyOn(mongoose.connection, "close").mockResolvedValue();

  // Mock console.log to capture the success message
  vi.spyOn(console, "log");

  // Mock database operations as before
  const mockCollection = {
    insertOne: vi.fn().mockResolvedValue({ insertedId: "mockId" }),
    findOne: vi.fn().mockResolvedValue({ sessionId: "session1" }),
    deleteOne: vi.fn().mockResolvedValue({ deletedCount: 1 }),
  };
  vi.spyOn(mongoose.connection, "collection").mockReturnValue(mockCollection);
});

afterAll(() => {
  // Restore the original implementations
  mongoose.connect.mockRestore();
  mongoose.connection.collection.mockRestore();
  mongoose.connection.close.mockRestore();
  console.log.mockRestore(); // Restore console.log
});

test("should connect to MongoDB with success", async () => {
  await connectMongoDB(); // Adjusted line
  try {
    // Expect that console.log was called with the success message
    expect(console.log).toHaveBeenCalledWith("MongoDB Connected ✅");
  } finally {
    await mongoose.connection.close();
  }
});

test("should have the environment variables set", () => {
  assert.ok(process.env.MONGODB_URI, "MONGODB_URI should be defined");
});

test("should insert a document into the database", async () => {
  await connectMongoDB();
  const testDocument = {
    sessionId: "session1",
    userId: "user1",
    movieId: "movie1",
    seatsBooked: [],
    bookingPrice: 10,
    bookingStatus: "pending",
    bookingCreatedAt: new Date(),
  };
  const insertResult = await mongoose.connection
    .collection("booking_test")
    .insertOne(testDocument);
  assert.ok(insertResult.insertedId, "Inserted document should have an ID");
});

test("should query the database", async () => {
  await connectMongoDB();
  const result = await mongoose.connection
    .collection("booking_test")
    .findOne({ sessionId: "session1" });
  assert.ok(result, "Query result should be defined");
  assert.strictEqual(
    result.sessionId,
    "session1",
    "Document should be the one we inserted"
  );
});

test("should delete a document from the database", async () => {
  await connectMongoDB();
  const testDocument = await mongoose.connection
    .collection("booking_test")
    .findOne({ sessionId: "session1" });
  const deleteResult = await mongoose.connection
    .collection("booking_test")
    .deleteOne({ _id: testDocument._id });
  assert.strictEqual(
    deleteResult.deletedCount,
    1,
    "One document should be deleted"
  );
});
