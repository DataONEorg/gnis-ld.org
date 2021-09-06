# Dockerfile for GNIS-LD frontend
FROM node:alpine
MAINTAINER DataONE <support@dataone.org>

# web server
EXPOSE 80

# source code
WORKDIR /src/app
COPY . .

# install packages
RUN apk update && \
    apk upgrade

# install software
RUN npm i -g gulp
RUN npm i \
    && gulp

# entrypoint
CMD ["npm", "start"]
