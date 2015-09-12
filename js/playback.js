$(document).ready(function() {
	var startTime = 0;
	var soundOffset = 0;

	var soundPlaying = false;
	var bufferSrc = null;

	// play button
	$('.play-pause-btn').click(function() {
		if (!soundPlaying) {
			if (soundData != null) {
				play();

			} else {
				console.log("no sound data found");

			}
		
		} else {
			pause();
			
		}

	});

	function play() {
		loadBufferSrc();
		startTime = audioCtx.currentTime;

		bufferSrc.start(0, soundOffset % soundData.duration, soundData.duration);
		soundPlaying = true;
		$('.play-pause-btn').text('pause'); 

		setupOnendedEvents();
		

	}

	function pause() {
		if(bufferSrc != null) {
			bufferSrc.stop();
			// onended events will be triggered here
			// see setupOnendedEvents() function
		}
	}

	/**
	 * Events to trigger once song ends, activated after a pause
	 * or when sound stopps playing. 
	 * 
	 */
	function setupOnendedEvents() {
		if(bufferSrc != null) {
			bufferSrc.onended = function () {
				// bufferSrc will be garbage-collected 
				resetOffset();
				soundPlaying = false;
				$('.play-pause-btn').text('play');

			}
		}
	}

	function resetOffset() {
		soundOffset += audioCtx.currentTime - startTime;

		if (soundData.duration - soundOffset > 0) {
			console.log ("sound paused");

		} else {
			soundOffset = 0;
			console.log("sound stopped normally");

		}

		console.log ("soundOffset: " + soundOffset);
	}

	function loadBufferSrc() {
		bufferSrc = audioCtx.createBufferSource();
		bufferSrc.buffer = soundData;
		bufferSrc.connect(audioCtx.destination);
	}
});