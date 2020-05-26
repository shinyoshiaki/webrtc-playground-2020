
FROM node:11.15.0-alpine

RUN mkdir /src
WORKDIR /src
COPY ./server .
RUN npm install
COPY ./client ./client
RUN cd client && npm install && npm run build \
    && mv build .. && cd ..

EXPOSE 20000

CMD [ "npm","start" ]