var ctx = document.getElementById('canvas-1').getContext('2d');
var ctx_draw = document.getElementById('canvas-2').getContext('2d');

var svg_obj = $('#svg').clone()[0];

scaleSvg(svg_obj, 2, 0, 0);
createRaster(ctx, svg_obj);

$('#svg-draw').mousedown(function(e) {
	drawPixel(this, e.offsetX, e.offsetY);

	$('#svg-draw').mousemove(function(e) {
		drawPixel(this, e.offsetX, e.offsetY);

	});

}).mouseup(function(){
	$(this).off('mousemove');
	svg_draw_obj = $('#svg-draw').clone()[0];
	svg_draw_obj.setAttribute("style", "border-width: 0px;");

	scaleSvg(svg_draw_obj, 2, 0, 0);
	createRaster(ctx_draw, svg_draw_obj);

});

$('#svg-magnified-g')[0].setAttribute("transform", "scale(2)");

function scaleSvg(svgObj, scale, fromX, fromY) {
	svgObj.setAttribute("width", svgObj.width.baseVal.value * scale);
	svgObj.setAttribute("height", svgObj.height.baseVal.value * scale);

	var transformation = 
		"translate(" + fromX + " " + fromY + ") " + 
		"scale(" + scale + ") " + 
		"translate(" + fromX*-1 + " " + fromY*-1 + ")";

	svgObj.childNodes[1].setAttribute("transform", transformation);
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



function drawPixel(SVGRoot, x, y) {
	var pixel = document.createElementNS("http://www.w3.org/2000/svg", "rect");

	pixel.setAttribute('style', "fill: black");
	pixel.setAttribute('x', x - 1);
	pixel.setAttribute('y', y - 1);
	pixel.setAttribute('width', 2);
	pixel.setAttribute('height', 2);

	SVGRoot.childNodes[1].appendChild(pixel);
}


// Canvas to SVG
// code obtained from: http://svgopen.org/2009/papers/54-SVG_vs_Canvas_on_Trivial_Drawing_Application/
// function importCanvas(sourceCanvas, targetSVG) {

// 	// get base64 encoded png from Canvas
// 	var image = sourceCanvas.toDataURL("image/png");

// 	// Create new SVG Image element.  Must also be careful with the namespaces.
// 	var svgimg = document.createElementNS("http://www.w3.org/2000/svg", "image");
// 	svgimg.setAttributeNS("http://www.w3.org/1999/xlink", 'xlink:href', image);

// 	// Append image to SVG
// 	targetSVG.appendChild(svgimg);
// }