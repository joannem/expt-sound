var gDDFileLoader = null;
var gVisualiser = null;

var gPlaying = false;
var gSound = null;
// TODO: var gIsLoop = false;
var gslider = null;
var gOffset = 0;

var soundFFT = [];		// TODO: change to localised variable
var fft = null; 		// TODO: change to localised variable

document.addEventListener('DOMContentLoaded', function () {

	gDDFileLoader = new DDFileLoader($('.drop-container'));
	gVisualiser = new Visualiser();

	$('#play-pause-btn-original').click(function() {
		if (!gPlaying && gslider != null && gSound != null) {
			gSound.playSound(gOffset / 1000.0);
			gslider.startSlider(gOffset);
			
			gPlaying = true;
			$('#play-pause-btn-original').text('pause'); 

		} else if (gPlaying && gslider != null && gSound != null) {
			gSound.pauseSound();
			gOffset = gslider.pauseSlider();
			
			gPlaying = false;
			$('#play-pause-btn-original').text('play'); 

		} else {
			console.log ("No sound data found.");

		}
	});

	$('#stop-btn-original').click(function() {
		if (gslider !=null && gSound != null) {
			gSound.stopSound();
			gslider.stopSlider();
			gOffset = 0;

			gPlaying = false;
			$('#play-pause-btn-original').text('play'); 
		}
	});

	$('.waveform-slider').on("mousedown", function(){
		if (gslider != null && gSound != null) {
			gSound.pauseSound();
			gslider.pauseSlider();
		}
	});

	$('.waveform-slider').on("mouseup", function(){
		gOffset = this.value;

		if (gPlaying && gslider != null && gSound != null) {
			gSound.playSound(gOffset / 1000.0);
			gslider.startSlider(gOffset);
		}
	});

	$('.edge-btn').click(function() {
		// TODO: don't call drawEdges() every time you want to toggle
		gVisualiser.drawEdges();
		$('#visualSpect-canvas').toggle();

	});

	$('.blur-btn').click(function() {
		// TODO: don't call blurImage() every time you want to toggle
		gVisualiser.blurImage();
		$('#visualSpect-canvas').toggle();
	});

	$('.inverse-spect-btn').click(function() {
		// spectCanvas = document.getElementById("spectrogram-canvas");
		
		// var matrix = [];
		// for (var i = 0; i < windowSize; i++){
		// 	matrix[i]=new Array(Math.round(noOfFrames/2 + 1)).fill(0);
		// };

		// pixels2Matrix(spectCanvas, matrix);

		// onReconstruct(matrix);
		console.log(soundFFT.length);
		onReconstruct(soundFFT);
	});

	//------ EXPERIMENTAL CODE WITH SPSI BEGIN ------\\
	$('#play-pause-btn-spsi').click(function() {
		if (!gPlaying && buffer != null) {
			bufferSrc = audioCtx.createBufferSource();
			bufferSrc.buffer = buffer;
			bufferSrc.connect(audioCtx.destination);
			console.log(buffer);
			bufferSrc.start(0);
			gPlaying = true;
			$('#play-pause-btn-spsi').text('pause'); 

		} else if (gPlaying && bufferSrc != null && buffer != null) {
			bufferSrc.stop();
			gPlaying = false;
			$('#play-pause-btn-spsi').text('play'); 

		} else {
			console.log ("No sound data found.");

		}
	});

	$('#stop-btn-spsi').click(function() {
		if (bufferSrc != null) {
			bufferSrc.stop();
			gPlaying = false;
			$('#play-pause-btn-spsi').text('play'); 
		}
	});
	//------ EXPERIMENTAL CODE WITH SPSI END ------\\

});

// call back triggered when sound is stopped normally
function resetSoundAndSlider() {
	if (gslider !=null && gSound != null) {
		gSound.stopSound();
		gslider.stopSlider();
		gOffset = 0;

		gPlaying = false;
		$('.play-pause-btn').text('play'); 
	}
}

function prepareSound(soundData) {
	gSound = new Sound(soundData, false, resetSoundAndSlider);
	gslider = new Slider($('.waveform-slider'), (gSound.getSoundData().duration * 1000), true);
}

