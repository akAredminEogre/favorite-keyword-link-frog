FROM node:23.0-alpine3.19

WORKDIR /opt/frontend-container-app-root/frontend-src-root

COPY ./host-frontend-root/frontend-src-root /opt/frontend-container-app-root/frontend-src-root

RUN npm install

CMD ["npm", "run", "dev"]