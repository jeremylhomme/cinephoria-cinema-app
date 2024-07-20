import { exec } from "child_process";
import dotenv from "dotenv";
import fs from "fs";
import net from "net";

dotenv.config({ path: ".env.docker.test" });

const logFile = fs.createWriteStream("backend_start.log", { flags: "a" });

const log = (message) => {
  console.log(message);
  logFile.write(`${message}\n`);
};

const startBackend = () => {
  return new Promise((resolve, reject) => {
    const backend = exec("nodemon ./backend/server.js");
    backend.stdout.on("data", (data) => {
      log(`Backend: ${data}`);
      if (data.includes("Server running on port")) {
        resolve(backend);
      }
    });

    backend.stderr.on("data", (data) => {
      log(`Backend Error: ${data}`);
    });
    backend.on("close", (code) => {
      log(`Backend process exited with code ${code}`);
      if (code !== 0) {
        reject(`Backend process exited with code ${code}`);
      }
    });
  });
};

const checkPortAvailability = (host, port) => {
  return new Promise((resolve) => {
    const socket = new net.Socket();
    socket.setTimeout(1000);
    socket.on("connect", () => {
      socket.destroy();
      resolve(true);
    });
    socket.on("timeout", () => {
      socket.destroy();
      resolve(false);
    });
    socket.on("error", () => {
      socket.destroy();
      resolve(false);
    });
    socket.connect(port, host);
  });
};

const checkDatabaseConnections = async () => {
  const mysqlAvailable = await checkPortAvailability("mysql-db", 3306);
  const mongoAvailable = await checkPortAvailability("mongodb-db", 27017);

  log(`MySQL connection: ${mysqlAvailable ? "Available" : "Not available"}`);
  log(`MongoDB connection: ${mongoAvailable ? "Available" : "Not available"}`);

  if (!mysqlAvailable || !mongoAvailable) {
    throw new Error("One or more database connections are not available");
  }
};

const main = async () => {
  try {
    await checkDatabaseConnections();
    await startBackend();
    process.stdin.resume();
  } catch (error) {
    log(`Error: ${error.message}`);
    process.exit(1);
  }
};

main();
