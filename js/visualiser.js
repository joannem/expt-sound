"use strict";

// TODO: pass canvas object into constructor?
function Visualiser() {
	var that = (this === window) ? {} : this;

	// canvas dimensions
	that.windowWidth = $(window).width();
	that.canvasWaveformHeight = 150;
	that.canvasSpecHeight = 513;

	//-- setup blank waveform canvases
	that.canvasLeftCtx = $("#waveform-canvas-left").get()[0].getContext("2d");
	that.canvasRightCtx = $("#waveform-canvas-right").get()[0].getContext("2d");
	that.canvasLeft = document.getElementById('waveform-canvas-left');
	that.canvasRight = document.getElementById('waveform-canvas-right');

	that.canvasLeft.setAttribute('width', that.windowWidth);
	that.canvasRight.setAttribute('width', that.windowWidth);
	that.canvasLeft.setAttribute('height', that.canvasWaveformHeight);
	that.canvasRight.setAttribute('height', that.canvasWaveformHeight);
	
	that.canvasLeftCtx.fillRect(0, 0, that.windowWidth, that.canvasWaveformHeight);
	that.canvasRightCtx.fillRect(0, 0, that.windowWidth, that.canvasWaveformHeight);

	//-- setup blank spectrogram canvas
	that.canvasSpecCtx = $("#spectrogram-canvas").get()[0].getContext("2d");
	that.canvasVisualCtx = $("#visualSpect-canvas").get()[0].getContext("2d");
	that.canvasSpec = document.getElementById('spectrogram-canvas');
	that.canvasVisual = document.getElementById('visualSpect-canvas');

	that.canvasSpec.setAttribute('width', that.windowWidth);
	that.canvasSpec.setAttribute('height', that.canvasSpecHeight);

	that.canvasSpecCtx.fillRect(0, 0, that.windowWidth, that.canvasSpecHeight);
	that.canvasSpecCtx.translate(0, -1);	// leave a 1 px gap below

	//-- setup blank spectrogram visualiser canvas
	that.canvasVisual.setAttribute('width', that.windowWidth);
	that.canvasVisual.setAttribute('height', that.canvasSpecHeight);

	that.canvasVisualCtx.translate(0, -1);	// leave a 1 px gap below

	return that;
}

