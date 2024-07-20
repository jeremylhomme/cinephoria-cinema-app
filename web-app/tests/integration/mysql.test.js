import { beforeAll, afterAll, test, expect, vi } from "vitest";
import { connectMySQL } from "../../backend/server.js";
import mysql from "mysql2/promise";
import dotenv from "dotenv";

dotenv.config({ path: ".env.docker.test" });

let mockPool;
let mockConnection;

beforeAll(() => {
  // Mock MySQL connection
  mockConnection = {
    release: vi.fn(),
    query: vi.fn(),
  };
  mockPool = {
    getConnection: vi.fn().mockResolvedValue(mockConnection),
    end: vi.fn().mockResolvedValue(),
  };
  vi.spyOn(mysql, "createPool").mockReturnValue(mockPool);

  // Mock console.log to capture the success message
  vi.spyOn(console, "log");
  vi.spyOn(console, "error").mockImplementation(() => {});
});

afterAll(() => {
  // Restore the original implementations
  mysql.createPool.mockRestore();
  console.log.mockRestore();
  console.error.mockRestore();
});

test("should connect to MySQL with success", async () => {
  const result = await connectMySQL();

  expect(mysql.createPool).toHaveBeenCalledWith({
    host: process.env.MYSQL_HOST,
    user: process.env.MYSQL_USER,
    password: process.env.MYSQL_PASSWORD,
    port: process.env.MYSQL_PORT || 3306,
    connectTimeout: 60000,
  });

  expect(mockPool.getConnection).toHaveBeenCalled();
  expect(console.log).toHaveBeenCalledWith(
    `MySQL Connected: ${process.env.MYSQL_HOST} ✅`
  );

  expect(result).toEqual({
    connection: mockConnection,
    pool: mockPool,
    host: process.env.MYSQL_HOST,
    user: process.env.MYSQL_USER,
    port: process.env.MYSQL_PORT || 3306,
    password: process.env.MYSQL_PASSWORD,
  });
});

test("should have the environment variables set", () => {
  expect(process.env.MYSQL_HOST).toBeDefined();
  expect(process.env.MYSQL_USER).toBeDefined();
  expect(process.env.MYSQL_PASSWORD).toBeDefined();
  expect(process.env.MYSQL_PORT).toBeDefined();
});

test("should execute a query", async () => {
  await connectMySQL();

  const mockQueryResult = [{ id: 1, name: "Test" }];
  mockConnection.query.mockResolvedValueOnce([mockQueryResult]);

  const [result] = await mockConnection.query("SELECT * FROM test_table");

  expect(mockConnection.query).toHaveBeenCalledWith("SELECT * FROM test_table");
  expect(result).toEqual(mockQueryResult);
});

test("should handle connection error", async () => {
  mockPool.getConnection.mockRejectedValueOnce(new Error("Connection error"));

  await expect(connectMySQL()).rejects.toThrow("Connection error");
});
