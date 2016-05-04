// rndme: sound.js, by dandavis - capture unpredictable data from user microphone
if(typeof rndme==="undefined") var rndme = {};

rndme.sound=sound;

function sound(mode, length, callback, progress) {
	"use strict";

	var n = navigator,
		format = mode,
		limit = length,
		count = 0,		
		ALLS = [],
		isRecording = false;

	var AudioContext = window.AudioContext || window.webkitAudioContext;

	var audioContext = makeRandom.ac || (makeRandom.ac = new AudioContext()),
		audioInput = null,
		inputPoint = null,
		buffers = [],
		TIMER = 0,
		xstream,
		gum = n.getUserMedia

		if(!gum) gum =  (n.mediaDevices && n.mediaDevices.getUserMedia && n.mediaDevices.getUserMedia.bind(n.mediaDevices)) || n.webkitGetUserMedia || n.mozGetUserMedia;

	function makeIt() {

		var resp = gum.call(n, {
			"audio": {
				volume: 0.7,
				channelCount: 1,
				echoCancellation: false,
				"mandatory": {
					"googEchoCancellation": "false",
					"googAutoGainControl": "false",
					"googNoiseSuppression": "false",
					"googHighpassFilter": "false",

				},
				"optional": []
			},
		}, gotStream, function(e) {
			console.error(e);
		})
		  if(resp && resp.then) resp.then(gotStream);

	} //end makeIt()




	function gotStream(stream) {
		xstream = stream;	  
		inputPoint = audioContext.createGain();
		audioInput = audioContext.createMediaStreamSource(stream);
		audioInput.connect(inputPoint);
		gotStream.ip = inputPoint;
		gotStream.ai = audioInput;

		var node = (inputPoint.context.createScriptProcessor || inputPoint.context.createJavaScriptNode).call(inputPoint.context, 4096, 1, 1);
		audioInput.connect(node);
		node.connect(audioInput.context.destination); //this should not be necessary
		node.onaudioprocess = function(e) {
			if(isRecording) buffers.push(e.inputBuffer.getChannelData(0));
		};

		gotStream.node = node;

	  
		var zg = gotStream.zg || (gotStream.zg = audioContext.createGain());
		zg.gain.value = 0.0;
		inputPoint.connect(zg);
		zg.connect(audioContext.destination);
	  
		TIMER = setInterval(function() {
			isRecording = true;
			setTimeout(function() {
			
				getMyBuffers(buffers);
				isRecording = false;
			}, 260);
		}, 1000);
	}





	function getMyBuffers(buffers) {
		var rxd = /\D/g,
			rxd3 = /\d{3}/g, 
			x=[], 
			s="";

		buffers.some(function(r, ind) {

			if(progress) progress({
				value: count,
				max: limit
			});

			if(!r || !r.map) return console.error("getmybuffers passed non buffer", buffers);

			for(var i = 0, mx = r.length; i < mx; i++) {
				var a = r[i],
					u = ("" + a).replace(rxd, "").slice(-11, - 3);
				if(+u) x.push(u);
			}
		  
			s = x.join("");

		  
			switch(format) {

			case 'hex':
				ALLS.push((s.match(rxd3) || []).map(function(a, b, c) {
					a = a % 255;
					count++;
					return("00" + a.toString(16)).slice(-2);
				}).join(""));
				break;

			case 'bytes':
				var tr=(s.match(rxd3) || []), i=0, mx=tr.length, rr=Array(mx);
				for(;i<mx;i++){
					count++;
					rr[i]= ~~ ((tr[i] / 999) * 255);
				}
				ALLS.push(rr+'');				
				break;

			case 'int':
				ALLS.push(s.replace(rxd, "") || "");
				count = ALLS.join("").length;
				break;

			case 'raw':
				count += s.length;
				ALLS.push(s);
				break;

			case 'float':
				ALLS.push((s.match(/\d{16}/g) || []).map(function(a, b, c) {
					count++;
					return +("0." + a);
				}).join(","));
				break;

			case 'base64':
				var chars = "wp7aY_xzcFLfmoyQqu51KWsZEvOb9XJSP3tin06dR-ClUkGeMVIjgr2NDH4hBT8A".repeat(26).split("").sort(munge);

				ALLS.push((s.match(rxd3) || []).map(function(a, b, c) {
					count++;
					return chars[+a];
				}).join(""));
				break;


			case 'base92':
			default:
				
				var chars="0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ!#$%&()*+,-./:;<=> ?@[]^_{|}~`\t".split("").sort(munge);
				
				var tr=(s.match(/\d{2}/g) || []), i=0, mx=tr.length, rr=Array(mx);
				for(;i<mx;i++){
					count++;
					rr[i]= chars[+tr[i]] || "";
				}
				ALLS.push(rr.join(""));				
				break;
				
				
			}


		  
			if(count > limit) {
				if(format === "raw" && buffers[ind + 1]) return false;
				if(format === "raw") limit = 9e9;
				clearInterval(TIMER);
				setTimeout(function() {
					xstream.getTracks()[0].stop();
				}, 50);
			  
			  
				buffers.length = 0;
				isRecording = false;
				if(progress)progress({
					value: 0,
					max: 0
				});

				gotStream.ai.disconnect();
				gotStream.ip.disconnect();
				callback(ALLS.join("").slice(0, limit));
			  ALLS.length = 0;
			  
				return true;
			}


		}); //end some();

	}


  
	function munge(a, b, c) { //not essential, but can help distro in low-entropy situations:
		return Math.random() > .5 ? 1 : -1;
	}
  
	makeIt();
  
  
} //end sound();
  
