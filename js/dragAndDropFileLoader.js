// Drag'n'drop
// code adapted from: https://github.com/katspaugh/wavesurfer.js/blob/master/example/main.js
document.addEventListener('DOMContentLoaded', function () {
	var toggleActive = function (e, toggle) {
		e.stopPropagation();
		e.preventDefault();
		toggle ? e.target.classList.add('dragover') :
		e.target.classList.remove('dragover');
	};

	var handlers = {
		// Drop event
		drop: function (e) {
			toggleActive(e, false);

			// Load the file
			if (e.dataTransfer.files.length) {
				console.log("proceed to load Blob");
				loadBlob(e.dataTransfer.files[0]);
			} else {
				console.log("error, not a file");
			}
		},

		// Drag-over event
		dragover: function (e) {
			toggleActive(e, true);
		},

		// Drag-leave event
		dragleave: function (e) {
			toggleActive(e, false);
		}
	};

	var dropTarget = document.querySelector('#drop');
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

function decodeArrayBuffer (arraybuffer) {
	var offlineAc = new OfflineAudioContext(2, 44100*40, 44100);

	offlineAc.decodeAudioData(arraybuffer, (function (data) {	
		soundData = data;
		setUpVisualisations();

	}));
}