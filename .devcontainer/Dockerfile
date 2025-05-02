# .devcontainer/Dockerfile
FROM node:20-slim

# Install needed packages
RUN apt-get update && apt-get install -y \
  git \
  curl \
  postgresql-client \
  && rm -rf /var/lib/apt/lists/*

# Optional: set working directory
WORKDIR /workspaces/rainy-day
