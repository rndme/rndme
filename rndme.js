// rndme.js - unpredictable number generation from sound, sight, movement, and time
(function(a,b){"function"==typeof define&&define.amd?define([],a):"object"==typeof exports?module.exports=a():b.rndme=a()}(function(){

/* example uses:
//  source (  format  size  callback  progess )
rndme.sound("bytes", 12345, function(s){alert(s)});
rndme.motion("hex", 1024,function(s){alert(s)}, console.info.bind(console));
rndme.time("float", 256,function(s){alert(s)}, console.info.bind(console));
rndme.video("base92", 1024).then(alert).catch(confirm);
*/


 var rndme=Object.create(null);


// video - capture unpredictable data from user camera
rndme.video=getRandomFromVideo;
  
function getRandomFromVideo(format, chars, callback, progress, err) { // returns a 64 char base64url string
	"use strict";
	var canvas = document.createElement("canvas"),
		ctx = canvas.getContext("2d"),
		webkit = false,
		moz = false,
		v = null,
		W = 320,
		H = 240,
		n = navigator,
		dataBuffer=[],
		v = document.createElement("video");

	if(n.getUserMedia) {
		n.getUserMedia({
			video: {
				width: W,
				height: H,
				framerate: 30, 
				facingMode: "environment",
			}
		}, success, err);
	} else if(n.webkitGetUserMedia) {
		webkit = true;
		n.webkitGetUserMedia({
			video: {
				facingMode: "environment",
				width: W,
				height: H,
				optional: []
			}
		}, success, err);
	} else if(n.mozGetUserMedia) {
		moz = true;
		n.mozGetUserMedia({
			video: {
				facingMode: "environment",
				width: W,
				height: H,
			},
			audio: false
		}, success, err);
	}


	function dumpCanvas() {
			var sig = crypto.getRandomValues(new Uint32Array(128)),
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
			return parseInt("0" + a.toString(2).slice(-6), 2);
		}).join("");

	  	if(/^r+$/.test(sig)) return setTimeout(updateCanvas, 100);
	  	dataBuffer.push(sig);	  
	  	if(dataBuffer.length * 128 > chars){
		 	var collect=[]; 
		  	formatData(dataBuffer.join(""), format, collect);
			updateCanvas.stop();	
		  	if(callback) callback(collect.join("")); 
		}else{
		  setTimeout(updateCanvas, 40);		  
		}
	  
		

	}


	function updateCanvas() {
		ctx.drawImage(v, 0, 0, W, H);
		setTimeout(dumpCanvas, 34);
	}


	function success(stream) {
		updateCanvas.stop = function() {
			stream.getTracks()[0].stop();
		};

		if(webkit) v.src = window.webkitURL.createObjectURL(stream);
		else if(moz) {
			v.mozSrcObject = stream;
			v.play();
		} else v.src = stream;
		setTimeout(updateCanvas, 9);
	}

}  //end getRandomFromVideo()





// time - capture unpredictable data from user device performance


rndme.time = getRandomFromTime;


function getRandomFromTime(format, chars, callback, progress) { 

	var ua = new Uint32Array(1),
		counts=Math.ceil(chars/2.72),
		out = random(counts),
		rxd = /[523403467]/,
		limit = 0,
		round = 0,
		roundLimit = chars * 1.5,
		seeds = random(roundLimit + 3),
		loads = random(roundLimit + 3),
		r = [],
		times = [],
		t = (Date.now().toString().slice(-3).slice(1)*1),
		st = performance.now();
		

	function random(n) {return [].slice.call(crypto.getRandomValues(new Uint32Array(n)));}
	function work() {return Math.random().toString(16).split("").filter(rxd.test, rxd).length;}
	function snap() {return String(("" + performance.now()).match(/\.\d\d/) || "0").replace(/\D/g, "").slice(-2) || 0;}


	while(performance.now() < st + 1) t += work(limit++) ;
	limit = Math.max(limit, 2);

	function next(){
	
		round++;
		for(var i = ((loads[round] / 4294967296) * (limit / 9)) + 1; i > 0; i--) t += work();
		var slot = Math.floor((seeds[round] / 4294967296) * 64);
		out[slot] = out[slot] + t + (times[times.length] = +snap());
		if(round < roundLimit) return setTimeout(next,0);
	

	  	var collect=[];
		formatData(out.map(function(a, b, c) {
			var l2 = ("" + a).slice(-3);
			return (+(l2[2] + l2[1] + l2[0]) - 16 )|| ""; // toss ~16/1000 chars
		}).filter(String).join("").replace(/\D+/g,""), format, collect);
	  
		callback(collect.slice(-chars).join(""));

	}//end next()

	next();

} //end time()







// sound - capture unpredictable data from user microphone


rndme.sound=sound;

function sound(mode, length, callback, progress, err) {
	"use strict";

	var n = navigator,
		format = mode,
		limit = length,
		count = 0,		
		ALLS = [],
		makeRandom = sound,
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
		if(!gum) return err("sound source needs getUserMedia()");
  
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
		}, gotStream, err)
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

			if(!r || !r.map) return err("getMyBuffers passed non buffer");

			for(var i = 0, mx = r.length; i < mx; i++) {
				var a = r[i],
					u = ("" + a).replace(rxd, "").slice(-11, - 3);
				if(+u) x.push(u);
			}
		  
			s = x.join("");

			count+=formatData(s, format, ALLS);

		
		  
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


	makeIt();
  
  
} //end sound();
  

  
  
  
  
  
  
  
  
  
  
