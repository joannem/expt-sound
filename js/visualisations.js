var canvasLeftCtx = null;
var canvasRightCtx = null;
var canvasSpecCtx = null;

var canvasWaveformHeight = 150;
var canvasSpecHeight = 513;
var windowWidth = $(window).width();


function setupBlankWaveformCanvases() {
	canvasLeftCtx = $("#waveform-canvas-left").get()[0].getContext("2d");
	canvasRightCtx = $("#waveform-canvas-right").get()[0].getContext("2d");

	var canvasLeft = document.getElementById('waveform-canvas-left');
	var canvasRight = document.getElementById('waveform-canvas-right');
	
	canvasLeft.setAttribute('width', windowWidth);
	canvasRight.setAttribute('width', windowWidth);
	
	canvasLeft.setAttribute('height', canvasWaveformHeight);
	canvasRight.setAttribute('height', canvasWaveformHeight);
	
	canvasLeftCtx.fillRect(0, 0, windowWidth, canvasWaveformHeight);
	canvasRightCtx.fillRect(0, 0, windowWidth, canvasWaveformHeight);

	canvasLeftCtx.save();
	canvasRightCtx.save();
	
}

function setupBlankSpectrogramCanvas () {
	canvasSpecCtx = $("#spectrogram-canvas").get()[0].getContext("2d");
	canvasVisualCtx = $("#visualSpect-canvas").get()[0].getContext("2d");
	
	var canvasSpec = document.getElementById('spectrogram-canvas');
	var canvasVisual = document.getElementById('visualSpect-canvas');

	canvasSpec.setAttribute('width', windowWidth);
	canvasSpec.setAttribute('height', canvasSpecHeight);
	canvasSpecCtx.fillRect(0, 0, windowWidth, canvasSpecHeight);

	canvasVisual.setAttribute('width', windowWidth);
	canvasVisual.setAttribute('height', canvasSpecHeight);

	canvasSpecCtx.translate(0, -1);	// leave a 1 px gap below
	canvasVisualCtx.translate(0, -1);	// leave a 1 px gap below
}

/**
 * Draws the waveform of the sound into the canvases representing the
 * left and right channels.
 * 
 * @param  {AudioBuffer} buffer AudioBuffer containing sound data
 */
