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

		waveformCanvasCtx.fillRect(0, 0, width, waveformHeight);
	}

	/**
	 * Does a Hanning window on a given frame.
	 * Code adapted from: http://stackoverflow.com/questions/
	 * 11600515/hanning-von-hann-window
	 * @param {Array} frame  			Values from a frame of from a signal
	 * @param {int} size 				Size of frame
	 * @param {Array} windowedFrame		Windowed frame
	 */
	function hanningWindow(frame, size, windowedFrame) {
		for (var i = 0; i < size; i++) {
			windowedFrame.push(frame[i] * 0.5 * (1.0 - Math.cos(2.0 * Math.PI * i / size)));
		}
	}


	//----- privileged methods -----//
	
	/**
	 * (Re)draws the original waveform of the sound onto the waveform canvas.
	 * 
	 * @param {Array} monoPcmData	PCM of sound in mono form
	 * @param {int} pcmDataLen		Length of monoPcmData
	 * @param {int} maxAmp 			Maximum amplitude of all values in monoPcmData
	 */
	this.drawWaveform = function(monoPcmData, pcmDataLen, maxAmp) {
		waveformCanvasCtx.clearRect(0, 0, width, waveformHeight);
		waveformCanvasCtx.fillStyle = '#000000';
		waveformCanvasCtx.fillRect(0, 0, width, waveformHeight);

		//--- calculate waveform dimensions from audio data
		var jump = Math.floor(pcmDataLen / width) > 1 ? Math.floor(pcmDataLen / width) : 1;
		
		//--- draw scaled waveform
		console.log("Begin drawing waveform...");
		
		waveformCanvasCtx.fillStyle = '#0FF000';
		var x = 0; var waveHeight = 0;
		for(var i = 0; i < pcmDataLen; i += jump) {
			waveHeight = monoPcmData[i] / maxAmp * waveformHeight;
			waveformCanvasCtx.fillRect(x, (waveformHeight / 2) - waveHeight, 1, (waveHeight * 2));

			x++;
		}

		console.log("Waveform: done.");
	};

	/**
	 * (Re)draws the spectrogram of the sound onto the spectrogram canvas.
	 * 
	 * @param {Array} monoPcmData	PCM of sound in mono form
	 * @param {int} pcmDataLen		Length of monoPcmData
	 */
	this.drawSpectrogram = function(monoPcmData, pcmDataLen) {
		console.log("Begin drawing spectrogram...")
		spectrogramCanvasCtx.clearRect(0, 0, width, spectHeight);
		spectrogramCanvasCtx.fillStyle = '#000000';
		spectrogramCanvasCtx.fillRect(0, 0, width, spectHeight);

		//--- values for calculating FFT:
		var logN = 10;
		var overlap = 0.5;
		var windowSize = 1 << logN;
		var noOfFrames = Math.floor(pcmDataLen / (overlap * windowSize)) - 1;	// discard the last frame

		//--- set-up FFT calculator
		var specRe = [];
		var specIm = [];
		fft.init(logN);

		var specMagnitude = [];
		var soundFFT = [];

		var maxSpecAmp = 0; 	// for scaling later
		
		var maxFreq = (windowSize/2 + 1);
		var windowedFrame = [];
		
		var pos = 0;

		for (var i = 0; i < noOfFrames; i++) {	

			//--- slice the next frame apply hanning window to the frame
			windowedFrame = [];
			hanningWindow(monoPcmData.slice(pos, pos + windowSize), windowSize, windowedFrame);

			//--- calculate fft values of each frame
			fft.forwardReal(windowedFrame, specRe, specIm);

			//--- calculate the magnitude from real and imaginary parts
			for (var j = 0; j < maxFreq; j++) {
				// NOTE: added additional sqrt for clarity
				specMagnitude[j] = Math.sqrt(Math.sqrt((specRe[j] * specRe[j]) + (specIm[j] * specIm[j])));
				maxSpecAmp = maxSpecAmp > specMagnitude[j] ? maxSpecAmp : specMagnitude[j];

			}

			soundFFT.push(specMagnitude);

			//--- reset everything
			specMagnitude = [];
			specRe = [];
			specIm = [];

			pos += (windowSize * overlap);
		}
		
		// TODO: find proper way to colour spectrogram
		//--- determine spectrogram colours
		var hot = new chroma.ColorScale({
			colors:['#000000', '#FF0000', '#FFFF00', '#FFFFFF'],
			positions:[0, .15, .20, .25],
			mode:'rgb',
			limits:[0, maxSpecAmp]
		});

		//--- paint the canvas
		var jump = Math.floor(noOfFrames / width) > 1 ? Math.floor(noOfFrames / width) : 1;

		var x = 0;
		for(var i = 0; i < noOfFrames; i += jump) {
			x = Math.round((windowSize * overlap) * i * (width/pcmDataLen));

			for (var freq = 0; freq < maxFreq; ++freq) {
				spectrogramCanvasCtx.fillStyle = hot.getColor(soundFFT[i][freq]);
				spectrogramCanvasCtx.fillRect(x, (maxFreq - freq), 1, 1);

			}

		}
		console.log('spectrogram: done');
	};

	return that;
}

// TODO: make a function that returns the pixel data to allow 
// edge detection.
