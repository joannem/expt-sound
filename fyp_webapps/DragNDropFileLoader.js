/**
 * Makes a section into a drop target where files can be dropped onto.
 * File data will be decoded into an array buffer by assuming its an 
 * audio file.
 *
 * Note: decoding is done using offlineAc.decodeAudioData() function.
 * 
 * Drag'n'drop code adapted from: 
 * https://github.com/katspaugh/wavesurfer.js/blob/master/example/main.js
 *
 * Created by joanne on 15/01/06
 */

/**
 * Creates a DragNDropFileLoader objefct.
 * 
 * @param {jQueryObj} dropTarget Target for users to drop files onto to 
 * be converted into array buffer format.
 */
function DragNDropFileLoader(dropTarget, postDecodeCallbackFunction) {
	"use strict";
	
	//----- variables -----//

	var that = (this === window) ? {} : this;

	that.handlers = {
		drop: function (e) {
			toggleActive(e, false);

			//--- Load the file
			if (e.dataTransfer.files.length) {
				console.log("Begin file decode.");
				loadBlob(e.dataTransfer.files[0]);
			} else {
				console.log("Error, unable to decode file into audio.");
			}
		},

		dragover: function (e) {
			toggleActive(e, true);
		},

		dragleave: function (e) {
			toggleActive(e, false);
		}
	};

	Object.keys(that.handlers).forEach(function (event) {
		dropTarget[0].addEventListener(event, that.handlers[event]);
	});


	//----- private methods -----//
	
	function toggleActive(e, toggle) {
		e.stopPropagation();
		e.preventDefault();
		toggle ? dropTarget.css({
			'border': "#D6D6D6 dashed 2px", 
			'background-color': "#EEEEEE"
		}) : dropTarget.css({
			'border': "transparent dashed 2px",
			'background-color': "#FFFFFF"});
	}

	/**
	 * Loads audio data from a Blob or File object.
	 *
	 * @param {Blob|File} blob Audio data.
	 */
	function loadBlob(blob) {
		var fileReader = new FileReader();

		fileReader.addEventListener('load', function (e) {
			decodeArrayBuffer(e.target.result);
		});

		fileReader.readAsArrayBuffer(blob);
	}

	
	/**
	 * Converts an ArrayBuffer into an AudioBuffer representing the 
	 * decoded PCM audio data.
	 * 
	 * @param  {ArrayBuffer} arraybuffer ArrayBuffer to be decoded into 
	 * an AudioBuffer for playback.
	 */
	function decodeArrayBuffer(arraybuffer) {
		// TODO: get sample and from outside
		var offlineAc = new OfflineAudioContext(5, 44100*40, 44100);
		offlineAc.decodeAudioData(arraybuffer, (function (soundData) {
			postDecodeCallbackFunction(soundData);
		}));

	//TOOD: catch error here
	}

	return that;
}
