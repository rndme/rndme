# rndme
unpredictable number generation 

`npm install rndme` - or - `bower install rndme`


## Purpose

> Easily gather numbers or text from sound, movement, video, and more.

Cryptography needs un-predictable keys to ensure security. Recent revelations have cast doubt about `window.crypto`, and everyone knows `Math.random()` is useless. Existing methods of "entropy gathering" like mouse jiggling or typing are akward for users and hampered by mobile devices. With uniform access to a variety of sources, _rndme_ offers you simple and felxible creation of un-predictable and uniformly-distributed data, if you're into that sort of thing.


## Input Sources
### Sound
Uses `getUserMedia()` to capture numbers from a microphone. This is the fastest physical source of numbers at about 120 chars per ms. The raw samples are not only shuffled, they are cropped of the most and least signifigant digits, so there's no telling what was briefly "recorded". Use medium volume music or static for a more even distribution of output.


### Video
Uses `getUserMedia()` to capture numbers from a camera. Thousands of pixels are rolled into each character of output. Move the camera around and have some color contrast in the video for maximum entropy. Video is the 2nd fastest source of numbers after sound at around 3 chars per ms.


### Motion
Motion uses the device Motion API to turn physical movements into numbers. It shuffles the samples and chops off bits to ensure privacy in the face of low-resolution sensors and motionless capture. Best entropy is obtained with lots of movement starting and stopping, like gently shaking while tilting. Motion's performance varies based on how much unique movement is performed from about 0.3 - 3 chars per ms.


### Time
Time uses  a high-resolution clock and a random workload to gather numbers. Since it uses a clock and rolls many workload timings into each output sample, it's rather slow compared to the others at around 0.15 chars per ms. Time has one main advantage: it works on desktop and mobile alike and doesn't need user permissions. It's great for shorter chunks of data like _salts_, _symmetric encryption keys_, and entropy for other number generators.


### Crypto
Crypto uses `crypto.getRandomValues` _and_ a high-resolution clock derivative to gather numbers. This method is sync under-the-hood and is directly callable. OS-provided numbers are muliplied by a number derived from the date and a high-resolution performance timing API, then cropped in the middle to deliver un-compromised randomness. The crypto source's exact performance rate depends on CPU speed and OS-provided entropy, but easily execeds 150 chars per ms.



### Usage
Static methods on the `rndme` variable can be used async with callbacks or promises.
```js
//   source ( format  limit  callback  progess ) -or- .then(callback)
rndme.sound("bytes", 12345, function(s){alert(s)});
rndme.motion("hex", 1024,function(s){alert(s)}, console.info.bind(console));
rndme.time("float", 256,function(s){alert(s)}, console.info.bind(console));
rndme.video("base92", 1024).then(alert).catch(confirm);
alert(rndme.crypto("int", 1024, Boolean)); // the crypto source can be sync with a stub callback
```



## Output Formats

| Format | Seperator | Range | Description |
|----|:----:|:----:|----|
| hex | `""` | `0-F` | hex-encoded byte values  |
| bytes | `","` | `0-255` |  integers that fit into 1 byte  |
| int | `""` | `0-9` | continuous digits  |
| base64 | `""` | `\--z` | URL-safe chars |
| base92 | `""` | `\t-~` | JSON-safe chars  |
| float | `","` | `0-1` |  16 digit floats |
| raw | `","` | `0-1` | same as int, but no _limit_  |






