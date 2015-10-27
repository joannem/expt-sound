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

	var data_original = new XMLSerializer().serializeToString(svg_obj_original);
	var svg_original = new Blob([data_original], {type: 'image/svg+xml;charset=utf-8'});
	var url_original = DOMURL.createObjectURL(svg_original);

	var img_original = new Image();

	img_original.onload = function () {
		ctx_original.drawImage(img_original, 0, 0);
		DOMURL.revokeObjectURL(url_original);
	}

	img_original.src = url_original;
}

//--------- Original Again Image ---------//
function drawOriginalAgain() {
	var ctx_original = document.getElementById('canvas-original-again').getContext('2d');

	var svg_obj_original = $('#svg').clone()[0];

	svg_obj_original.setAttribute("width", 600);
	svg_obj_original.setAttribute("height", 300);
	svg_obj_original.setAttribute("viewBox", "0 0 300 150");

	var data_original = new XMLSerializer().serializeToString(svg_obj_original);
	var svg_original = new Blob([data_original], {type: 'image/svg+xml;charset=utf-8'});
	var url_original = DOMURL.createObjectURL(svg_original);

	var img_original = new Image();

	img_original.onload = function () {
		ctx_original.drawImage(img_original, 0, 0);
		DOMURL.revokeObjectURL(url_original);
	}

	img_original.src = url_original;
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

	var data_clipping_slice = new XMLSerializer().serializeToString(svg_obj_clipping_slice);
	var svg_clipping_slice = new Blob([data_clipping_slice], {type: 'image/svg+xml;charset=utf-8'});
	var url_clipping_slice = DOMURL.createObjectURL(svg_clipping_slice);

	var img_clipping_slice = new Image();

	img_clipping_slice.onload = function () {
		ctx_clipping_slice.drawImage(img_clipping_slice, 0, 0);
		DOMURL.revokeObjectURL(url_clipping_slice);
	}

	img_clipping_slice.src = url_clipping_slice;
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

	var data_clipping_corner = new XMLSerializer().serializeToString(svg_obj_clipping_corner);
	var svg_clipping_corner = new Blob([data_clipping_corner], {type: 'image/svg+xml;charset=utf-8'});
	var url_clipping_corner = DOMURL.createObjectURL(svg_clipping_corner);

	var img_clipping_corner = new Image();

	img_clipping_corner.onload = function () {
		ctx_clipping_corner.drawImage(img_clipping_corner, 0, 0);
		DOMURL.revokeObjectURL(url_clipping_corner);
	}

	img_clipping_corner.src = url_clipping_corner;
}
