$(document).ready(function() {
	// for audio play back
	var startTime = 0;
	var soundOffset = 0;
	var soundPlaying = false;
	var bufferSrc = null;

	// for slider animations
	var scrollValue = 0;	
	var then;
	var animationFrameRequestID = null;


	// play button
	$('.play-pause-btn').click(function() {
		if (soundData != null) {
			if (!soundPlaying) {
					play();
					
					soundPlaying = true;
					$('.play-pause-btn').text('pause'); 

			} else {
				pause();
			}
		} else {
			console.log("no sound data found");
		}
	});

	// stop button
	$('.stop-btn').click(function() {
		stop();
	});

	function play() {
		then = Date.now();
		animationFrameRequestID = requestAnimationFrame(advanceSlider);

		loadBufferSrc();
		startTime = audioCtx.currentTime;
		bufferSrc.start(0, soundOffset % soundData.duration, soundData.duration);
		
		setupOnendedEvents();
	}

	function pause() {
		cancelAnimationFrame(animationFrameRequestID);
		animationFrameRequestID = null;
		
		if(bufferSrc != null) {
			bufferSrc.stop();
			soundOffset += audioCtx.currentTime - startTime;
			// onended events will be triggered here
			// see setupOnendedEvents() function
		}
	}

	function stop() {
		cancelAnimationFrame(animationFrameRequestID);
		animationFrameRequestID = null;
		$('.waveform-slider').val(0);	// reset slider
		
		if(bufferSrc != null) {
			bufferSrc.stop();
			soundOffset = 0;
			scrollValue = 0;
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

			// this function will be triggered after the pause() or stop() function
			bufferSrc.onended = function () {
				// bufferSrc will be garbage-collected 
				if (((audioCtx.currentTime - startTime + soundOffset) - soundData.duration) > 0) {
					stop();
					console.log("sound reached the end");
				} else {
					console.log("sound has not finished to the end");
				}

				soundPlaying = false;
				$('.play-pause-btn').text('play');
			}

		}
	}

	function loadBufferSrc() {
		bufferSrc = audioCtx.createBufferSource();
		bufferSrc.buffer = soundData;
		bufferSrc.connect(audioCtx.destination);
	}

	function advanceSlider(highResTimestamp) {
		animationFrameRequestID = requestAnimationFrame(advanceSlider);
		var now = Date.now();
		var diff = now - then;

		if (diff) {
			scrollValue = (scrollValue + diff) % (soundData.duration * 1000 + 1);
			$('.waveform-slider').val(scrollValue);
			then = now;
		 }
	}
});