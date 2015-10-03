var gPlaying = false;
var gSound = null;
// TODO: var gIsLoop = false;
var gslider = null;
var gOffset = 0;

var soundFFT = [];		// TODO: change to localised variable
var fft = null; 		// TODO: change to localised variable

$('.play-pause-btn').click(function() {
	if (!gPlaying && gslider != null && gSound != null) {
		gSound.playSound(gOffset / 1000.0);
		gslider.startSlider(gOffset);
		
		gPlaying = true;
		$('.play-pause-btn').text('pause'); 

	} else if (gPlaying && gslider != null && gSound != null) {
		gSound.pauseSound();
		gOffset = gslider.pauseSlider();
		
		gPlaying = false;
		$('.play-pause-btn').text('play'); 

	} else {
		console.log ("No sound data found.");

	}
});

$('.stop-btn').click(function() {
	if (gslider !=null && gSound != null) {
		gSound.stopSound();
		gslider.stopSlider();
		gOffset = 0;

		gPlaying = false;
		$('.play-pause-btn').text('play'); 
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
		gSound.playSound(gOffset / 1000.0)
		gslider.startSlider(gOffset);
	}
});

$('.edge-btn').click(function() {
	$('#visualSpect-canvas').toggle();

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

setupBlankWaveformCanvases();
setupBlankSpectrogramCanvas();

function prepareSound(soundData) {
	gSound = new Sound(soundData, false, resetSoundAndSlider);
	gslider = new Slider($('.waveform-slider'), Math.abs(gSound.getSoundData().duration * 1000), true);
}

function setupVisualisations() {

	drawWaveform(gSound.getSoundData());

	// FFT values:
	var logN = 10;
	var overlap = 0.5;
	var windowSize = 1 << logN;

	// set up FFT calculator
	fft = new FFT();
	fft.init(logN);

	// set up FFT
	var noOfFrames = Math.floor(gSound.getSoundData().length / (overlap * windowSize)) - 1;	// discard the last frame
	var maxMagnitude = calculateFft(gSound.getSoundData(), windowSize, noOfFrames);

	drawSpectrogram(noOfFrames, (windowSize/2 + 1), maxMagnitude);
}