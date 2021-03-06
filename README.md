# rndme
unpredictable number generation 

`npm install rndme` - or - `bower install rndme`

Check out [a live demo](https://pagedemos.com/rndmelibdemo/) to see what the fuss is about.

Also drives my [bulk-random file generator](http://pagedemos.com/random_files/output/)

## Purpose

> Easily gather numbers or text from sound, movement, video, and more.

Cryptography needs un-predictable keys to ensure security. Recent revelations have cast doubt about `window.crypto`, and everyone knows `Math.random()` is useless. Existing methods of "entropy gathering" like mouse jiggling or typing are akward for users and hampered by mobile devices. With uniform access to a variety of sources, _rndme_ offers you simple and felxible creation of un-predictable and uniformly-distributed data, if you're into that sort of thing.


## Input Sources
### Sound
Uses `getUserMedia()` to capture numbers from a microphone. This is the fastest physical source of numbers at over 900 chars per ms sustained. The raw samples are not only shuffled, they are cropped of the most and least signifigant digits, so there's no telling what was briefly "recorded". Use medium volume music or static for a more even distribution of output.


### Video
Uses `getUserMedia()` to capture numbers from a camera. Thousands of pixels are rolled into each character of output. Move the camera around and have some color contrast in the video for maximum entropy. Video is the 2nd fastest source of numbers after sound at around 3 - 80 chars per ms, depending on brightness and movement. Even a dark camera will work, but one shooting the floor or horizon will produce data much faster.


### Motion
Motion uses the device Motion API to turn physical movements into numbers. It shuffles the samples and chops off bits to ensure privacy in the face of low-resolution sensors and motionless capture. Best entropy is obtained with lots of movement starting and stopping, like gently shaking while tilting. Motion's performance varies per device but ranges from about 2.5 - 5 chars per ms.


### Time
Time uses  a high-resolution clock and a random workload to gather numbers. Since it uses a clock and rolls many workload timings into each output sample, it's rather slow compared to the others at around 0.60 chars per ms. Time has one main advantage: it works on desktop and mobile alike and doesn't need user permissions. It's great for shorter chunks of data like _salts_, _symmetric encryption keys_, and entropy for other number generators.


### Crypto
Crypto uses `crypto.getRandomValues` _and_ a high-resolution clock derivative to gather numbers. This method is sync under-the-hood and is directly callable. OS-provided numbers are muliplied by a number derived from the date and a high-resolution performance timing API, then cropped in the middle to deliver un-compromised randomness. The crypto source's exact performance rate depends on CPU speed and OS-provided entropy, but expect 100 - 500 chars per ms.



### Combo
Combo mixes output from one or more sources, like sound and motion, to ensure randomness in the face of broken sensors, or just for plain good measure. It's an easy way to address concerns about one source or the other: use both! All data is gathered at the same time, so you only have to wait the time of the slowest source used. `rndme.combo` takes a special first argument, a list of source names, but the other parameters are the same except `progress`, which is not available on combo.



## Output Formats

| Format | Seperator | Range | Description |
|----|:----:|:----:|----|
| hex | `""` | `0-F` | hex-encoded byte values  |
| bytes | `","` | `0-255` |  integers that fit into 1 byte  |
| bin | `""` | `\u0-\u255` |  binary string of bytes |
| int | `""` | `0-9` | continuous digits  |
| base64 | `""` | `\--z` | URL-safe chars |
| base92 | `""` | `\t-~` | JSON-safe chars  |
| float | `","` | `0-1` |  16 digit floats |
| raw | `","` | `0-1` | same as int, but no _limit_  |




## Usage
Static methods on the `rndme` variable can be used async with callbacks or promises.
```js
//   source ( format  limit  callback  progess ) -or- .then(callback)
rndme.sound("bytes", 12345, function(s){alert(s)});
rndme.motion("hex", 1024,function(s){alert(s)}, console.info.bind(console));
rndme.time("float", 256,function(s){alert(s)}, console.info.bind(console));
rndme.video("base92", 1024).then(alert).catch(confirm);
rndme.combo(["sound", "video", "motion"], "hex", 2000).then(alert); // combine 3 sources
rndme.combo("video", "hex", 2000, alert); // combine one source (alt syntax + cb)

```




## Static Utilities


### stamp
`._stamp()` - returns 10 random digits, sync, based on the current time. Using Date()s and high-resolution timingings with a chunk of slower code internally, this method should produce different output each time it's called:
```js
[1,2,3,4,5].map(rndme._stamp);
// == ["1621049878", "7138172444", "5275617627", "1540339147", "2792212006"]
```

### spin
`._spin(arrToShuffle, optNumSwaps)` - re-arranges the elements in an array into an unpredictable order bu swapping values. The default is as many swaps as elements, but a 2nd argument can specify a custom number of swaps if desired. Uses `Math.random()`, so it should not be a primary source of sectrets, but it can help re-arrange secrets to provide a better distribution.
```js
rndme._spin([1,2,3,4,5,6,7,8,9]);
// ~==[5, 2, 8, 9, 6, 3, 1, 7, 4] // note complete re-distribution of element order
```

### munge
`._munge` - An `[].sort()` callback that contrary to popular belief, does NOT randomize an array. It does slightly re-arrange the elements, and it does so quickly. It's used by _rndme_ to prevent repeated output in very low-entroy situations like a user having a broken camera and using the video input by altering the look up table of some output builders prior to each execution.
```js
[1,2,3,4,5,6,7,8,9].sort(rndme._munge);
// ~== [2, 1, 8, 3, 7, 4, 5, 6, 9]; // note different order, but not complete re-distribution
```

### combine
`._combine(inp1, inp2)` - Given two strings or arrays of digits, add them together as numbers and keep the least significant digits. This is used internaly by the combo source, but is exposed for mixing other data/entropy as needed.
```js
rndme._combine("123","789");
// == "802"  (1+7=8, 2+8=0, 3+9=2)
```


### test results on 50,000 bin samples

tested using http://fourmilab.ch/random/ 's `ent.exe` program on windows

#### audio
```
Entropy = 7.986279 bits per byte.
Optimum compression would reduce the size of this 50000 byte file by 0 percent.

Chi square distribution for 50000 samples is 903.65, and randomly would exceed this value less than 0.01 percent of the times.

Arithmetic mean value of data bytes is 127.3347 (127.5 = random).
Monte Carlo value for Pi is 3.139325573 (error 0.07 percent).
Serial correlation coefficient is -0.004064 (totally uncorrelated = 0.0).
```

#### video (w/camera obscured, no motion)

```
Entropy = 7.990584 bits per byte.
Optimum compression would reduce the size of this 50000 byte file by 0 percent.

Chi square distribution for 50000 samples is 589.68, and randomly would exceed this value less than 0.01 percent of the times.

Arithmetic mean value of data bytes is 127.6303 (127.5 = random).
Monte Carlo value for Pi is 3.142205688 (error 0.02 percent).
Serial correlation coefficient is -0.000538 (totally uncorrelated = 0.0).
```


#### crypto

```
Entropy = 7.980536 bits per byte.
Optimum compression would reduce the size of this 49895 byte file by 0 percent.

Chi square distribution for 49895 samples is 1118.04, and randomly would exceed this value less than 0.01 percent of the times.

Arithmetic mean value of data bytes is 127.7410 (127.5 = random).
Monte Carlo value for Pi is 3.151413109 (error 0.31 percent).
Serial correlation coefficient is -0.012716 (totally uncorrelated = 0.0).
```

















