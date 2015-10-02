"use strict";

function Sound(soundData, isLoop, onededCallback) {
	var that = (this === window) ? {} : this;

	that.soundData = soundData;
	that.isLoop = isLoop;
	that.onededCallback = onededCallback;

	that.audioCtx = new (window.AudioContext || window.webkitAudioContext)(); 
	that.bufferSrc = null;

	return that;
}

Sound.prototype = {
	constructor: Sound,

	playSound: function(soundOffsetInSecs) {
		this.loadBufferSrc((Date.now() / 1000.0) - soundOffsetInSecs);
		this.bufferSrc.start(0, (soundOffsetInSecs % this.soundData.duration), this.soundData.duration);

		this.setupOnendedEvents();
	},

	loadBufferSrc: function (relativePlayStartTimeInSecs) {
		this.bufferSrc = this.audioCtx.createBufferSource();
		this.bufferSrc.buffer = this.soundData;
		this.bufferSrc.loop = this.isLoop;
		this.bufferSrc.connect(this.audioCtx.destination);
		this.bufferSrc.relativePlayStartTimeInSecs = relativePlayStartTimeInSecs;
		this.bufferSrc.onededCallback = this.onededCallback;
	},

	/** 
	 * Triggered once song is stopped or paused.
	 */
	setupOnendedEvents: function() {
		if (this.bufferSrc != null) {
			this.bufferSrc.onended = function () {
				// bufferSrc will be garbage-collected 
				if ((Date.now() / 1000.0 - this.relativePlayStartTimeInSecs) > this.buffer.duration) {
					// console.log("sound reached the end");
					this.onededCallback();
				} else {
					// console.log("sound has not finished to the end");
				}
			}
		}
	},

	pauseSound: function() {
		if (this.bufferSrc != null) {
			this.bufferSrc.stop();
		}
	},

	stopSound: function() {
		if (this.bufferSrc != null) {
			this.bufferSrc.stop();
		}
	},

	getSoundData: function() {
		return  this.soundData;
	}
}