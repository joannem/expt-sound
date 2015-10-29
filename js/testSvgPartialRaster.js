var DOMURL = window.URL || window.webkitURL || window;

var before;
var timeTakenForOriginal = 0;
var timeTakenForSlice = 0;
var timeTakenForCorner = 0;
var timeTakenForOriginalAgain = 0;

before = Date.now();
drawOriginal();
timeTakenForOriginal = Date.now() - before;

before = Date.now();
drawClippedSlice();
timeTakenForSlice = Date.now() - before;

before = Date.now();
drawClippedCorner();
timeTakenForCorner = Date.now() - before;

before = Date.now();
drawOriginalAgain();
timeTakenForOriginalAgain = Date.now() - before;


console.log("Original: " + timeTakenForOriginal);
console.log("Slice: " + timeTakenForSlice);
console.log("Corner: " + timeTakenForCorner);
console.log("Original again: " + timeTakenForOriginalAgain);

//--------- Original Image ---------//
function drawOriginal() {
	var ctx_original = document.getElementById('canvas-original').getContext('2d');

	var svg_obj_original = $('#svg').clone()[0];

	createRaster(ctx_original, svg_obj_original);
}

//--------- Original Again Image ---------//
function drawOriginalAgain() {
	var ctx_original = document.getElementById('canvas-original-again').getContext('2d');

	var svg_obj_original = $('#svg').clone()[0];

	svg_obj_original.setAttribute("width", 600);
	svg_obj_original.setAttribute("height", 300);
	svg_obj_original.setAttribute("viewBox", "0 0 300 150");

	createRaster(ctx_original, svg_obj_original);
}


//--------- Clipped Slice ---------//
function drawClippedSlice() {
	var ctx_clipping_slice = document.getElementById('canvas-clipping-slice').getContext('2d');

	var svg_obj_clipping_slice = $('#svg').clone()[0];

	var clipPathDefs = document.createElementNS("http://www.w3.org/2000/svg", "defs");

	var clipPath = document.createElementNS("http://www.w3.org/2000/svg", "clipPath");
	clipPath.setAttribute("id", "clip");

	var clipRect = document.createElementNS("http://www.w3.org/2000/svg", "rect");
	clipRect.setAttribute("x", 100);
	clipRect.setAttribute("y", 0);
	clipRect.setAttribute("width", 100);
	clipRect.setAttribute("height", 150);

	clipPath.appendChild(clipRect);
	clipPathDefs.appendChild(clipPath)
	svg_obj_clipping_slice.appendChild(clipPathDefs);

	svg_obj_clipping_slice.setAttribute("clip-path", "url(#clip)");

	createRaster(ctx_clipping_slice, svg_obj_clipping_slice);
}

//--------- Clipped Corner ---------//
function drawClippedCorner() {
	var ctx_clipping_corner = document.getElementById('canvas-clipping-corner').getContext('2d');

	var svg_obj_clipping_corner = $('#svg').clone()[0];

	var clipPathDefs = document.createElementNS("http://www.w3.org/2000/svg", "defs");

	var clipPath = document.createElementNS("http://www.w3.org/2000/svg", "clipPath");
	clipPath.setAttribute("id", "clip");

	var clipRect = document.createElementNS("http://www.w3.org/2000/svg", "rect");
	clipRect.setAttribute("x", 0);
	clipRect.setAttribute("y", 0);
	clipRect.setAttribute("width", 150);
	clipRect.setAttribute("height", 75);

	clipPath.appendChild(clipRect);
	clipPathDefs.appendChild(clipPath)
	svg_obj_clipping_corner.appendChild(clipPathDefs);

	svg_obj_clipping_corner.setAttribute("clip-path", "url(#clip)");

	createRaster(ctx_clipping_corner, svg_obj_clipping_corner);
}

function createRaster(canvasCtx, svgObj) {
	var svgXmlData = new XMLSerializer().serializeToString(svgObj);
	var svgData = new Blob([svgXmlData], {type: 'image/svg+xml;charset=utf-8'});
	var domUrl = window.URL || window.webkitURL || window;
	var svgUrl = domUrl.createObjectURL(svgData);


	var img = new Image();
	img.onload = function () {
		canvasCtx.drawImage(img, 0, 0);
		domUrl.revokeObjectURL(svgUrl);

	}

	img.src = svgUrl;
}
