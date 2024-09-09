FROM node:18-alpine

WORKDIR /opt/frontend-container-app-root/frontend-src-root

COPY ./host-frontend-root/frontend-src-root/package*.json /opt/frontend-container-app-root/frontend-src-root/

RUN npm install

COPY ./host-frontend-root/frontend-src-root /opt/frontend-container-app-root/frontend-src-root

CMD ["npm", "run", "dev"]