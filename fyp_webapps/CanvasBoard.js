/**
 * Script for CanvasBoard.html.
 * 
 * Created by joanne on 17/12/15.
 * Last modified on 15/01/15.
 */

var gDragNDropFileLoader = new DragNDropFileLoader($("#sound-space"), onFileDecode);
var gSvgCanvas = new SvgCanvas($("#svg-canvas"));
var gSoundVisualiser = new SoundVisualiser($("#waveform-canvas"), $("#spsi-waveform-canvas"), $("#spectrogram-canvas"), $('#hidden-spectrogram-canvas'), 513, 150, 1050);	// TODO: values are dummy values
var gSvgPathContextMenu = new SvgPathContextMenu();

var gWaveSpect = new WaveSpect(10, 0.5);
var gAudioCtx = new (window.AudioContext || window.webkitAudioContext)(); 
var gSound = null;
var gReconSound = null;
var gOffset = 0;	//--- offset value of sound and slider in microsecs 

var gCurrTool = "pencilTool";
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
	event.stopPropagation();
	if (gSound == null) {
		console.log ("No sound data found.");
	} else if (!gSound.isPlaying()) {
		gSound.play(gOffset / 1000.0);
		gSound.setIsPlaying(true);
		$('#play-pause-btn').text('Pause'); 
	} else {
		gSound.pause();
		gSound.setIsPlaying(false);
		$('#play-pause-btn').text('play'); 
	}
});

$('#stop-btn').click(function() {
	event.stopPropagation();
	if (gSound == null) {
		console.log("No sound data found.");
	} else {
		gSound.stopPlaying();
		gOffset = 0;

		gSound.setIsPlaying(false);
		$('#play-pause-btn').text('Play'); 
	}
});

$('#spsi-play-pause-btn').click(function() {
	event.stopPropagation();
	if (gReconSound == null) {
		console.log ("No sound data found.");
	} else if (!gReconSound.isPlaying()) {
		gReconSound.play(gOffset / 1000.0);
		gReconSound.setIsPlaying(true);
		$('#spsi-play-pause-btn').text('Pause'); 
	} else {
		gReconSound.pause();
		gReconSound.setIsPlaying(false);
		$('#spsi-play-pause-btn').text('Play'); 
	}
});

$('#spsi-stop-btn').click(function() {
	event.stopPropagation();
	if (gReconSound == null) {
		console.log("No sound data found.");
	} else {
		gReconSound.stopPlaying();
		gOffset = 0;

		gReconSound.setIsPlaying(false);
		$('#spspi-play-pause-btn').text('play'); 
	}
});


/** right sidebar **/

$('#svg-display-button').click(function(){
	event.stopPropagation();
	$("#svg-canvas").toggle();
});

$('#recon-sound-button').click(function() {
	event.stopPropagation();
	
	//--- clear all the guideboxes
	gSvgCanvas.deselectAllPaths();

	//--- create spectrogram matrix from SVG canvas
	var extractedSpectrogram = [];
	gSoundVisualiser.spectrogramFromSvg($('#svg-canvas'), extractedSpectrogram);

	//--- wait for rasterised image to finish loading
	$('#hidden-spectrogram-canvas').on("imgLoaded", function() {
		
		//--- perform SPSI to reconstruct PCM data from spectrogram
		var reconPcm = gWaveSpect.spectToWave(extractedSpectrogram);
		// console.log(reconPcm);
			
		//--- replace gReconSound with new sound
		var reconSoundBuffer = gAudioCtx.createBuffer(1, reconPcm.length, 44100);
		var nowBuffering = reconSoundBuffer.getChannelData(0);
		for(var i = 0; i < reconPcm.length; i++){
			nowBuffering[i] = reconPcm[i];
		}

		gReconSound = new Sound (gAudioCtx, reconSoundBuffer, onSoundStop);
		
		//--- draw waveform of new sound
		var monoSoundData = gReconSound.getMonoSoundData();
		gSoundVisualiser.drawReconWaveform(monoSoundData.monoPcmData, monoSoundData.pcmDataLen, monoSoundData.maxAmp);

	});
});

/** call-back function once sound file is decoded **/
function onFileDecode(soundData) {
	gSound = new Sound(gAudioCtx, soundData , onSoundStop);

	var monoSoundData = gSound.getMonoSoundData();

	gSoundVisualiser.drawWaveform(monoSoundData.monoPcmData, monoSoundData.pcmDataLen, monoSoundData.maxAmp);
	gSoundVisualiser.drawSpectrogram(monoSoundData.monoPcmData, monoSoundData.pcmDataLen);
	
	// $('.waveform-slider').attr('max', soundData.duration * 1000);
}

/** call-back function once sound is stopped **/
function onSoundStop() {
	console.log("[test] sound stopped");
}
