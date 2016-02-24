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
 * @param {jQuery} waveformCanvasObj    	Canvas object to draw waveform in.
 * @param {jQuery} spsiWaveformCanvasObj	Canvas object to draw SPSI waveform in.
 * @param {jQuery} spectrogramCanvasObj 	Canvas object to draw spectrogram in.
 * @param {jQuery} hiddenCanvasObj 			Canvas object to store rasterised spectrogram.
 * @param {int} spectHeight 				Maximum frequency resolution in pixels.
 * @param {int} width 						Maximum time resolution in pixels.
 */
function SoundVisualiser(waveformCanvasObj, spsiWaveformCanvasObj, spectrogramCanvasObj, hiddenCanvasObj, spectHeight, waveformHeight, width) {
	"use strict";
	var that = (this === window) ? {} : this;

	//----- variables -----//
	
	var spectrogramCanvasCtx = spectrogramCanvasObj[0].getContext("2d");
	var hiddenCanvasCtx = hiddenCanvasObj[0].getContext("2d");

	var spsiWaveformCanvaCtx = spsiWaveformCanvasObj[0].getContext("2d");
	var waveformCanvasCtx = waveformCanvasObj[0].getContext("2d");

	//--- for dragging and zooming canvas
	var dx = 0; var dy = 0;
	var zoomDx = 0; var zoomDy = 0;
	var zoomVal = 1.0;
	
	//--- values for calculating FFT:
	var noOfFrames = 1050;	// default value (unknown until length of PCM data is known)

	setupBlankCanvas(width, spectHeight, spectrogramCanvasObj, spectrogramCanvasCtx);
	setupBlankCanvas(width, waveformHeight, spsiWaveformCanvasObj, spsiWaveformCanvaCtx);
	setupBlankCanvas(width, waveformHeight, waveformCanvasObj, waveformCanvasCtx);


	//----- private methods -----//

	function setupBlankCanvas(width, height, canvasObj, canvasCtx) {
		canvasObj.attr('width', width);
		canvasObj.attr('height', height);	

		canvasCtx.fillRect(0, 0, width, height);
	}


	//https://en.wikipedia.org/wiki/Grayscale
	function rgb2grey(r, g, b){
		return .299*r + .587*g + .114*b;
	}

	function updateSvgPattern() {
		var xlinkns = "http://www.w3.org/1999/xlink";
		var canvasDataUrl = spectrogramCanvasObj[0].toDataURL();
		$("#pattern-img")[0].setAttributeNS(xlinkns, "href", canvasDataUrl);
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

	// TODO: MERGE!! draw waveform and draw recon waveform

	/**
	 * (Re)draws the reconstructed waveform of the sound onto the waveform canvas.
	 * 
	 * @param {Array} monoPcmData	PCM of sound in mono form
	 * @param {int} pcmDataLen		Length of monoPcmData
	 * @param {int} maxAmp 			Maximum amplitude of all values in monoPcmData
	 */
	this.drawReconWaveform = function(monoPcmData, pcmDataLen, maxAmp) {
		spsiWaveformCanvaCtx.clearRect(0, 0, width, waveformHeight);
		spsiWaveformCanvaCtx.fillStyle = '#000000';
		spsiWaveformCanvaCtx.fillRect(0, 0, width, waveformHeight);

		//--- calculate waveform dimensions from audio data
		var jump = Math.floor(pcmDataLen / width) > 1 ? Math.floor(pcmDataLen / width) : 1;
		
		//--- draw scaled waveform
		console.log("Begin drawing SPSI waveform...");
		spsiWaveformCanvaCtx.fillStyle = '#000FF0';
		var x = 0; var waveHeight = 0;
		for(var i = 0; i < pcmDataLen; i += jump) {
			waveHeight = monoPcmData[i] / maxAmp * waveformHeight;
			spsiWaveformCanvaCtx.fillRect(x, (waveformHeight / 2) - waveHeight, 1, (waveHeight * 2));

			x++;
		}

		console.log("SPSI Waveform: done.");
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

		var soundSpectValuess = gWaveSpect.waveToSpect(monoPcmData, pcmDataLen);
		var soundFFT = soundSpectValuess.spectrogram;
		var maxSpecAmp = soundSpectValuess.maxSpecAmp;

		var overlap = gWaveSpect.getOverlap();
		var windowSize = gWaveSpect.getWindowSize();
		var maxFreq = gWaveSpect.getMaxFreq();
		noOfFrames = Math.floor(pcmDataLen / (overlap * windowSize)) - 1;	// discard the last frame
		
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
		updateSvgPattern();
	};

	this.spectrogramFromSvg = function(svgObj, extractedSpectrogram) {
		
		//--- scale SVG to according to FFT dimensions

		var maxFreq = gWaveSpect.getMaxFreq();
		
		var tempSvgObj = document.createElementNS("http://www.w3.org/2000/svg", "svg");
		var clonedChildren = svgObj.children().clone();

		for (var i = 0; i < clonedChildren.length; i++) {
			tempSvgObj.appendChild(clonedChildren[i]);
		}
		
		tempSvgObj.setAttribute('id', "svg-canvas-2");
		tempSvgObj.setAttribute('width', noOfFrames);
		tempSvgObj.setAttribute('height', maxFreq);
		tempSvgObj.setAttribute('preserveAspectRatio', "none");
		tempSvgObj.setAttribute('viewBox', "0 0 " + svgObj.width() + " " + svgObj.height());


		//--- scale canvas according to FFT dimensions

		setupBlankCanvas(noOfFrames, maxFreq, hiddenCanvasObj, hiddenCanvasCtx);
		hiddenCanvasCtx.fillStyle = '#000000';
		hiddenCanvasCtx.fillRect(0, 0, noOfFrames, maxFreq);


		//--- create rasterised canvas of SVG
		
		var svgXmlData = new XMLSerializer().serializeToString(tempSvgObj);
		var svgData = new Blob([svgXmlData], {type: 'image/svg+xml;charset=utf-8'});
		
		var domUrl = window.URL || window.webkitURL || window;
		var svgUrl = domUrl.createObjectURL(svgData);

		var img = new Image();
		img.src = svgUrl;
		
		img.onload = function () {
			hiddenCanvasCtx.drawImage(img, 0, 0);
			var pixelData = hiddenCanvasCtx.getImageData(0, 0, noOfFrames, maxFreq);
			
			domUrl.revokeObjectURL(svgUrl);

			//--- extract pixels from canvas to form spectrogram
			
			var pindex = 0;
			for (var j = (maxFreq - 1); j >= 0; j--){
				for(var i = 0; i < noOfFrames; i++){
					
					//--- initialise matrices first
					if (j == (maxFreq - 1)) {
						extractedSpectrogram[i] = new Array(maxFreq).fill(0);
					}

					extractedSpectrogram[i][j] = rgb2grey(pixelData.data[pindex], pixelData.data[pindex+1], pixelData.data[pindex+2]);
					pindex+=4;
				}
			}
			// console.log(extractedSpectrogram);
			hiddenCanvasObj.trigger("imgLoaded");
		}
	};

	return that;
}