function drawWaveform(buffer) {
 	if (buffer != null) {
 		if (canvasLeftCtx != null && canvasRightCtx != null) {
 			// clean canvas
 			canvasLeftCtx.fillStyle = '#000000';
 			canvasRightCtx.fillStyle = '#000000';
 			canvasLeftCtx.fillRect(0, 0, windowWidth, canvasWaveformHeight);
			canvasRightCtx.fillRect(0, 0, windowWidth, canvasWaveformHeight);

 			var pcmL = buffer.getChannelData(0);
 			var pcmR = buffer.getChannelData(1);

 			var maxL = 0;
 			var maxR = 0;

 			var bufferLen = buffer.length;
 			var jump = Math.floor(bufferLen / windowWidth);

			// note: nominal range of PCM data is [-1.0, 1.0]
			// TODO: decide on whether to fix maxL and maxR to 1.0
			for (var i = 0; i < bufferLen; i = i + jump) {
				maxL = Math.abs(pcmL[i]) > maxL ? Math.abs(pcmL[i]) : maxL;
				maxR = Math.abs(pcmR[i]) > maxR ? Math.abs(pcmR[i]) : maxR;

			}

			var x = 0;
			var heightL = 0;
			var heightR = 0;

			canvasLeftCtx.fillStyle = '#0FF000';
			canvasRightCtx.fillStyle = '#0FF000';

			for(var i = 0; i < bufferLen; i = i + jump) {
				// -5 translation to leave a 2.5px gap between waveform and border of canvas
				heightL = pcmL[i] / maxL * ((canvasWaveformHeight / 2) - 5);
				heightR = pcmR[i] / maxR * ((canvasWaveformHeight / 2) - 5);

				if (heightL < 0) {
					canvasLeftCtx.fillRect(x, (canvasWaveformHeight / 2), 1, Math.abs(heightL));
				} else {
					canvasLeftCtx.fillRect(x, (canvasWaveformHeight / 2) - heightL, 1, Math.abs(heightL));
				}

				if (heightR < 0) {
					canvasRightCtx.fillRect(x, (canvasWaveformHeight / 2), 1, Math.abs(heightR));
				} else {
					canvasRightCtx.fillRect(x, (canvasWaveformHeight / 2) - heightR, 1, Math.abs(heightR));
				}

				x++;
			}

		} else {
			console.log("Error: canvasRightCtx and canvasLeftCtx not defined.");

		}

	} else {
		console.log("Error: No sound data loaded.");

	}

}

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
function calculateFft(buffer, windowSize, noOfFrames) {
	if (buffer != null) {
		// set-up temp holder of each frame's values 
		var windowedFrame = [];
		var specRe = [];
		var specIm = [];
		var magnitude = [];

		var maxMagnitude = 0; 	// for scaling later

		var pos = 0;
		for (var i = 0; i < noOfFrames; i++) {
			// reset all arrays
			specRe = Array.apply(null, Array(windowSize/2 + 1)).map(Number.prototype.valueOf,0.0);
			specIm = Array.apply(null, Array(windowSize/2 + 1)).map(Number.prototype.valueOf,0.0);
			magnitude = Array.apply(null, Array(windowSize/2 + 1)).map(Number.prototype.valueOf,0.0);

			// slice the next frame apply hanning window to the frame
			windowedFrame = hanningWindow(buffer.getChannelData(0).slice(pos, pos + windowSize), windowSize);

			// fft values of the frame
			fft.forwardReal(windowedFrame, specRe, specIm);
			
			// calculate the magnitude from real and imaginary parts
			for (var j = 0; j < (windowSize/2 + 1); j++) {
				// addtional sqrt() to scale magnitude
				magnitude[j] = Math.sqrt(Math.sqrt((specRe[j] * specRe[j]) + (specIm[j] * specIm[j])));
				maxMagnitude = maxMagnitude > magnitude[j] ? maxMagnitude : magnitude[j];

			}

			soundFFT.push(magnitude);

			pos += (windowSize / 2);
		}

		var data_type = jsfeat.F32_t | jsfeat.C1_t;
		var my_matrix = new jsfeat.matrix_t(soundFFT.length, noOfFrames, data_type, data_buffer = soundFFT);

		// console.log(soundFFT); // noOfFrames * (windowSize/2 + 1)
		// console.log(my_matrix);

		return maxMagnitude;

	} else {
		console.log ("Error: No sound data loaded.");
		return 0;

	}

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

/**
 * Draws the spectrogram for the sound onto a pre-defined canvas. 
 * 
 * @param  {int} noOfFrames   	Number of frames the audio is cut into.
 * @param  {int} maxFreq		Maximum frequency calculated by the FFT.
 * @param  {float} maxMagnitude	Maximum magnitude recorded from the FFT. Used for
 *                              scaling the colours of the spectrogram.
 */
function drawSpectrogram(noOfFrames, maxFreq, maxMagnitude) {
	if (canvasSpecCtx != null) {
		// reset canvas
		canvasSpecCtx.fillStyle = '#000000';
		canvasSpecCtx.fillRect(0, 1, windowWidth, canvasSpecHeight);

		// determine spectrogram colours
		var hot = new chroma.ColorScale({
			colors:['#000000', '#FF0000', '#FFFF00', '#FFFFFF'],
			positions:[0, .25, .75, 1],
			mode:'rgb',
			limits:[0, maxMagnitude]
		});

		var jump = Math.floor(noOfFrames / windowWidth) > 1 ? Math.floor(noOfFrames / windowWidth) : 1;

		x = 0;
		for(var i = 0; i < noOfFrames; i += jump) {
			for (var freq = 0; freq < maxFreq; freq++) {
				canvasSpecCtx.fillStyle = hot.getColor(soundFFT[i][freq]).hex();
				canvasSpecCtx.fillRect(x, (maxFreq - freq), 1, 1);

			}
			++x;

		}
		console.log('spectrogram: done');

	} else {
		console.log ("Error: canvasSpecCtx not defined.");

	}

}