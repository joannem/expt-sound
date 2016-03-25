/**
 * Script for CanvasBoard.html.
 * 
 * Created by joanne on 17/12/15.
 */

var gDragNDropFileLoader = new DragNDropFileLoader($("#sound-space"), onFileDecode);
var gSvgCanvas = new SvgCanvas($("#svg-canvas"));
var gSoundVisualiser = new SoundVisualiser($("#waveform-canvas"), $("#spsi-waveform-canvas"), $("#spectrogram-canvas"), $('#hidden-spectrogram-canvas'), 513, 150, 1050);	// TODO: values are dummy values

// var gSvgPathContextMenu = new SvgPathContextMenu();
// var gSvgHarmonicContextMenu = new SvgHarmonicContextMenu();
var gContextMenu = new ContextMenu();

var gWaveSpect = new WaveSpect(10, 0.5);
var gAudioCtx = new (window.AudioContext || window.webkitAudioContext)(); 
var gSound = null;
var gReconSound = null;
var gOffset = 0;	//--- offset value of sound and slider in microsecs 

var gCurrTool = "pencilTool";
var gSelectedSvgPathId = 0;
var gSelectedSvgHarmonicId = 0;

var gNoOfSvgPathObjs = 0;
var gNoOfSvgHarmonicObjs = 0;

var gLeftMouseButton = 1;


/** tools-panel **/

$("#pencil-tool-button").click(function() {
	event.stopPropagation();
	gCurrTool = "pencilTool";
	$("body").css('cursor', 'initial');
	$("#tool-used").text("Tool: Pencil");
});

$("#harmonic-pencil-tool-button").click(function() {
	event.stopPropagation();
	gCurrTool = "harmonicPencilTool";
	$("body").css('cursor', 'initial');
	$("#tool-used").text("Tool: Harmonic Pencil");
});

$("#select-tool-button").click(function() {
	event.stopPropagation();
	gCurrTool = "selectTool";
	$("body").css('cursor', 'pointer');
	$("#tool-used").text("Tool: Select");
});

$("#zoom-tool-button").click(function() {
	event.stopPropagation();
	gCurrTool = "zoomDragTool";
	$("#tool-used").text("Tool: Zoom / Drag");
});

$("#duplicate-button").click(function() {
	event.stopPropagation();
	gSvgCanvas.duplicateSvgPaths();
});

$("#delete-button").click(function() {
	event.stopPropagation();
	gSvgCanvas.deleteSelectedSvgPaths();
});

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
	var originalText = $(this).text();
	$(this).text(originalText == 'Show canvas' ? 'Hide canvas' : 'Show canvas');
});

$('#raster-display-button').click(function(){
	event.stopPropagation();
	$("#spectrogram-canvas").toggle();
	var originalText = $(this).text();
	$(this).text(originalText == 'Show rasterised canvas' ? 'Hide rasterised canvas' : 'Show rasterised canvas');
});

$("#reset-zoom-button").click(function() {
	event.stopPropagation();
	gSvgCanvas.resetZoom();
});

$('#recon-sound-button').click(function() {
	event.stopPropagation();
	
	//--- clear all the guideboxes
	gSvgCanvas.deselectAllPaths();

	// TODO: temporary fix
	//--- reset zoom
	gSvgCanvas.resetZoom();

	//--- create spectrogram matrix from SVG canvas
	var extractedSpectrogram = [];
	gSoundVisualiser.spectrogramFromSvg($('#svg-canvas'), extractedSpectrogram);

	//--- wait for rasterised image to finish loading
	$('#hidden-spectrogram-canvas').on("imgLoaded", function() {
		
		//--- perform SPSI to reconstruct PCM data from spectrogram
		var reconPcm = gWaveSpect.spectToWave(extractedSpectrogram);
			
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
	// TODO: change scale values again after uploading new sound file 
	// gSvgCanvas.drawTimeTicks(soundLenInSecs)
	gSoundVisualiser.drawWaveform(monoSoundData.monoPcmData, monoSoundData.pcmDataLen, monoSoundData.maxAmp);
	gSoundVisualiser.drawSpectrogram(monoSoundData.monoPcmData, monoSoundData.pcmDataLen);
	
	// $('.waveform-slider').attr('max', soundData.duration * 1000);
}

/** call-back function once sound is stopped **/
function onSoundStop() {
	$('#spsi-play-pause-btn').text('Play'); 
	console.log("[test] sound stopped");
}
