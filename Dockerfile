FROM nodesource/jessie:6.3.1

RUN apt-get update && apt-get install -y \
  libzmq3-dev \
  libzmq3

RUN npm install forever -g

WORKDIR /usr/perception
ADD package.json package.json
RUN npm install --production
ADD . .
CMD ["forever","start","server.js"]
EXPOSE 3000
