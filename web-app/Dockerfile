# Use an official Node runtime as the base image (Debian-based)
FROM node:20-bullseye-slim

# Set the working directory in the container to /usr/src/app
WORKDIR /usr/src/app

# Install necessary packages
RUN apt-get update && apt-get install -y \
    netcat-openbsd \
    xvfb \
    libgtk2.0-0 \
    libgtk-3-0 \
    libgbm-dev \
    libnotify-dev \
    libgconf-2-4 \
    libnss3 \
    libxss1 \
    libasound2 \
    libxtst6 \
    xauth \
    xvfb \
    && rm -rf /var/lib/apt/lists/*

# Copy package.json and package-lock.json to the working directory
COPY package*.json ./

# Copy prisma schema to the working directory
COPY prisma/schema.prisma ./prisma/

# Install any needed packages specified in package.json
RUN npm install

# Install the Prisma CLI
RUN npm install -g prisma

# Copy the current directory contents into the container at /usr/src/app
COPY . .

# Set environment variable for Cypress
ENV CYPRESS_CACHE_FOLDER=/root/.cache/Cypress