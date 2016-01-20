/**
 * A class that converts a mono waveform's PCM data into a spectrogram,
 * and vice versa with SPSI. 
 * Note: Spectrogram is an array of size [noOfFrames][maxFreq].
 *
 * Created by joanne on 20/01/16.
 */

function WaveSpect (logN, overlap) {
	"use strict";

	var that = (this === window) ? {} : this;

	//----- variables -----//
	
	//--- values for calculating FFT:
	var windowSize = 1 << logN;
	var maxFreq = (windowSize / 2) + 1;
	var noOfFrames = 0;	// unknown until length of PCM data in known
	
	var fft = new FFT();


	//----- Private methods -----//

	function onReconstruct(sgram) {
		// console.log("sgram.length: " + sgram.length);

		var frameStartIndex = 0;
		var frameNum = 0;

		var stepsPerFrame = 2;
		var stepSize = windowSize/stepsPerFrame;
		
		// frame-length arrays to hold the waveform at various stems
		var frame = new Array(windowSize);
		var reconFrame = new Array(windowSize);
		var wFrame; // a windowed frame 

		// Real and Imaginary part of the spectrum
		var specRe = new Array(maxFreq);
		var specIm = new Array(maxFreq);
		
		var maxSpectrogramVal = 0;// = Math.max(...specMag); // The spread operater in ECMAScript6
		var specMag;

		var hannWindow = hannArray(windowSize);
					
		fft.init(logN);

		//+++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++
		// Now do the SPSI reconstruction! 
		var spsiReconSig = new Array( Math.ceil( ((sgram.length+3)*windowSize)/2 ) ).fill(0);
		var phaseAcc = new Array(maxFreq).fill(0);
		var m_tempRe = new Array(maxFreq).fill(0);
		var m_tempIm = new Array(maxFreq).fill(0);

		frameNum = 0;
		frameStartIndex = 0;
		while(frameNum < sgram.length) {
			// phaseAcc is used both as input (current phases) and as output (returned phases) at each step;
			phaseEstimate(sgram[frameNum], phaseAcc);
			//convert (mag, phase) to (re, im)
			polarToCart( sgram[frameNum], phaseAcc, m_tempRe, m_tempIm, windowSize/2 );
			// invert
			fft.inverseReal(m_tempRe, m_tempIm, reconFrame);
			// window
			var wframe = dotStar(hannWindow, reconFrame);

			add_I(wframe, 0, spsiReconSig, frameStartIndex, windowSize)

			frameNum++;
			frameStartIndex += stepSize;
		}
		// console.log(spsiReconSig);

		return spsiReconSig;
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
		// console.log("Hann window area is " + area);
		return hann;
	}

	function getHann (length, index) {
		var wr=Math.sqrt(length/2)/Math.sqrt(length);
		var scale = 2*wr/Math.sqrt(1.5); // see Griffin Lim for window scaling
			return scale*0.5 * (1 - Math.cos(Math.PI/length+2*Math.PI * index / length));
	}

	function phaseEstimate(currentMag, phaseAcc) {
		computePhases(currentMag, phaseAcc);
	}

	function computePhases(m_mag, m_phase) {
		var m_L = (m_mag.length-1)*2;
		var m_S = m_L/2;

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
	 * Adds samples from src vector to dst vector
	 * @param	src		Source vector
	 * @param	srcPos	Add from this position
	 * @param	dst		Destination vector
	 * @param	dstPos	Add into dst start from this position
	 * @param	n		Number of samples to add in
	 */
	function add_I ( src, srcPos, dst, dstPos, n ) {
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

	/**
	 * Convert from polar coordinates (mag,phase) to 
	 * cartesian/rectangular coordinates (real,imaginary).
	 * @param	mag		Magnitude vector
	 * @param	phase	Phase vector (radians)
	 * @param	re		Real component vector
	 * @param	im		Imaginary component vector
	 * @param	n		Number of elements
	 * 
	 */
	function polarToCart (mag, phase, re, im, n ) {
		for ( var k = 0; k < n; k++ ) {
			re[k] = mag[k]*Math.cos(phase[k]);
			im[k] = mag[k]*Math.sin(phase[k]);
		}
	}


	//----- Privileged methods -----//
	
	this.spectToWave = function(srcSpect) {
		var reconPcm = onReconstruct(srcSpect);
		return reconPcm;
	}

	//TODO: waveToSpect

	return that;
}
