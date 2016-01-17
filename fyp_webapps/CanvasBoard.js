/**
 * Script for CanvasBoard.html.
 * 
 * Created by joanne on 17/12/15.
 * Last modified on 15/01/15.
 */

var gDragNDropFileLoader = new DragNDropFileLoader($("#sound-space"), onFileDecode);
var gSvgCanvas = new SvgCanvas($("#svg-canvas"));
var gSoundVisualiser = new SoundVisualiser($("#waveform-canvas"), $("#spectrogram-canvas"), 746, 120, 1050);	// TODO: values are dummy values
var gSvgPathContextMenu = new SvgPathContextMenu();
var gCurrTool = "pencilTool";

var gAudioCtx = new (window.AudioContext || window.webkitAudioContext)(); 
var gSound = null;
var gOffset = 0;	//--- offset value of sound and slider in microsecs 

var gSelectedSvgPaths = [];
var gSelectedSvgPathId = 0;

var gLeftMouseButton = 1;


/** tools-panel **/

$("#pencil-tool-button").click(function() {
	event.stopPropagation();
	gCurrTool = "pencilTool";
	$("body").css('cursor', 'initial');
	$("#tool-used").text("Tool: Pencil");
});

$("#select-tool-button").click(function() {
	event.stopPropagation();
	gCurrTool = "selectTool";
	$("body").css('cursor', 'pointer');
	$("#tool-used").text("Tool: Select");
});

$("#duplicate-button").click(function() {
	event.stopPropagation();
	gSvgCanvas.duplicateSvgPaths();
});

$("#delete-button").click(function() {
	event.stopPropagation();
	gSvgCanvas.deleteSelectedSvgPaths();
});


/** context menu **/

$("#copy-button").click(function() {
	event.stopPropagation();
	gSvgCanvas.duplicateSvgPath(gSelectedSvgPathId);
});


/**  playback buttons **/

$('#play-pause-btn').click(function() {
	if (gSound == null) {
		console.log ("No sound data found.");
	} else if (!gSound.isPlaying()) {
		gSound.play(gOffset / 1000.0);
		// gslider.startSlider(gOffset);
		
		gSound.setIsPlaying(true);
		$('#play-pause-btn').text('pause'); 
	} else {
		gSound.pause();
		// TODO: find way to grab offset from both slider and sound (a more accurate one)
		// gOffset = gslider.pauseSlider();
		
		gSound.setIsPlaying(false);
		$('#play-pause-btn').text('play'); 
	}
});

$('#stop-btn').click(function() {
	if (gSound == null) {
		console.log("No sound data found.");
	} else {
		gSound.stopPlaying();
		// gslider.stopSlider();
		gOffset = 0;

		gSound.setIsPlaying(false);
		$('#play-pause-btn').text('play'); 
	}
});

/** call-back function once sound file is decoded **/
function onFileDecode(soundData) {
	gSound = new Sound(gAudioCtx, soundData , onSoundStop);
	gSoundVisualiser.drawWaveform(soundData);
	gSoundVisualiser.drawSpectrogram(soundData);
	
	// $('.waveform-slider').attr('max', soundData.duration * 1000);
}

/** call-back function once sound is stopped **/
function onSoundStop() {
	console.log("[test] sound stopped");
}
