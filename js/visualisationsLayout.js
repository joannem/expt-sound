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
		// TODO: don't call drawEdges() every time you want to toggle
		gVisualiser.drawEdges();
		$('#visualSpect-canvas').toggle();

	});

	$('.blur-btn').click(function() {
		// TODO: don't call blurImage() every time you want to toggle
		gVisualiser.blurImage();
		$('#visualSpect-canvas').toggle();
	})

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
	gslider = new Slider($('.waveform-slider'), Math.abs(gSound.getSoundData().duration * 1000), true);
}

function setupVisualisations() {

	gVisualiser.drawWaveform(gSound.getSoundData());

	// FFT values:
	var logN = 10;
	var overlap = 0.5;
	var windowSize = 1 << logN;

	// set up FFT calculator
	fft = new FFT();
	fft.init(logN);

	// set up FFT
	var noOfFrames = Math.floor(gSound.getSoundData().length / (overlap * windowSize)) - 1;	// discard the last frame
	var maxMagnitude = gVisualiser.calculateFft(gSound.getSoundData(), windowSize, noOfFrames);

	gVisualiser.drawSpectrogram(noOfFrames, (windowSize/2 + 1), maxMagnitude);
}