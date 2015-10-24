var ctx = document.getElementById('canvas-1').getContext('2d');
var ctx_draw = document.getElementById('canvas-2').getContext('2d');

var svg_obj = $('#svg').clone()[0];
svg_obj.setAttribute("width", 600);
svg_obj.setAttribute("height", 300);
svg_obj.setAttribute("viewBox", "0 0 300 150");

var data = new XMLSerializer().serializeToString(svg_obj);
var svg = new Blob([data], {type: 'image/svg+xml;charset=utf-8'});
var DOMURL = window.URL || window.webkitURL || window;
var url = DOMURL.createObjectURL(svg);

var img = new Image();
img.onload = function () {
	ctx.drawImage(img, 0, 0);
	DOMURL.revokeObjectURL(url);
}

img.src = url;

$('#svg-draw').mousedown(function(e) {
	drawPixel(this, e.offsetX, e.offsetY);

	$('#svg-draw').mousemove(function(e) {
		drawPixel(this, e.offsetX, e.offsetY);

	});

}).mouseup(function(){
    $(this).off('mousemove');
    svg_draw_obj = $('#svg-draw').clone()[0];
    svg_draw_obj.setAttribute("style", "border-width: 0px;");
    svg_draw_obj.setAttribute("width", 600);
	svg_draw_obj.setAttribute("height", 300);
	svg_draw_obj.setAttribute("viewBox", "0 0 300 150");

	var data_draw = new XMLSerializer().serializeToString(svg_draw_obj);
	var svg_draw = new Blob([data_draw], {type: 'image/svg+xml;charset=utf-8'});;	
	var DOMURL_draw = window.URL || window.webkitURL || window;
	var url_draw = DOMURL.createObjectURL(svg_draw);

	var img_draw = new Image();
	img_draw.onload = function () {
		ctx_draw.drawImage(img_draw, 0, 0);
		DOMURL_draw.revokeObjectURL(url_draw);
	}

	img_draw.src = url_draw;

});



function drawPixel(SVGRoot, x, y) {
	var pixel = document.createElementNS("http://www.w3.org/2000/svg", "rect");

	pixel.setAttribute('style', "fill: black");
	pixel.setAttribute('x', x - 1);
	pixel.setAttribute('y', y - 1);
	pixel.setAttribute('width', 2);
	pixel.setAttribute('height', 2);

	SVGRoot.appendChild(pixel);
}