# Dockerfile for GNIS-LD frontend
FROM node:9
MAINTAINER Blake Regalia <blake.regalia@gmail.com>

# source code
WORKDIR /src/app
COPY . .

# install packages
RUN apt-get -y update \
    && apt-get upgrade -y

# install software
RUN npm i -g gulp
RUN npm i \
    && gulp

# entrypoint
ENTRYPOINT ["npm", "run"]
CMD ["all"]
