FROM node:16 
WORKDIR /usr/src/app
COPY package*.json ./
RUN npm install
RUN npm install express
RUN npm install random-bytes
RUN npm install gps-distance
RUN npm install cors
RUN npm install request
RUN npm install multer
RUN npm install sqlite3

COPY . .
EXPOSE 8888
CMD node main.js 

