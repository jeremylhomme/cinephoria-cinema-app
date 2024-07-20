# Use an official Node runtime as the base image
FROM node:20-alpine

# Set the working directory in the container to /usr/src/app
WORKDIR /usr/src/app

# Install necessary packages
RUN apk add --no-cache \
    netcat-openbsd \
    bash \
    xvfb \
    chromium \
    harfbuzz \
    nss \
    freetype \
    ttf-freefont \
    libc6-compat

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