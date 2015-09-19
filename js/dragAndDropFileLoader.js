// Drag'n'drop
// code adapted from: https://github.com/katspaugh/wavesurfer.js/blob/master/example/main.js
document.addEventListener('DOMContentLoaded', function () {
	var toggleActive = function (e, toggle) {
		e.stopPropagation();
		e.preventDefault();
		toggle ? $('.drop-container').addClass('dragover') :
			$('.drop-container').removeClass('dragover');
	};

	var handlers = {
		// Drop event
		drop: function (e) {
			toggleActive(e, false);

			// Load the file
			if (e.dataTransfer.files.length) {
				loadBlob(e.dataTransfer.files[0]);
			} else {
				console.log("error, not a file");
			}
		},

		// Drag-over event
		dragover: function (e) {
			// console.log(e.target.classList, "dragover");
			toggleActive(e, true);
		},

		// Drag-leave event
		dragleave: function (e) {
			// console.log(e.target.classList, "dragleave");
			toggleActive(e, false);
		}
	};

	var dropTarget = document.querySelector('.drop-container');
	Object.keys(handlers).forEach(function (event) {
		dropTarget.addEventListener(event, handlers[event]);
	});
});

/**
 * Loads audio data from a Blob or File object.
 *
 * @param {Blob|File} blob Audio data.
 */
function loadBlob (blob) {
	// Create file reader
	var reader = new FileReader();
	reader.addEventListener('load', function (e) {
		decodeArrayBuffer(e.target.result);
	});

	reader.readAsArrayBuffer(blob);
}

/**
 * Converts an ArrayBuffer into an AudioBuffer representing the 
 * decoded PCM audio data.
 * @param  {ArrayBuffer} arraybuffer ArrayBuffer to be decoded into 
 *                                   an AudioBuffer for playback
 */
function decodeArrayBuffer (arraybuffer) {
	var offlineAc = new OfflineAudioContext(2, 44100*40, 44100);

	offlineAc.decodeAudioData(arraybuffer, (function (data) {
		soundData = data;
		prepareSound();
		setupVisualisations();
		$('.waveform-slider').attr('max', soundData.duration * 1000);
		// TODO: return true if done
	}));

	//TOOD: catch error here
}