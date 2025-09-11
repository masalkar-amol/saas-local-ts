# ---------- deps stage ----------
FROM node:20-alpine AS deps
WORKDIR /app

# Copy manifest(s). The wildcard copies package-lock.json if it exists.
COPY package.json package-lock.json* ./

# Use npm ci when a lockfile exists, otherwise fallback to npm install
RUN if [ -f package-lock.json ] || [ -f npm-shrinkwrap.json ]; then \
      npm ci --no-audit --no-fund ; \
    else \
      npm install --no-audit --no-fund ; \
    fi

# ---------- build stage ----------
FROM node:20-alpine AS build
WORKDIR /app

# Reuse node_modules for faster builds
COPY --from=deps /app/node_modules ./node_modules
# Copy the rest of the source
COPY . .

# Build the app (supports CRA/Vite/Next static export)
RUN npm run build

# Normalize output to /app/_out
# - CRA: build/
# - Vite: dist/
# If neither exists, fail so CI shows a clear error.
RUN if [ -d build ]; then \
      cp -r build /app/_out; \
    elif [ -d dist ]; then \
      cp -r dist /app/_out; \
    else \
      echo "ERROR: No build output directory found (expected ./build or ./dist)."; \
      exit 1; \
    fi

# ---------- runtime stage ----------
FROM node:20-alpine AS runner
WORKDIR /app

# Lightweight static server on port 3000 (matches your ECS/CDK mapping)
RUN npm i -g serve

# Copy built static site
COPY --from=build /app/_out ./public

EXPOSE 3000
# -s = single-page app mode (history API fallback), -l = listen port
CMD ["serve", "-s", "public", "-l", "3000"]
