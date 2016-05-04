// rndme: time.js, by dandavis - capture unpredictable data from user device performance
if(typeof rndme==="undefined") var rndme = {};

rndme.time = get64FromTime();

function get64FromTime() { // returns a 64 char base64url string for seeding, salt, entropy, etc

	var ua = new Uint32Array(1),
		out = random(68),
		rxd = /[523403467]/,
		limit = 0,
		round = 0,
		roundLimit = 128,
		seeds = random(roundLimit + 3),
		loads = random(roundLimit + 3),
		r = [],
		times = [],
		t = (Date.now().toString().slice(-3).slice(1)*1),
		st = performance.now(),
		chars = "wp7aY_xzcFLfmoyQqu51KWsZEvOb9XJSP3tin06dR-ClUkGeMVIjgr2NDH4hBT8A".split("").sort(munge).join("").repeat(16).split(""),
		mx3 = chars.length;

	function munge(a, b) {return Math.random() > .5 ? 1 : -1;}
	function random(n) {return [].slice.call(crypto.getRandomValues(new Uint32Array(n)));}
	function work() {return Math.random().toString(16).split("").filter(rxd.test, rxd).length;}
	function snap() {return String(("" + performance.now()).match(/\.\d\d/) || "0").replace(/\D/g, "").slice(-2) || 0;}


	while(performance.now() < st + 1) t += work(limit++) ;
	limit = Math.max(limit, 2);
	while(true) {
		round++;
		for(var i = ((loads[round] / 4294967296) * (limit / 9)) + 1; i > 0; i--) t += work();
		var slot = Math.floor((seeds[round] / 4294967296) * 64);
		out[slot] = out[slot] + t + (times[times.length] = +snap());
		if(round > roundLimit) break;
	}

	return out.map(function(a, b, c) {
		var l2 = ("" + a).slice(-3);
		return chars[(l2[2] + l2[1] + l2[0]) - 16] || ""; // toss ~16/1000 chars
	}).filter(String).join("").concat(chars.join("")).slice(0,64);

} //~30ms runtime


