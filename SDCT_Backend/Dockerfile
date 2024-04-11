FROM node:alpine
RUN mkdir /SDCT
WORKDIR /SDCT
COPY package.json /SDCT
RUN npm install
RUN apk update && apk upgrade
RUN apk add --no-cache sqlite
COPY . .
EXPOSE 8000
CMD ["npm", "start"]
