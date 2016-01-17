/**
 * A visualiser to draw the spectrogram and waveform of a sound, 
 * onto a specified canvas.
 * Note: only supports mono :/
 *
 * Requires: jQuery, chroma.js, fft.js
 *
 * Created by joanne on 15/1/16.
 */

/**
 * Constructor.
 * 
 * @param {jQuery} waveformCanvasObj    Canvas object to draw waveform in.
 * @param {jQuery} spectrogramCanvasObj Canvas object to draw spectrogram in.
 * @param {int} spectHeight 			Maximum frequency resolution in pixels.
 * @param {int} width 					Maximum time resolution in pixels.
 */
function SoundVisualiser(waveformCanvasObj, spectrogramCanvasObj, spectHeight, waveformHeight, width) {
	"use strict";
	var that = (this === window) ? {} : this;

	//----- variables -----//
	
	var spectrogramCanvasCtx = spectrogramCanvasObj[0].getContext("2d");
	var waveformCanvasCtx = waveformCanvasObj[0].getContext("2d");
	var fft = new FFT();

	setupBlankSpectrogramCanvas();
	setupBlankWaveformCanvas();

	
	//----- private methods -----//

	function setupBlankSpectrogramCanvas() {
		spectrogramCanvasObj.attr('width', width);
		spectrogramCanvasObj.attr('height', spectHeight);
	
		spectrogramCanvasCtx.fillRect(0, 0, width, spectHeight);
	}

	function setupBlankWaveformCanvas() {
		waveformCanvasObj.attr('width', width);
		waveformCanvasObj.attr('height', waveformHeight);	
		// TODO: check if these were set correctly

		waveformCanvasCtx.fillRect(0, 0, width, waveformHeight);
	}

	/**
	 * Does a Hanning window on a given frame.
	 * Code adapted from: http://stackoverflow.com/questions/
	 * 11600515/hanning-von-hann-window
	 * @param  {Array} 	frame  Values from a frame of from a signal
	 * @param  {int} 	size   Size of frame
	 * @return {Array}	       Windowed frame
	 */
	function hanningWindow(frame, size) {
		var windowedFrame = [];

		for (var i = 0; i < size; i++) {
			windowedFrame.push(frame[i] * 0.5 * (1.0 - Math.cos(2.0 * Math.PI * i / size)));
		}

		return windowedFrame;
	}


	//----- privileged methods -----//
	
	/**
	 * (Re)draws the waveform of the sound onto the waveform canvas.
	 * 
	 * @param  {AudioBuffer} audioBuffer AudioBuffer containing sound data
	 */
	this.drawWaveform = function(audioBuffer) {
		waveformCanvasCtx.clearRect(0, 0, waveformCanvasCtx.width, waveformCanvasCtx.height);
		waveformCanvasCtx.fillStyle = '#0FF000';
		
		//--- calculate waveform dimensions from audio data
		var bufferLen = audioBuffer.length;
		var jump = Math.floor(bufferLen / width) > 1 ? Math.floor(bufferLen / width) : 1;
		
		//--- retrieve stereo PCM data from audioBuffer
		var pcmL = audioBuffer.getChannelData(0);
		var pcmR = audioBuffer.getChannelData(1);

		//--- calculate max amplitude for scaling later
		var maxAmp = 0;
		for (var i = 0; i < bufferLen; i += jump) {
			maxAmp = Math.abs(pcmL[i]) > maxAmp ? Math.abs(pcmL[i]) : maxAmp;
			maxAmp = Math.abs(pcmR[i]) > maxAmp ? Math.abs(pcmR[i]) : maxAmp;
		}
		
		//--- draw scaled waveform
		var x = 0;
		var monoAmplitude = 0; var waveHeight = 0;
		for(var i = 0; i < bufferLen; i += jump) {
			monoAmplitude = Math.abs( (pcmL[i] + pcmR[i]) / 2 ); // convert stereo to mono
			waveHeight = monoAmplitude / maxAmp * waveformHeight;
			waveformCanvasCtx.fillRect(x, (waveformHeight / 2) - waveHeight, 1, (waveHeight * 2));

			x++;
		}
	};

	this.drawSpectrogram = function(audioBuffer) {
		console.log("begin drawing spectrogram...")
		spectrogramCanvasCtx.clearRect(0, 0, spectrogramCanvasCtx.width, spectrogramCanvasCtx.height);

		//--- retrieve stereo PCM data from audioBuffer
		var pcmL = audioBuffer.getChannelData(0);
		var pcmR = audioBuffer.getChannelData(1);

		// TODO: take out stereo to mono convertion from this class
		//--- convert stereo to mono
		var monoAudio = [];
		for(var i = 0; i < audioBuffer.length; i++) {
			monoAudio[i] = Math.abs( (pcmL[i] + pcmR[i]) / 2 ); // convert stereo to mono
		}

		//--- values for calculating FFT:
		var logN = 10;
		var overlap = 0.5;
		var windowSize = 1 << logN;
		var noOfFrames = Math.floor(audioBuffer.length / (overlap * windowSize)) - 1;	// discard the last frame

		//--- set-up FFT calculator
		var specRe = [];
		var specIm = [];
		fft.init(logN);

		var specMagnitude = [];
		var soundFFT = [];

		var maxSpecAmp = 0; 	// for scaling later
		
		var maxFreq = (windowSize/2 + 1);
		var windowedFrame = [];
		var magnitude = [];
		var pos = 0;

		for (var i = 0; i < noOfFrames; i++) {	

			// slice the next frame apply hanning window to the frame
			windowedFrame = hanningWindow(monoAudio.slice(pos, pos + windowSize), windowSize);

			// fft values of the frame
			fft.forwardReal(windowedFrame, specRe, specIm);
			
			// calculate the magnitude from real and imaginary parts
			for (var j = 0; j < maxFreq; j++) {
				magnitude[j] = Math.sqrt((specRe[j] * specRe[j]) + (specIm[j] * specIm[j]));
				maxSpecAmp = maxSpecAmp > magnitude[j] ? maxSpecAmp : magnitude[j];

			}

			soundFFT.push(magnitude);

			pos += (windowSize / 2);
		}

		//--- determine spectrogram colours
		var hot = new chroma.ColorScale({
			colors:['#000000', '#FFFF00', '#FF0000'],
			positions:[0, 0.50, 1.0],
			mode:'rgb',
			limits:[0, maxSpecAmp]
		});

		//--- paint the canvas
		var jump = Math.floor(noOfFrames / width) > 1 ? Math.floor(noOfFrames / width) : 1;
		var x = 0;
		
		for(var i = 0; i < noOfFrames; i += jump) {
			x = Math.round((windowSize * overlap) * i * (width/audioBuffer.length));

			for (var freq = 0; freq < maxFreq; ++freq) {
				spectrogramCanvasCtx.fillStyle = hot.getColor(soundFFT[i][freq]);
				spectrogramCanvasCtx.fillRect(x, (maxFreq - freq), 1, 1);

			}

		}
		console.log('spectrogram: done');
	};

	return that;
}


// TODO: make a function that redraws spectrogram based on new
// rasterised data.

// TODO: make a function that returns the pixel data to allow 
// edge detection.
