"use strict";

function Slider (sliderDom, soundDurationInMs, isLoop) {
	var that = (this === window) ? {} : this;

	that.sliderDom = sliderDom;
	that.soundDurationInMs = soundDurationInMs;
	that.isLoop = isLoop;

	that.animationFrameRequestID = null;
	that.sliderOffset = 0;
	
	$(sliderDom).attr('max', soundDurationInMs);

	return that;
}

Slider.prototype = {
	constructor: Slider,

	startSlider: function (sliderOffset) {
		this.sliderOffset = parseInt(sliderOffset);
		(this.sliderDom).val(sliderOffset);
		this.justNow = Date.now();

		this.advanceSlider();
	},

	advanceSlider: function () {
		this.animationFrameRequestID = requestAnimationFrame(this.advanceSlider.bind(this));
		this.now = Date.now();
		this.sliderOffset += (this.now - this.justNow);
		this.justNow = this.now;

		// check if end of range is reached
		if (this.sliderOffset - this.soundDurationInMs > 0) {
			this.sliderOffset = 0;

			if (!this.isLoop) {
				this.stopSlider();
			}
		}

		$(this.sliderDom).val(this.sliderOffset);
	},
	
	pauseSlider: function () {
		cancelAnimationFrame(this.animationFrameRequestID);
		this.animationFrameRequestID = null;
		return this.sliderOffset;
	},

	stopSlider: function() {
		cancelAnimationFrame(this.animationFrameRequestID);
		this.animationFrameRequestID = null;
		this.sliderOffset = 0;
		$(this.sliderDom).val(this.sliderOffset);
	}
}