var windowSize = 0;
var noOfFrames = 0;

function setupVisualisations() {
	//--- DSP values:
	var logN = 10;
	var overlap = 0.5;
	windowSize = 1 << logN;
	noOfFrames = Math.floor(gSound.getSoundData().length / (overlap * windowSize)) - 1;	// discard the last frame

	//--- draw waveform
	gVisualiser.drawWaveform(gSound.getSoundData());

	//--- set up FFT calculator
	fft = new FFT();
	fft.init(logN);

	//--- calculate FFT
	var maxMagnitude = gVisualiser.calculateFft(gSound.getSoundData(), windowSize, noOfFrames);

	//--- draw spectrogram
	gVisualiser.drawSpectrogram(gSound.getSoundData().length, windowSize, overlap, noOfFrames, (windowSize/2 + 1), maxMagnitude);
}

//------ EXPERIMENTAL CODE WITH SPSI BEGIN ------\\
// Called on button push
function pixels2Matrix(source, destination){
	if ((!source) || (source.length<=0)) return;
	var destWidth=destination.length;
	var destHeight=destination[0].length;

	// Intercavas does our interpolation for us
	var interCanvas = document.createElement("canvas");
	interCanvas.width=destWidth;
	interCanvas.height=destHeight;
	var interCtx=interCanvas.getContext("2d");
	interCtx.drawImage(source , 0, 0, destWidth, destHeight);

	var time = Date.now();
	var pixelData = interCtx.getImageData(0,0,destWidth, destHeight);
	// now the interCanvas and the matrix are the same dimensions. Just grab pixel data and convert to grey scale. 
	var pixel;
	var pindex=0;
		for(var j=0;j<destHeight;j++){
			for (var i=0;i<destWidth; i++){

			destination[i][destHeight-1-j]=rgb2grey(pixelData.data[pindex], pixelData.data[pindex+1], pixelData.data[pindex+2]);
			pindex+=4;
		}
	}
	console.log("pixels2Matrix took " + (Date.now()-time) + " milliseconds");
}

//https://en.wikipedia.org/wiki/Grayscale
function rgb2grey(r, g, b){
	return .299*r + .587*g + .114*b;
}


function onReconstruct(sgram) {
	console.log("sgram.length: " + sgram.length);

	var frameStartIndex=0;
	var frameNum=0;

	////////// current dummy values for window len (same value as windowSize)
	var logN = 10;
	var windowLength = 1 << logN;
	//////////////////////////////

	var stepsPerFrame = 2;
	var stepSize=windowLength/stepsPerFrame;
	

	// frame-length arrays to hold the waveform at various stems
	var frame = new Array(windowLength);
	var reconFrame = new Array(windowLength);
	var wFrame; // a windowed frame 

	// Real and Imaginary part of the spectrum
	var specRe = new Array(windowLength/2+1);
	var specIm = new Array(windowLength/2+1);
	
	var maxSpectrogramVal = 0;// = Math.max(...specMag); // The spread operater in ECMAScript6
	var specMag;

	var hannWindow = hannArray(windowLength);
				
	var fft = new FFT();
	fft.init(logN);

	//+++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++
	// Now do the SPSI reconstruction! 
	var spsiReconSig = new Array( Math.ceil( ((sgram.length+3)*windowLength)/2 ) ).fill(0);
	var phaseAcc = new Array(windowLength/2+1).fill(0);
	var m_tempRe = new Array(windowLength/2+1).fill(0);
	var m_tempIm = new Array(windowLength/2+1).fill(0);

	frameNum=0;
	frameStartIndex=0;
	while(frameNum < sgram.length) {
		// phaseAcc is used both as input (current phases) and as output (returned phases) at each step;
		phaseEstimate(sgram[frameNum], phaseAcc);
		//convert (mag, phase) to (re, im)
		polarToCart( sgram[frameNum], phaseAcc, m_tempRe, m_tempIm, windowLength/2 );
		// invert
		fft.inverseReal(m_tempRe, m_tempIm, reconFrame);
		// window
		wframe = dotStar(hannWindow, reconFrame);

		add_I(wframe, 0, spsiReconSig, frameStartIndex, windowLength)

		frameNum++;
		frameStartIndex+=stepSize;
	}

	console.log("spsiReconSig.length: " + spsiReconSig.length);
	farray2Buf(spsiReconSig);

	// see what it looks like!
	drawSpsiSignal(spsiReconSig);
}

