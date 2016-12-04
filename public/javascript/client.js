/******/ (function(modules) { // webpackBootstrap
/******/ 	// The module cache
/******/ 	var installedModules = {};

/******/ 	// The require function
/******/ 	function __webpack_require__(moduleId) {

/******/ 		// Check if module is in cache
/******/ 		if(installedModules[moduleId])
/******/ 			return installedModules[moduleId].exports;

/******/ 		// Create a new module (and put it into the cache)
/******/ 		var module = installedModules[moduleId] = {
/******/ 			exports: {},
/******/ 			id: moduleId,
/******/ 			loaded: false
/******/ 		};

/******/ 		// Execute the module function
/******/ 		modules[moduleId].call(module.exports, module, module.exports, __webpack_require__);

/******/ 		// Flag the module as loaded
/******/ 		module.loaded = true;

/******/ 		// Return the exports of the module
/******/ 		return module.exports;
/******/ 	}


/******/ 	// expose the modules object (__webpack_modules__)
/******/ 	__webpack_require__.m = modules;

/******/ 	// expose the module cache
/******/ 	__webpack_require__.c = installedModules;

/******/ 	// __webpack_public_path__
/******/ 	__webpack_require__.p = "";

/******/ 	// Load entry module and return exports
/******/ 	return __webpack_require__(0);
/******/ })
/************************************************************************/
/******/ ([
/* 0 */
/***/ function(module, exports, __webpack_require__) {

	'use strict';

	var input = __webpack_require__(1);
	var queueStatus = __webpack_require__(4)();

/***/ },
/* 1 */
/***/ function(module, exports, __webpack_require__) {

	'use strict';

	var socket = __webpack_require__(2);
	var textInput = document.getElementById('sayTextId');

	function handleKeyActivity(e, keyDown) {
	  var keyCode = e.keyCode ? e.keyCode : e.which;
	  var hasShift = e.shiftKey ? 1 : 0;
	  var hasCtrl = e.ctrlKey ? 1 : 0;
	  var hasAlt = e.altKey ? 1 : 0;
	  console.log(socket);
	  socket.emit('handle_key_event', { 'key_code': keyCode, 'is_shift_down': hasShift, 'is_ctrl_down': hasCtrl, 'is_alt_down': hasAlt, 'is_key_down': keyDown });
	}

	function handleTextInput(toSay) {
	  socket.emit('handle_say_text_event', { text: toSay });
	}

	function handleTextKeyDown(event) {
	  event.stopPropagation();
	  if (event.keyCode === 13) {
	    handleTextInput(textInput.value);
	  }
	};

	document.addEventListener('keydown', function (e) {
	  handleKeyActivity(e, true);
	});
	document.addEventListener('keyup', function (e) {
	  handleKeyActivity(e, false);
	});

	textInput.onkeydown = handleTextKeyDown;

/***/ },
/* 2 */
/***/ function(module, exports, __webpack_require__) {

	'use strict';

	var setupCozmoStream = __webpack_require__(3).setupCozmoStream;
	var updateImage = __webpack_require__(3).updateImage;
	var toStatic = __webpack_require__(3).toStatic;
	var toStream = __webpack_require__(3).toStream;

	var reconnectTimeout = void 0;
	var imageRedrawInterval = void 0;
	var halt = false;

	var socket = io('/', {
	  'reconnection': true,
	  'reconnectionDelay': 3000,
	  'reconnectionDelayMax': 10000,
	  'reconnectionAttempts': Infinity
	});

	function connect() {

	  socket.on('disconnect', function () {
	    toStatic();
	    window.clearInterval(imageRedrawInterval);
	    if (!halt) {
	      reconnectTimeout = setTimeout(function () {
	        socket.connect();
	      }, 3000);
	    }
	  });

	  socket.on('connect', function () {
	    toStream();
	    imageRedrawInterval = setInterval(function () {
	      updateImage(socket);
	    }, 60);
	  });

	  socket.on('halt', function () {
	    halt = true;
	  });

	  setupCozmoStream(socket);

	  window.onresize = function () {
	    setupCozmoStream(socket);
	  };
	}

	connect();

	module.exports = socket;

/***/ },
/* 3 */
/***/ function(module, exports) {

	'use strict';

	var canvas = document.getElementById('cozmoStream');
	var staticStream = document.getElementById('cozmoStatic');

	function updateImage(socket) {
	  socket.emit('handle_image_refresh_event', {});
	}

	function encode(input) {
	  var keyStr = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/=";
	  var output = "";
	  var chr1, chr2, chr3, enc1, enc2, enc3, enc4;
	  var i = 0;

	  while (i < input.length) {
	    chr1 = input[i++];
	    chr2 = i < input.length ? input[i++] : Number.NaN; // Not sure if the index 
	    chr3 = i < input.length ? input[i++] : Number.NaN; // checks are needed here

	    enc1 = chr1 >> 2;
	    enc2 = (chr1 & 3) << 4 | chr2 >> 4;
	    enc3 = (chr2 & 15) << 2 | chr3 >> 6;
	    enc4 = chr3 & 63;

	    if (isNaN(chr2)) {
	      enc3 = enc4 = 64;
	    } else if (isNaN(chr3)) {
	      enc4 = 64;
	    }
	    output += keyStr.charAt(enc1) + keyStr.charAt(enc2) + keyStr.charAt(enc3) + keyStr.charAt(enc4);
	  }
	  return output;
	}

	function setupCozmoStream(socket) {

	  canvas.width = window.innerWidth;
	  canvas.height = window.innerHeight;
	  staticStream.width = window.innerWidth;
	  staticStream.height = window.innerHeight;

	  var stream = canvas.getContext('2d');
	  stream.filter = 'sepia(70)';

	  var img = new Image();

	  img.onload = function () {
	    stream.drawImage(this, 0, 0, canvas.width, canvas.height);
	  };

	  img.src = 'assets/placeholder.gif';

	  socket.on('return_image', function (image) {
	    var bytes = new Uint8Array(image);

	    img.src = 'data:image/png;base64,' + encode(bytes);
	  });
	}

	function toStatic() {
	  canvas.style.display = 'none';
	  staticStream.style.display = 'block';
	}

	function toStream() {
	  canvas.style.display = 'block';
	  staticStream.style.display = 'none';
	}

	module.exports.setupCozmoStream = setupCozmoStream;
	module.exports.updateImage = updateImage;
	module.exports.toStatic = toStatic;
	module.exports.toStream = toStream;

/***/ },
/* 4 */
/***/ function(module, exports) {

	'use strict';

	module.exports = function queueStatus() {
	  var httpRequest = void 0;
	  var canvas = document.getElementById('cozmoStream');

	  function makeRequest(url) {
	    httpRequest = new XMLHttpRequest();

	    if (!httpRequest) {
	      return false;
	    }
	    httpRequest.onreadystatechange = updateContent;
	    httpRequest.open('GET', url);
	    httpRequest.send();
	  }

	  function updateContent() {
	    if (httpRequest.readyState === XMLHttpRequest.DONE) {
	      if (httpRequest.status === 200) {

	        if (!httpRequest.response) {
	          return;
	        }
	        var response = JSON.parse(httpRequest.response);

	        var text = '';
	        if (response.minutesLeftInQueue === false) {
	          text = 'up!';
	        } else {
	          text = 'in the queue. Approximately ' + response.minutesLeftInQueue + ' minute(s) left.';
	        }

	        document.getElementById('queueStatus').innerHTML = "<span>You're " + text + "</span>";
	      }
	    }
	  }

	  window.setInterval(function () {
	    makeRequest('/queue/minutesleft');
	  }, 2000);
	};

/***/ }
/******/ ]);