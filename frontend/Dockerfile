# ---------- Build Stage ----------
FROM node:22-alpine AS build

WORKDIR /frontend

COPY package*.json ./
RUN npm install

COPY . .
RUN npm run build


# ---------- Production Stage ----------
FROM node:22-alpine

WORKDIR /app

# install static server
RUN npm install -g serve

# copy built files
COPY --from=build /frontend/dist ./dist

EXPOSE 3000

CMD ["serve", "-s", "dist", "-l", "3000"]