function dotStar(a,b) {
	var c=[];
	for (var i=0;i<a.length;i++){
		c[i]=a[i]*b[i];
	}
	return c;
}

function hannArray(length) {
	var hann=[];
	var area=0;
	for (var i = 0; i<length;i++){
		hann[i] = getHann(length,i);
		area += hann[i];
	}
	console.log("Hann window area is " + area);
	return hann;
}

function getHann (length, index) {
	var wr=Math.sqrt(length/2)/Math.sqrt(length);
	var scale = 2*wr/Math.sqrt(1.5); // see Griffin Lim for window scaling
		return scale*0.5 * (1 - Math.cos(Math.PI/length+2*Math.PI * index / length));
}

var audioCtx = new (window.AudioContext || window.webkitAudioContext)();
var bufferSrc = null;
var buffer = null;

function farray2Buf(farray) {
	// (remade)
	console.log(farray.length);
	buffer = audioCtx.createBuffer(1, farray.length, 44100);
	var nowBuffering = buffer.getChannelData(0);

	for(var i=0;i<farray.length;i++){
		nowBuffering[i]=farray[i];
	}
}

function phaseEstimate(currentMag, phaseAcc) {
	computePhases(currentMag, phaseAcc);
}

function computePhases(m_mag, m_phase) {
	var m_L = (m_mag.length-1)*2;
	m_S = m_L/2;

	// For each bin
	for (var i = 1; i < m_L/2-1; i++) {
		// If it's a peak
		if (m_mag[i] > m_mag[i-1] && m_mag[i] > m_mag[i+1]) {
			// Phase estimate using quadratic interpolation as per Julios O. Smith
			// http://www.dsprelated.com/dspbooks/sasp/Quadratic_Interpolation_Spectral_Peaks.html
			// To be determined: does quadratic interpolation work best on magnitude spectrum,
			// power spectrum, log spectrum?  I don't know, but I find it works pretty well with
			// the magnitude spectrum.

			// Use quadratic interpolation to estimate the
			// real peak position
			var alpha = m_mag[i-1];
			var beta = m_mag[i];
			var gamma = m_mag[i+1];
			
			var denom = alpha - 2*beta + gamma;
			var p = (denom != 0) ? 0.5*(alpha-gamma)/denom : 0.0;
			
			// Get the adjusted phase rate
			var phaseRate = 2*Math.PI*(i+p)/m_L;
			
			// Update the phase accumulator for this peak bin
			m_phase[i] += m_S*phaseRate;
			
			var peakPhase = m_phase[i];
			
			// ----
			// Apply simple phase locking around the peaks.
			// 
			// The phase relationships of the bins around the peak were determined by
			// some simple experiments, but I (Gerry) was inspired by stuff I'd read in
			// Laroche/Dolson "About This Phasiness Business" (1997), which mentions a paper
			// M.S. Puckette "Phase-locked vocoder" (1995).  
			// http://msp.ucsd.edu/Publications/mohonk95.pdf
			// According to Laroche/Dolson:
			// "Puckette in [5] recognized that for a constant-frequency constant-amplitude sinusoid 
			// the synthesis phases around the maximum of the Fourier transform should exhibit +/- pi 
			// alternations and proposed a very simple way to constrain them to do so".
			//
			// I don't know whether my method is the same as what Puckette described.  Mine just
			// corresponds to what I measured experimentally with in a tiny C++ test app.
			
			// Do 0/pi phase shift thing around the peak
			// If actual peak is to the right
			var bin;
			if (p > 0) {
				// - Bins to left have shift of pi
				// - First bin to right has pi shift
				// - Other bins to right have zero shift
				bin = i-1;
				while (bin > 0 && m_mag[bin] < m_mag[bin+1]) {
					m_phase[bin] = peakPhase + Math.PI;
					bin--;
				}
				bin = i+1;
				while (bin < m_L/2-1 && m_mag[bin] < m_mag[bin-1]) {
					if (bin == i+1)
						m_phase[bin] = peakPhase + Math.PI;
					else
						m_phase[bin] = peakPhase + 0;
					bin++;
				}
			}
			else {
				// Peak is to the left
				// - Bins to right have shift of pi
				// - First bin to left has pi shift
				// - Other bins to left have zero shift
				bin = i-1;
				while (bin > 0 && m_mag[bin] < m_mag[bin+1]) {
					if (bin == i-1)
						m_phase[bin] = peakPhase + Math.PI;
					else
						m_phase[bin] = peakPhase + 0;
					bin--;
				}
				bin = i+1;
				while (bin < m_L/2-1 && m_mag[bin] < m_mag[bin-1]) {
					m_phase[bin] = peakPhase + Math.PI;
					bin++;
				}
			}
		}
	}
	
	// Should be done if we're going to play for a very long time to avoid
	// getting enormous phase values.
	// Limit phase to +/- PI
	//vDSP_vsmul(m_phaseAccum.data(), 1, &INVTWOPI, m_phaseAccum.data(), 1, m_N/2);
	//vDSP_vfrac(m_phaseAccum.data(), 1, m_phaseAccum.data(), 1, m_N/2);
	//vDSP_vsmul(m_phaseAccum.data(), 1, &TWOPI, m_phaseAccum.data(), 1, m_N/2);
} // computePhases