Visualiser.prototype = {
	constructor: Visualiser,

	/**
	 * Draws the waveform of the sound into the canvases representing the
	 * left and right channels.
	 * 
	 * @param  {AudioBuffer} buffer AudioBuffer containing sound data
	 */
	drawWaveform: function(buffer) {
		if (buffer != null) {
			if (this.canvasLeftCtx != null && this.canvasRightCtx != null) {

				// TODO: next time just do canvas.150clear()
				// clean canvases
				this.canvasLeftCtx.fillStyle = '#000000';
				this.canvasRightCtx.fillStyle = '#000000';
				this.canvasLeftCtx.fillRect(0, 0, this.windowWidth, this.canvasWaveformHeight);
				this.canvasRightCtx.fillRect(0, 0, this.windowWidth, this.canvasWaveformHeight);

				var pcmL = buffer.getChannelData(0);
				var pcmR = buffer.getChannelData(1);

				var maxL = 0;
				var maxR = 0;

				var bufferLen = buffer.length;
				console.log("buffer length: " + bufferLen);
				console.log(this.windowWidth);
				var jump = Math.floor(bufferLen / this.windowWidth) > 1 ? Math.floor(bufferLen / this.windowWidth) : 1;

				// note: nominal range of PCM data is [-1.0, 1.0]
				// TODO: decide on whether to fix maxL and maxR to 1.0
				for (var i = 0; i < bufferLen; i += jump) {
					maxL = Math.abs(pcmL[i]) > maxL ? Math.abs(pcmL[i]) : maxL;
					maxR = Math.abs(pcmR[i]) > maxR ? Math.abs(pcmR[i]) : maxR;

				}

				var x = 0;
				var heightL = 0;
				var heightR = 0;

				this.canvasLeftCtx.fillStyle = '#0FF000';
				this.canvasRightCtx.fillStyle = '#0FF000';

				for(var i = 0; i < bufferLen; i += jump) {
					// -5 translation to leave a 2.5px gap between waveform and border of canvas
					heightL = Math.abs(pcmL[i] / maxL * ((this.canvasWaveformHeight / 2) - 5));
					heightR = Math.abs(pcmR[i] / maxR * ((this.canvasWaveformHeight / 2) - 5));

					this.canvasLeftCtx.fillRect(x, (this.canvasWaveformHeight / 2) - heightL, 1, (heightL * 2));
					this.canvasRightCtx.fillRect(x, (this.canvasWaveformHeight / 2) - heightR, 1, (heightR * 2));
					
					x++;
				}

			} else {
				console.log("Error: canvasRightCtx and canvasLeftCtx not defined.");
			}

		} else {
			console.log("Error: No sound data loaded.");
		}
	}, 
	
	/**
	 * Cuts up the audio into frames according to windowSize, then performs a
	 * hanning window followed by an FFT on each frame. The absolutes of the FFT
	 * are then stored into the global variable soundFFT, and the maximum
	 * magnitude is returned.
	 * 
	 * @param  {AudioBuffer} buffer 	AudioBuffer to be analysed.
	 * @param  {int} windowSize 		Size of each frame.
	 * @param  {int} noOfFrames 		Number of frames.
	 * 
	 * @return {int} maxMagnitude		Maximum magnitude obtained from FFT.
	 */
	calculateFft: function(buffer, windowSize, noOfFrames) {
		if (buffer != null) {
			// reset ...
			soundFFT = [];

			// set-up temp holder of each frame's values 
			var windowedFrame = [];
			var specRe = [];
			var specIm = [];
			var magnitude = [];

			var maxMagnitude = 0; 	// for scaling later

			var pos = 0;
			// console.log(buffer.getChannelData(0));
			for (var i = 0; i < noOfFrames; i++) {
				// reset all arrays
				specRe = [];
				specIm = [];
				magnitude = [];

				// slice the next frame apply hanning window to the frame
				windowedFrame = this.hanningWindow(buffer.getChannelData(0).slice(pos, pos + windowSize), windowSize);

				// fft values of the frame
				fft.forwardReal(windowedFrame, specRe, specIm);
				
				// calculate the magnitude from real and imaginary parts
				for (var j = 0; j < (windowSize/2 + 1); j++) {
					magnitude[j] = Math.sqrt((specRe[j] * specRe[j]) + (specIm[j] * specIm[j]));
					maxMagnitude = maxMagnitude > magnitude[j] ? maxMagnitude : magnitude[j];

				}

				soundFFT.push(magnitude);

				pos += (windowSize / 2);
			}

			return maxMagnitude;

		} else {
			console.log ("Error: No sound data loaded.");
			return 0;
		}
	},

	/**
	 * Does a Hanning window on a given frame.
	 * Code adapted from: http://stackoverflow.com/questions/
	 * 11600515/hanning-von-hann-window
	 * @param  {Array} 	frame  Values from a frame of from a signal
	 * @param  {int} 	size   Size of frame
	 * @return {Array}	       Windowed frame
	 */
	hanningWindow: function(frame, size) {
		var windowedFrame = [];

		for (var i = 0; i < size; i++) {
			windowedFrame.push(frame[i] * 0.5 * (1.0 - Math.cos(2.0 * Math.PI * i / size)));
		}

		return windowedFrame;
	},

	/**
	 * Draws the spectrogram for the sound onto a pre-defined canvas. 
	 * 
	 * @param  {int} noOfFrames   	Number of frames the audio is cut into.
	 * @param  {int} maxFreq		Maximum frequency calculated by the FFT.
	 * @param  {float} maxMagnitude	Maximum magnitude recorded from the FFT. Used for
	 *                              scaling the colours of the spectrogram.
	 */
	drawSpectrogram: function(bufferLen, windowSize, overlap, noOfFrames, maxFreq, maxMagnitude) {
		if (this.canvasSpecCtx != null) {
			//-- reset canvas
			this.canvasSpecCtx.fillStyle = '#000000';
			this.canvasSpecCtx.fillRect(0, 1, this.windowWidth, this.canvasSpecHeight);
			this.canvasVisual.setAttribute('width', noOfFrames);
			this.canvasVisual.setAttribute('height', windowSize/2 + 1);

			//-- determine spectrogram colours
			var hot = new chroma.ColorScale({
				colors:['#000000', '#FF0000', '#FFFF00', '#FFFFFF'],
				positions:[0, .25, .75, 1],
				mode:'rgb',
				limits:[0, maxMagnitude]
			});

			var jump = Math.floor(noOfFrames / this.windowWidth) > 1 ? Math.floor(noOfFrames / this.windowWidth) : 1;

			var x = 0;
			for(var i = 0; i < noOfFrames; i += jump) {
				x = Math.round((windowSize * overlap) * i * (this.windowWidth/bufferLen));

				for (var freq = 0; freq < maxFreq; ++freq) {
					this.canvasSpecCtx.fillStyle = hot.getColor(soundFFT[i][freq]).hex();
					this.canvasSpecCtx.fillRect(x, (maxFreq - freq), 1, 1);

				}

			}
			console.log('spectrogram: done');

		} else {
			console.log ("Error: canvasSpecCtx not defined.");

		}
	},

	// TODO: create own image processing scripts

	// TODO: expose parameters
	drawEdges: function() {
		// code adapted from: https://github.com/inspirit/jsfeat/blob/gh-pages/sample_canny_edge.html
		
		var spect_data = this.canvasSpecCtx.getImageData(0, 0, this.windowWidth, this.canvasSpecHeight);
		var edged_img = new jsfeat.matrix_t(this.windowWidth, this.canvasSpecHeight, jsfeat.F32_t | jsfeat.C1_t);

		jsfeat.imgproc.grayscale(spect_data.data, this.windowWidth, this.canvasSpecHeight, edged_img);
		jsfeat.imgproc.gaussian_blur(edged_img, edged_img, 1, 0);
		jsfeat.imgproc.canny(edged_img, edged_img, 1, 90);

		var data_u32 = new Uint32Array(spect_data.data.buffer);
		var alpha = (0xff << 24);
		var i = edged_img.cols*edged_img.rows, pix = 0;
		
		while(--i >= 0) {
			pix = edged_img.data[i];
			data_u32[i] = alpha | (pix << 16) | (pix << 8) | pix;
		}
		
		this.canvasVisualCtx.putImageData(spect_data, 0, 0);

		console.log("edges: done");
	},

	// TODO: expose parameters
	blurImage: function() {
		// code adapted from: https://github.com/inspirit/jsfeat/blob/gh-pages/sample_canny_edge.html
		
		var spect_data = this.canvasSpecCtx.getImageData(0, 0, this.windowWidth, this.canvasSpecHeight);
		var edged_img = new jsfeat.matrix_t(this.windowWidth, this.canvasSpecHeight, jsfeat.F32_t | jsfeat.C1_t);

		jsfeat.imgproc.grayscale(spect_data.data, this.windowWidth, this.canvasSpecHeight, edged_img);
		jsfeat.imgproc.gaussian_blur(edged_img, edged_img, 4, 0);

		var data_u32 = new Uint32Array(spect_data.data.buffer);
		var alpha = (0xff << 24);
		var i = edged_img.cols*edged_img.rows, pix = 0;
		
		while(--i >= 0) {
			pix = edged_img.data[i];
			data_u32[i] = alpha | (pix << 16) | (pix << 8) | pix;
		}
		
		this.canvasVisualCtx.putImageData(spect_data, 0, 0);

		console.log("blur: done");
	}
}