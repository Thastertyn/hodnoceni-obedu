# Stage 1: Build the React app
FROM node:20 AS build

WORKDIR /app

# Copy only package files first for better caching
COPY package.json package-lock.json ./

# Install dependencies
RUN npm ci

# Copy the rest of the project
COPY . .

# Build the production React app
RUN npm run build


# Stage 2: Serve the built app using `serve`
FROM node:20 AS production

# Install `serve` globally
RUN npm install -g serve

WORKDIR /app

# Copy the built files from previous stage
COPY --from=build /app/build ./build

# Expose the port
EXPOSE 3000

# Serve the app
CMD ["serve", "-s", "build"]