// sound - capture unpredictable data from user microphone


rndme.motion = getRandomMotion;

function getRandomMotion(format, chars, callback, progress, err) { // returns a long string of digits to callback

  	if(!window.ondevicemotion && !window.ondeviceorientation) err("motion source needs device motion API");
  
	chars = +chars || 1024;
  	
	var samples = {},
		rounds=0,
	 lastPos = [0,0,0];
  
  
	function accelChange(e) {
		var acc = e.accelerationIncludingGravity || "";
			var pos = [acc.x || e.alpha||0, acc.y||e.beta||0, acc.z||e.gamma||0];
			var dif = [pos[0] - lastPos[0], pos[1] - lastPos[1], pos[2] - lastPos[2]];
	  		if(!pos[0]||!pos[1]) return;
			samples[dif[0]]=1;
	  		samples[dif[1]]=1;
	  		samples[dif[2]]=1;
	  	  	samples[pos[0].toString().slice(-8,-2)]=1;
	  	  	samples[pos[1].toString().slice(-8,-2)]=1;
	  	  	samples[pos[2].toString().slice(-8,-2)]=1;
	  		rounds++;
			lastPos = pos;
			var buff=Object.keys(samples);
	  		if ( (buff.length*11) > chars) done( buff );
	  		if(progress) progress({value:buff.length, max: buff.length*18})
	}

 
	function done(data) {
	  	samples=null;
		window.removeEventListener('devicemotion', accelChange, false);
	    window.removeEventListener('deviceorientation', accelChange, false);
	    var out=String(spin(data)).replace(/\-?0\.00*/g, "").replace(/\D+/g,"")//;
		//callback(out);
	  	var collect=[];
	  	formatData(out, format, collect);
	  	callback(collect.slice(-chars).join());
	}

	window.addEventListener('devicemotion', accelChange, false);
  	window.addEventListener('deviceorientation', accelChange, false);
  
  
}//end getRandomMotion()




  function formatData(strData, format, dest){
	dest=dest || [];
	var rxd = /\D/g,
		rxd3 = /\d{3}/g,
		count= 0,
		s=strData;


	switch(format) {

	  case 'hex':
		dest.push((s.match(rxd3) || []).map(function(a, b, c) {
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
		dest.push(rr+'');				
		break;

	  case 'int':
		dest.push(s.replace(rxd, "") || "");
		count = dest.join("").length;
		break;

	  case 'raw':
		count += s.length;
		dest.push(s);
		break;

	  case 'float':
		dest.push((s.match(/\d{16}/g) || []).map(function(a, b, c) {
		  count++;
		  return +("0." + a);
		}).join(","));
		break;

	  case 'base64':
		var chars = "wp7aY_xzcFLfmoyQqu51KWsZEvOb9XJSP3tin06dR-ClUkGeMVIjgr2NDH4hBT8A".repeat(26).split("").sort(munge);

		dest.push((s.match(rxd3) || []).map(function(a, b, c) {
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
		dest.push(rr.join(""));				
		break;


	}
	return count;

  }//end formatData()

  
  
  
  
//utils
function spin(r, max) { // to unweave linearity of gathered unique samples
	for(var slot1 = 0, slot2 = 0, temp = 0, i = 0, mx = r.length, limit = +max || mx; i < limit; i++) {
	  slot1 = Math.floor(Math.random() * mx);
	  slot2 = Math.floor(Math.random() * mx);
	  temp = r[slot1];
	  r[slot1] = r[slot2];
	  r[slot2] = temp;
	}
	return r;
}
  
function munge(a, b) {
	return Math.random() > .5 ? 1 : -1;
}

  
  function make(method){
  
	var func=rndme[method];
  
	
	rndme[method]=function _rnd(format, size, callback, progress, err) {
	  if(callback) return func(format, size, callback, progress, err||console.error.bind(console));
	  return new Promise(function(resolve, reject) {
		func(format, size, resolve, null, reject);
	  });//end promise
	  
	
  	}//end _rnd()

  }//end make
  
 ["sound","motion","time","video"].forEach(make);
  
  
// a sync timestamp method, returns a new 10-digit string each time
rndme.stamp= function stamp() {
	return(Date.now() / (performance.now() * 100)).toString().split("").filter(/./.test, /\d/).slice(-10).join("");
};
  
  
  
  
// return static class:
 return rndme;

}, this));  
