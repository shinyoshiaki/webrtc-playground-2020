
FROM node:11.15.0-stretch

RUN mkdir /src
WORKDIR /src
COPY ./server .
RUN npm install
COPY ./client ./client
RUN cd client && npm install && npm run build \
    && mv build/* .. && cd ..

CMD [ "npm","run","start" ]