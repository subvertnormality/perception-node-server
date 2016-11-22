function queueMiddleware(socket, next){

    if (socket.request.headers.cookie) {
        return next();
    }

    return next(new Error('Authentication error'));
}

module.exports = queueMiddleware;