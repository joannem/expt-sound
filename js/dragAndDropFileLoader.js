// Drag'n'drop
// code adapted from: https://github.com/katspaugh/wavesurfer.js/blob/master/example/main.js

"use strict";

function DDFileLoader(dropTarget) {
	var that = (this === window) ? {} : this;

	that.dropTarget = dropTarget;

	var toggleActive = function (e, toggle) {
		e.stopPropagation();
		e.preventDefault();
		toggle ? dropTarget.addClass('dragover') :
			dropTarget.removeClass('dragover');
	};
	
	var handlers = {
		drop: function (e) {
			toggleActive(e, false);

			// Load the file
			if (e.dataTransfer.files.length) {
				console.log("Begin file decode.");
				that.loadBlob(e.dataTransfer.files[0]);
			} else {
				console.log("Error, not a file.");
			}
		},

		dragover: function (e) {
			// console.log(e.target.classList, "dragover");
			toggleActive(e, true);
		},

		dragleave: function (e) {
			// console.log(e.target.classList, "dragleave");
			toggleActive(e, false);
		}
	};

	Object.keys(handlers).forEach(function (event) {
		that.dropTarget[0].addEventListener(event, handlers[event]);
	});

	return that;
}

DDFileLoader.prototype = {
	constructor: DDFileLoader,

	/**
	 * Loads audio data from a Blob or File object.
	 *
	 * @param {Blob|File} blob Audio data.
	 */
	loadBlob: function(blob) {
		var reader = new FileReader();
		var decodeArrayBufferFx = this.decodeArrayBuffer;

		reader.addEventListener('load', function (e) {
			decodeArrayBufferFx(e.target.result);
		});

		reader.readAsArrayBuffer(blob);
	}, 
	
	/**
	 * Converts an ArrayBuffer into an AudioBuffer representing the 
	 * decoded PCM audio data.
	 * @param  {ArrayBuffer} arraybuffer ArrayBuffer to be decoded into 
	 *                                   an AudioBuffer for playback
	 */
	decodeArrayBuffer: function (arraybuffer) {
		var offlineAc = new OfflineAudioContext(2, 44100*40, 44100);

		offlineAc.decodeAudioData(arraybuffer, (function (soundData) {
			prepareSound(soundData);
			setupVisualisations();
			$('.waveform-slider').attr('max', soundData.duration * 1000);
			// TODO: decouple all these
		}));

	//TOOD: catch error here
	}
}