
FROM node:11.15.0-stretch

RUN apt update &&\
    apt install git curl -y && \
    curl -o- -L https://yarnpkg.com/install.sh | sh

ENV PATH $HOME/.yarn/bin:$HOME/.config/yarn/global/node_modules/.bin:$PATH

RUN mkdir /src
WORKDIR /src
COPY ./server .
RUN yarn

EXPOSE 20000

CMD [ "yarn","start" ]