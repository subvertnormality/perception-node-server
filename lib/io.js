function init(rpcStub, http) {

    const io = require('socket.io')(http);

    io.on('connection', function(socket){

        console.log('A user connected');

        socket.on('handle_key_event', function(payload){

            if (!payload['key_code']) {
                return;
            }

            rpcStub.handleKeyEvent(payload, function(error, res) {});
        });

        socket.on('handle_image_refresh_event', function(payload){
            rpcStub.handleImageGetEvent({}, function(error, img) {
                if (!img || error) {
                    return;
                }
                socket.emit('return_image', img.image)
                return;
            });
        });

        socket.on('handle_say_text_event', function(payload){

            if (!payload['text']) {
                return;
            }

            rpcStub.handleSayTextEvent(payload, function(error, res) {});
        });

    });

}

module.exports = init;