/**
 * Convert from polar coordinates (mag,phase) to 
 * cartesian/rectangular coordinates (real,imaginary).
 * @param	mag		Magnitude
 * @param	phase	Phase (radians)
 * @param	re		Real component
 * @param	im		Imaginary component
 * @param	n		Number of elements
 * 
 */
function polarToCart (
	mag,  //vector,
	phase,  //vector,
	re,  //vector,
	im,  //vector,
	n ) {

	for ( var k = 0; k < n; k++ ) {
		re[k] = mag[k]*Math.cos(phase[k]);
		im[k] = mag[k]*Math.sin(phase[k]);
	}
}

/**
 * Adds samples from src vector to dst vector
 * @param	src		Source vector
 * @param	srcPos	Add from this position
 * @param	dst		Destination vector
 * @param	dstPos	Add into dst start from this position
 * @param	n		Number of samples to add in
 */
function add_I (
	src,  //vector,
	srcPos,
	dst,  //vector,
	dstPos,
	n ) {
	if (srcPos == 0 && dstPos == 0) {
		for ( var i = 0; i < n; i++ )
			dst[i] += src[i];
	} else {
		while ( n > 0 ) {
			dst[dstPos] += src[srcPos];
			dstPos++;
			srcPos++;
			n--;
		}
	}
}

function drawSpsiSignal(signal) {
	console.log("spsi signal length: " + signal.length);
	var canvasCtx = $("#reconstructed-waveform-canvas").get()[0].getContext("2d");
	if (signal != null && canvasCtx != null) {

		var canvasHeight = 150;
		var canvasWidth = $(window).width();
		$("#reconstructed-waveform-canvas").attr('height', canvasHeight);
		$("#reconstructed-waveform-canvas").attr('width', canvasWidth);
		document.getElementById("reconstructed-waveform-canvas").setAttribute('width', canvasWidth);

		var jump = Math.floor(signal.length / canvasWidth) > 1 ? Math.floor(signal.length / canvasWidth) : 1;

		// find the max to stretch the waveform
		var max = 0;
		for (var i = 0; i < signal.length; i += jump) {
			max = Math.abs(signal[i]) > max ? Math.abs(signal[i]) : max;
		}

		// draw rasterised waveform
		var x = 0;
		var amp = 0;
		canvasCtx.fillStyle = '#ff9a00';

		for (var i = 0; i < signal.length; i += jump) {
			amp = Math.abs(signal[i] / max * ((canvasHeight / 2) - 5));
			canvasCtx.fillRect(x, (canvasHeight / 2) - amp, 1, (amp * 2));
			++x;
		}

	}
}

//------ EXPERIMENTAL CODE WITH SPSI END ------\\
