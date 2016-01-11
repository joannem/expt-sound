"use strict";

function SvgPath(pathId, canvasDom, beginX, beginY) {
	//--- verify that 'this' does not reference document's window
	var that = (this === window) ? {} : this;

	//--- create SVG path object
	that.pathSvgObj = document.createElementNS("http://www.w3.org/2000/svg", 'path');
	that.pathSvgObj.setAttribute('d', "M " + beginX + "," + beginY);
	that.pathSvgObj.setAttribute('fill', "none");
	that.pathSvgObj.setAttribute('stroke', "url(#Gradient-2)");
	that.pathSvgObj.setAttribute('stroke-width', 3);

	//--- guide box attributes
	that.minX = beginX;
	that.maxX = beginX;
	that.minY = beginY;
	that.maxY = beginY;

 	//--- create rect object (guide box)
 	that.guideBoxSvgObj = document.createElementNS("http://www.w3.org/2000/svg", 'rect'); 	
 	that.guideBoxSvgObj.setAttribute('x', 0);
 	that.guideBoxSvgObj.setAttribute('y', 0);
 	that.guideBoxSvgObj.setAttribute('width', 0);
 	that.guideBoxSvgObj.setAttribute('height', 0);
 	that.guideBoxSvgObj.setAttribute('stroke', "green");
 	that.guideBoxSvgObj.setAttribute('fill', "transparent");
 	that.guideBoxSvgObj.setAttribute('stroke-width', 1)
 	that.guideBoxSvgObj.setAttribute('stroke-opacity', 0);

 	//--- group path and rect together
 	that.groupSvgObj = document.createElementNS("http://www.w3.org/2000/svg", 'g');
 	that.groupSvgObj.setAttribute('class', "svg-editable-obj");
 	that.groupSvgObj.setAttribute('id', "svg-editable-obj-" + pathId);
 	that.groupSvgObj.setAttribute('onmouseover', "canvas2.showBoxOfPath(" + pathId + ")");
 	that.groupSvgObj.setAttribute('onmouseout', "canvas2.hideBoxOfPath(" + pathId + ")");
 	that.groupSvgObj.setAttribute('onmousedown', "canvas2.mousedownPath(" + pathId + ", evt)");
 	that.groupSvgObj.setAttribute('onmouseup', "canvas2.mouseupPath(" + pathId + ")");
 	that.groupSvgObj.appendChild(that.pathSvgObj);
 	that.groupSvgObj.appendChild(that.guideBoxSvgObj);

 	//--- transformations
	that.transformMatrix = [1, 0, 0, 1, 0, 0];
	
	//--- create event listeners and attributes on group to move it
 	that.groupSvgObj.setAttribute('transform', "matrix(1 0 0 1 0 0)");

 	//--- insert group onto canvas
 	canvasDom.childNodes[1].appendChild(that.groupSvgObj);
	
	return that;
}

SvgPath.prototype = {
	constructor: SvgPath,

	drawPath: function (x, y) {
		var newPathStr = this.pathSvgObj.getAttribute('d');
		newPathStr += " " + x + "," + y;
		this.pathSvgObj.setAttribute('d', newPathStr);

		this.minX = (this.minX < x) ? this.minX : x;
		this.maxX = (this.maxX > x) ? this.maxX : x;
		this.minY = (this.minY < y) ? this.minY : y;
		this.maxY = (this.maxY > y) ? this.maxY : y;
	},

	showBox: function() {
		this.guideBoxSvgObj.setAttribute('stroke-opacity', 0.5);
	},

	hideBox: function() {
		this.guideBoxSvgObj.setAttribute('stroke-opacity', 0);
	},

	updateGuideBox: function() {
		this.guideBoxSvgObj.setAttribute('x', this.minX - 1);
		this.guideBoxSvgObj.setAttribute('y', this.minY - 1);
		this.guideBoxSvgObj.setAttribute('width', (this.maxX - this.minX) + 2);
		this.guideBoxSvgObj.setAttribute('height', (this.maxY - this.minY) + 2);
	},

	moveGroup: function(evt) {
		var dx = evt.clientX - currentX;
		var dy = evt.clientY - currentY;

		// console.log(dx, dy);

		this.transformMatrix[4] += dx;
		this.transformMatrix[5] += dy;

		var newMatrixStr = "matrix(" + this.transformMatrix.join(' ') + ")";

		// console.log(newMatrixStr);

		this.groupSvgObj.setAttributeNS(null, "transform", newMatrixStr);

		currentX = evt.clientX;
		currentY = evt.clientY;

	}
}