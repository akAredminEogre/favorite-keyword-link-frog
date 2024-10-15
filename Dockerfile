FROM node:18-alpine

WORKDIR /opt/frontend-container-app-root/frontend-src-root

COPY ./host-frontend-root/frontend-src-root /opt/frontend-container-app-root/frontend-src-root

RUN npm install

CMD ["npm", "run", "dev"]