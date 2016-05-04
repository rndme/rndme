// rndme: video.js, by dandavis - capture unpredictable data from user camera
if(typeof rndme==="undefined") var rndme = {};

rndme.video=getRandomFromVideo;
  
function getRandomFromVideo(callback) { // returns a 64 char base64url string
	"use strict";
	var canvas = document.createElement("canvas"),
		ctx = canvas.getContext("2d"),
		webkit = false,
		moz = false,
		v = null,
		W = 320,
		H = 240,
		n = navigator,
		v = document.createElement("video");

	if(n.getUserMedia) {
		n.getUserMedia({
			video: {
				width: W,
				height: H,
				framerate: 30, 
				facingMode: "environment",
			}
		}, success, console.error.bind(console));
	} else if(n.webkitGetUserMedia) {
		webkit = true;
		n.webkitGetUserMedia({
			video: {
				facingMode: "environment",
				width: W,
				height: H,
				optional: []
			}
		}, success, console.error.bind(console));
	} else if(n.mozGetUserMedia) {
		moz = true;
		n.mozGetUserMedia({
			video: {
				facingMode: "environment",
				width: W,
				height: H,
			},
			audio: false
		}, success, console.error.bind(console));
	}


	function dumpCanvas() {
			var sig = crypto.getRandomValues(new Uint32Array(64)),
			chars = "wp7aY_xzcFLfmoyQqu51KWsZEvOb9XJSP3tin06dR-ClUkGeMVIjgr2NDH4hBT8A".split().sort(function munge(a, b) {
				return Math.random() > .5 ? 1 : -1;
			}).join(""),
			r = [],
			taken = 0,
			data = ctx.getImageData(0, 0, W, H).data;

			
		for(var i = data[1], mx = data.length; i < mx; i++) {
			var v = data[i];
			if(v > 0 && v < 255) {
				var slot = taken++ % 64;
				sig[slot] = (sig[slot] + v) % 255;
			}
		}

		//keygen and dump:
		sig = [].slice.call(sig).map(function(a) {
			var s = parseInt("0" + a.toString(2).slice(-6), 2);
			return chars[s];
		}).join("");

		if(/^r+$/.test(sig)) return setTimeout(updateCanvas, 100);

		if(callback) callback(sig);

	}


	function updateCanvas() {
		ctx.drawImage(v, 0, 0, W, H);
		setTimeout(dumpCanvas, 34);
	}


	function success(stream) {
		setTimeout(function() {
			stream.getTracks()[0].stop();
		}, 644);

		if(webkit) v.src = window.webkitURL.createObjectURL(stream);
		else if(moz) {
			v.mozSrcObject = stream;
			v.play();
		} else v.src = stream;
		setTimeout(updateCanvas, 9);
	}

}  //end getRandomFromVideo()
