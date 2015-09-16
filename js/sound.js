"use strict";

function Sound (soundData, isLoop) {
	var that = (this === window) ? {} : this;

	that.soundData = soundData;
	that.isLoop = isLoop;

	that.audioCtx = new (window.AudioContext || window.webkitAudioContext)(); 
	that.bufferSrc = null;

	that.soundOffsetInSecs = 0;
	that.relativePlayStartTimeInSecs = 0.0

	return that;
}

Sound.prototype = {
	constructor: Sound,

	playSound: function (soundOffsetInSecs) {
		this.soundOffsetInSecs = parseFloat(soundOffsetInSecs);
		this.relativePlayStartTimeInSecs = (Date.now() / 1000.0) - soundOffsetInSecs;
		loadBufferSrc();
		bufferSrc.start(0, (this.soundOffsetInSecs % soundData.duration), soundData.duration);

		setupOnendedEvents();
	},

	loadBufferSrc: function () {
		this.bufferSrc = audioCtx.createBufferSource();
		this.bufferSrc.buffer = this.soundData;
		this.bufferSrc.loop = this.isLoop;
		this.bufferSrc.connect(this.audioCtx.destination);
	},

	/** 
	 * Triggered once song is stopped or paused.
	 */
	setupOnendedEvents: function() {
		if (bufferSrc != null) {
			bufferSrc.onended = function () {
				// bufferSrc will be garbage-collected 
				if ((this.relativePlayStartTimeInSecs - soundData.duration) > 0) {
					this.soundOffsetInSecs = 0.0;
					console.log("sound reached the end");
					// TODO: call back to change play-pause-btn to read "play"
				} else {
					console.log("sound has not finished to the end");
				}
			}
		}
	}

	pauseSound: function () {
		this.bufferSrc.stop();
		this.soundOffsetInSecs = (Date.now() / 1000.0) - this.relativePlayStartTimeInSecs;
		return this.soundOffsetInSecs;
	},

	stopSound: function() {
		this.bufferSrc.stop();
		this.soundOffsetInSecs = 0.0;
	}
}