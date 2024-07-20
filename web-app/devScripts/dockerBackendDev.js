import { exec } from "child_process";
import dotenv from "dotenv";
import fs from "fs";

dotenv.config({ path: ".env.docker.dev" });

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

const checkDatabaseConnections = async () => {
  const mysqlConnection = exec("nc -zv mysql-db 3306");
  const mongoConnection = exec("nc -zv mongodb-db 27017");

  mysqlConnection.stdout.on("data", (data) => {
    log(`MySQL: ${data}`);
  });

  mysqlConnection.stderr.on("data", (data) => {
    log(`MySQL Error: ${data}`);
  });

  mongoConnection.stdout.on("data", (data) => {
    log(`MongoDB: ${data}`);
  });

  mongoConnection.stderr.on("data", (data) => {
    log(`MongoDB Error: ${data}`);
  });
};

const main = async () => {
  try {
    await checkDatabaseConnections();
    await startBackend();
    process.stdin.resume();
  } catch (error) {
    log(`Error starting backend: ${error}`);
    process.exit(1);
  }
};

main();
