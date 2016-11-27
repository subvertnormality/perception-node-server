FROM nodesource/jessie:6.3.1

RUN apt-get update && apt-get install -y \
  libzmq3-dev \
  libzmq3

WORKDIR /usr/perception
ADD package.json package.json
RUN npm install --production
ADD . .
CMD ["npm","start"]
EXPOSE 3000
