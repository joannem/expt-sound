function addNewPath(e, svgCanvas) {
	var path = document.createElementNS("http://www.w3.org/2000/svg", 'path');
	path.setAttribute('d', "M" + e.offsetX + "," + e.offsetY);
	path.setAttribute('fill', "none");
	path.setAttribute('stroke', "red");
	path.setAttribute('stroke-width', 3);
	path.setAttribute('onmouseover', "mouseoverCsvObject(this)");
 	path.setAttribute('onmouseout', "mouseoutCsvObject(this)");

	svgCanvas.childNodes[3].appendChild(path);

	$('#svg-canvas').mousemove(function(e) {
		drawPath(path, e.offsetX, e.offsetY);
	}).mouseup(function(){
		$(this).off('mousemove');
	});
}

function drawPath(path, x, y) {
	var newPath = path.getAttribute('d');
	newPath += " " + x + "," + y;
	path.setAttribute('d', newPath);
}

function mouseoverCsvObject(svgObject) {
	svgObject.style.opacity = 0.5;
}

function mouseoutCsvObject(svgObject) {
	svgObject.style.opacity = 1.0;
}

// http://www.petercollingridge.co.uk/interactive-svg-components/draggable-svg-element

var selectedElement = 0;
var svgObject;
var currentX = 0;
var currentY = 0;
var currentMatrix = [];

function testTranslation(evt, svgObj) {
	$('#svg-canvas').attr('onmousedown', null);

	selectedElement = evt.target;
	svgObject = svgObj;
	
	currentX = evt.clientX;
	currentY = evt.clientY;

	var transform_attr_str = svgObject.getAttribute("transform");
	// console.log(transform_attr_str);
	currentMatrix = transform_attr_str.substr(7, transform_attr_str.length - 8).split(' ');

	for(var i=0; i<currentMatrix.length; i++) {
		currentMatrix[i] = parseFloat(currentMatrix[i]);
	}

	svgObject.setAttributeNS(null, "onmousemove", "moveElement(evt)");
}

function showBox(boxSvgObjectId) {
	$("#" + boxSvgObjectId).attr("stroke-opacity", 0.5);
}

function hideBox(boxSvgObjectId) {
	$("#" + boxSvgObjectId).attr("stroke-opacity", 0);
}

function moveElement(evt){
	// console.log(evt.clientX);

	dx = evt.clientX - currentX;
	dy = evt.clientY - currentY;

	currentMatrix[4] += dx;
	currentMatrix[5] += dy;

	newMatrix = "matrix(" + currentMatrix.join(' ') + ")";

	svgObject.setAttributeNS(null, "transform", newMatrix);

	currentX = evt.clientX;
	currentY = evt.clientY;

	svgObject.setAttributeNS(null, "onmouseup", "deselectElement(evt)");
}

function deselectElement(evt, boxSvgObjectId){ 
	hideBox(boxSvgObjectId);

	// TODO: svgObject is undefined before moving obj
	if(svgObject != 0){
		svgObject.removeAttributeNS(null, "onmousemove");
		svgObject.removeAttributeNS(null, "onmouseup");
		svgObject = 0;
	}

	$('#svg-canvas').attr('onmousedown', "addNewPath(evt, this)");
}

var canvas2 = new SvgCanvas($('#svg-canvas-2'));
