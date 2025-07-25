FROM node:20-alpine

WORKDIR /app

# Copy package files
COPY ./common ./common
COPY ./bff-server/package*.json ./bff-server/
COPY ./bff-server/tsconfig.json ./bff-server/

# Install dependencies for common and bff-server
WORKDIR /app/common
RUN npm install

WORKDIR /app/bff-server
RUN npm install

# Copy source code and data
COPY ./bff-server/src ./src

# Build the application
RUN npm run build

# Copy data files to dist directory after build
RUN cp -r ./src/data ./dist/
RUN echo "=== Directory structure after build ===" && \
    ls -la ./dist/ && \
    echo "=== Data directory contents ===" && \
    ls -la ./dist/data/

# Expose port
EXPOSE 3001

# Start the application
CMD ["npm", "start"]
