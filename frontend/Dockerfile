FROM node:18-alpine

WORKDIR /frontend


ARG DOMAIN_NAME
ARG DOCKER_BACKEND_HOSTNAME
ARG DOCKER_BACKEND_PORT

# ENV NODE_ENV=production
ENV NEXT_PUBLIC_URL=https://${DOMAIN_NAME}
ENV NEXT_PUBLIC_WEBSOCKET_URL=wss://${DOMAIN_NAME}
ENV NEXT_PRIVATE_URL=http://${DOCKER_BACKEND_HOSTNAME}:${DOCKER_BACKEND_PORT}

# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm install

# Copy the rest of the application
COPY . .

EXPOSE 3000

CMD ["npm", "run", "dev"]

# Build the application
# RUN npm run build


# CMD ["npm", "run", "start"]
