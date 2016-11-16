var socket = io('/');

function handleKeyActivity (e, keyDown) {
    var keyCode  = (e.keyCode ? e.keyCode : e.which);
    var hasShift = (e.shiftKey ? 1 : 0)
    var hasCtrl  = (e.ctrlKey  ? 1 : 0)
    var hasAlt   = (e.altKey   ? 1 : 0)

    socket.emit(
        'handle_key_event', 
        {'key_code': keyCode, 'is_shift_down': hasShift, 'is_ctrl_down': hasCtrl, 'is_alt_down': hasAlt, 'is_key_down': keyDown}
    );
}

function encode (input) {
    var keyStr = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/=";
    var output = "";
    var chr1, chr2, chr3, enc1, enc2, enc3, enc4;
    var i = 0;

    while (i < input.length) {
        chr1 = input[i++];
        chr2 = i < input.length ? input[i++] : Number.NaN; // Not sure if the index 
        chr3 = i < input.length ? input[i++] : Number.NaN; // checks are needed here

        enc1 = chr1 >> 2;
        enc2 = ((chr1 & 3) << 4) | (chr2 >> 4);
        enc3 = ((chr2 & 15) << 2) | (chr3 >> 6);
        enc4 = chr3 & 63;

        if (isNaN(chr2)) {
            enc3 = enc4 = 64;
        } else if (isNaN(chr3)) {
            enc4 = 64;
        }
        output += keyStr.charAt(enc1) + keyStr.charAt(enc2) +
                keyStr.charAt(enc3) + keyStr.charAt(enc4);
    }
    return output;
}

function updateImage() {
    socket.emit(
        'handle_image_refresh_event', 
        {}
    );
}

function encode (input) {
    var keyStr = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/=";
    var output = "";
    var chr1, chr2, chr3, enc1, enc2, enc3, enc4;
    var i = 0;

    while (i < input.length) {
        chr1 = input[i++];
        chr2 = i < input.length ? input[i++] : Number.NaN; // Not sure if the index 
        chr3 = i < input.length ? input[i++] : Number.NaN; // checks are needed here

        enc1 = chr1 >> 2;
        enc2 = ((chr1 & 3) << 4) | (chr2 >> 4);
        enc3 = ((chr2 & 15) << 2) | (chr3 >> 6);
        enc4 = chr3 & 63;

        if (isNaN(chr2)) {
            enc3 = enc4 = 64;
        } else if (isNaN(chr3)) {
            enc4 = 64;
        }
        output += keyStr.charAt(enc1) + keyStr.charAt(enc2) +
                keyStr.charAt(enc3) + keyStr.charAt(enc4);
    }
    return output;
}

function handleTextInput(textField) {
    event.stopPropagation();
    if (event.keyCode == 13) {
        textEntered = textField.value
        socket.emit(
            'handle_say_text_event', 
            {text: textEntered}
        );
    }
}

socket.on('return_image', function(image) {

    var bytes = new Uint8Array(image);

    document.getElementById('cozmoImageId').src='data:image/png;base64,'+encode(bytes);
});

document.addEventListener('keydown', function(e) { handleKeyActivity(e, true) });
document.addEventListener('keyup',   function(e) { handleKeyActivity(e, false) });

setInterval(updateImage , 60);
