FROM nodesource/jessie:6.3.1

RUN apt-get update && apt-get install -y \
  libzmq3-dev \
  libzmq3 \
  redis-server

ADD package.json package.json
RUN npm install
RUN nohup redis-server >/dev/null 2>&1 &
ADD . .
CMD ["npm","start"]
EXPOSE 3000
