$(document).ready(function() {
	// for audio play back
	var startTime = 0;	// relative to the point you start playing
	var soundOffset = 0;
	var soundPlaying = false;
	var bufferSrc = null;

	// for slider animations
	var then = 0;
	var scrollValue = 0;	
	var animationFrameRequestID = null;


	// play button
	$('.play-pause-btn').click(function() {
		if (soundData != null) {
			if (!soundPlaying) {
					startTime = audioCtx.currentTime;
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

	// slider
	$(".waveform-slider").on("mousedown", function(){
		if (soundPlaying) {
			pause();
			// soundPlaying = true;
		}
	});

	$(".waveform-slider").on("mouseup", function(){
		soundOffset = this.value / 1000.0;		
		// if (soundPlaying) {
			startTime = audioCtx.currentTime - soundOffset;
			console.log("currentTime: " + audioCtx.currentTime);
			console.log("soundOffset: " + soundOffset);
			console.log("startTime: " + startTime);
			play();
			soundPlaying = true;
			$('.play-pause-btn').text('pause'); 
		// }

	});

	function play() {
		then = audioCtx.currentTime;
		animationFrameRequestID = requestAnimationFrame(advanceSlider);

		loadBufferSrc();	
		bufferSrc.start(0, soundOffset % soundData.duration, soundData.duration);
		setupOnendedEvents();
	}

	function pause() {
		cancelAnimationFrame(animationFrameRequestID);
		animationFrameRequestID = null;
		
		if(bufferSrc != null) {
			soundOffset += audioCtx.currentTime - startTime;
			bufferSrc.stop();
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
				if ((soundOffset - soundData.duration) > 0) {		// TODO: this function screws up as well due to advanceSlider()'s changes'
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
	// TODO: change to take reference from current point in time, not startTime
	function advanceSlider(highResTimestamp) {
		soundOffset = audioCtx.currentTime - startTime;
		animationFrameRequestID = requestAnimationFrame(advanceSlider);
		scrollValue = (soundOffset % soundData.duration) * 1000;
		$('.waveform-slider').val(scrollValue);
		// then = audioCtx.currentTime;
	}
});