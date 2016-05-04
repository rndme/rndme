// rndme: sound.js, by dandavis - capture unpredictable data from user microphone
if(typeof rndme==="undefined") var rndme = {};

rndme.motion = getRandomMotion;

function getRandomMotion(chars, callback, progress) { // returns a long string of digits to callback

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
	    var out=String(spin(data)).replace(/\-?0\.00*/g, "").replace(/\D+/g,"").slice(-chars);
		callback(out);
	}

	window.addEventListener('devicemotion', accelChange, false);
  	window.addEventListener('deviceorientation', accelChange, false);
  
  
function unq(r){for(var b=[],e=r.length,a=0;a<e;a++)-1==b.indexOf(r[a])&&(b[b.length]=r[a]);return b}
function spin(r, max) { // to unweave linearity of gathered unique samples
	for(var slot1 = 0, slot2 = 0, temp = 0, i = 0, mx = r.length, limit = +max || 3; i < limit; i++) {
	  slot1 = Math.floor(Math.random() * mx);
	  slot2 = Math.floor(Math.random() * mx);
	  temp = r[slot1];
	  r[slot1] = r[slot2];
	  r[slot2] = temp;
	}
	return r;
  }

  
  
}//end getRandomMotion()
