var canvasLeft = document.getElementById('waveform-canvas-left');
var canvasRight = document.getElementById('waveform-canvas-right');

var canvasLeftCtx = null;
var canvasRightCtx = null;

var canvasHeight = 0;
var windowWidth = 0;


function setupBlankWaveformCanvases() {
	canvasLeftCtx = $("#waveform-canvas-left").get()[0].getContext("2d");
	canvasRightCtx = $("#waveform-canvas-right").get()[0].getContext("2d");

	canvasHeight = 150;
	windowWidth = $(window).width();

	canvasLeft.setAttribute('width', windowWidth);
	canvasRight.setAttribute('width', windowWidth);
	canvasLeft.setAttribute('height', canvasHeight);
	canvasRight.setAttribute('height', canvasHeight);

	canvasLeftCtx.fillRect(0, 0, windowWidth, canvasHeight);
	canvasRightCtx.fillRect(0, 0, windowWidth, canvasHeight);

}

function drawWaveform(buffer) {
	var pcmL = buffer.getChannelData(0);
	var pcmR = buffer.getChannelData(1);
	var maxL = 0;
	var maxR = 0;

	var bufferLen = buffer.length;
	var jump = Math.floor(bufferLen / windowWidth);

	// note: nominal range of PCM data is [-1.0, 1.0]

	for (var i = 0; i < bufferLen; i = i + jump) {
		maxL = Math.abs(pcmL[i]) > maxL ? Math.abs(pcmL[i]) : maxL;
		maxR = Math.abs(pcmR[i]) > maxR ? Math.abs(pcmR[i]) : maxR;

	}

	var x = 0;
	var heightL = 0;
	var heightR = 0;

	canvasLeftCtx.fillStyle = '#0FF000';
	canvasRightCtx.fillStyle = '#0FF000';

	for(var i = 0; i < bufferLen; i = i + jump) {
		// -5 translation to leave a 2.5px gap between waveform and border of canvas
		heightL = pcmL[i] / maxL * ((canvasHeight / 2) - 5);
		heightR = pcmR[i] / maxR * ((canvasHeight / 2) - 5);

		if (heightL < 0) {
			canvasLeftCtx.fillRect(x, (canvasHeight / 2), 1, Math.abs(heightL));
		} else {
			canvasLeftCtx.fillRect(x, (canvasHeight / 2) - heightL, 1, Math.abs(heightL));
		}

		if (heightR < 0) {
			canvasRightCtx.fillRect(x, (canvasHeight / 2), 1, Math.abs(heightR));
		} else {
			canvasRightCtx.fillRect(x, (canvasHeight / 2) - heightR, 1, Math.abs(heightR));
		}

		x++;
	}
}