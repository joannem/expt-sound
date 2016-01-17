/**
 * A mono digital sound which can be played, 
 * paused and stopped.
 *
 * Created by joanne on 15/01/16.
 */

function Sound (audioCtx, soundData, onendedCallbackFunction) {
	"use strict";

	var that = (this === window) ? {} : this;

	//----- variables -----//
	
	var currPcmData = [];	// TODO: consider if want to save old PCM data
	var bufferSrc = null;
	
	var isPlaying = false;
	// TODO: consider if want to add loop
	
	var playedFrom = 0;
	var pausedAt = 0;

	
	//----- private methods -----//
	
	function loadBufferSrc(relativePlayStartTimeInSecs) {
		bufferSrc = audioCtx.createBufferSource();
		bufferSrc.buffer = soundData;
		bufferSrc.connect(audioCtx.destination);
		bufferSrc.relativePlayStartTimeInSecs = relativePlayStartTimeInSecs;
	}

	function setupOnendedEvents() {
		bufferSrc.onended = function () {
			if (reachedEndOfSound(this.relativePlayStartTimeInSecs, this.buffer.duration)) {
				onendedCallbackFunction();
			}
		}
	}

	function reachedEndOfSound(relativePlayStartTimeInSecs, soundDuration) {
		var timeElapsed = performance.now() / 1000.0 - relativePlayStartTimeInSecs;
		return (timeElapsed > soundDuration);
	}

	
	//----- privileged methods -----//
	
	this.play = function(startTimeInSec) {
		loadBufferSrc((performance.now() / 1000.0) - startTimeInSec);
		setupOnendedEvents();

		bufferSrc.start(0, (startTimeInSec % soundData.duration), soundData.duration);
	};

	this.pause = function() {
		bufferSrc.stop();
	};

	this.stopPlaying = function() {
		bufferSrc.stop();
	};

	this.isPlaying = function() {
		return isPlaying;
	};

	this.setIsPlaying = function(setIsPlaying) {
		isPlaying = setIsPlaying;
	};

	this.getSoundData = function() {
		return soundData;
	};


	return that;
}
