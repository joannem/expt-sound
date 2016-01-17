"use strict";

function SvgCanvas(canvasObj) {
	var that = (this === window) ? {} : this;

	that.canvasObj = canvasObj;
	that.svgPathObjs = [];
	that.noOfPathObjs = 0;

	that.canvasObj.attr('onmousedown', "canvas2.drawNewPath(evt, this)");

	return that;
}

SvgCanvas.prototype = {
	constructor: SvgCanvas,

	drawNewPath: function(evt, canvasDom) {
		++this.noOfPathObjs;
		var beginX = evt.offsetX;
		var beginY = evt.offsetY;

		var newPath = new SvgPath (this.noOfPathObjs, canvasDom, beginX, beginY);

		(this.canvasObj).mousemove(function(evt) {
			newPath.drawPath(evt.offsetX, evt.offsetY);

		}).mouseup(function(){
			$(this).off('mousemove');
			newPath.updateGuideBox();
		});

		//--- update list of objects in SvgCanvas
		this.svgPathObjs.push(newPath);
	},

	showBoxOfPath: function(pathId) {
		this.svgPathObjs[pathId - 1].showBox();
	},

	hideBoxOfPath: function(pathId) {
		this.svgPathObjs[pathId - 1].hideBox();
	},

	mousedownPath: function(pathId, evt) {
		(this.canvasObj).attr('onmousedown', null);

		currentX = evt.clientX;
		currentY = evt.clientY;

		// console.log(currentX, currentY);
		// console.log(this.svgPathObjs[pathId - 1]);
		this.svgPathObjs[pathId - 1].guideBoxSvgObj.setAttribute('onmousemove', "canvas2.moveGroup(" + pathId + ", evt)");
	},

	moveGroup: function(pathId, evt) {
		this.svgPathObjs[pathId - 1].moveGroup(evt);
	},

	mouseupPath: function(pathId) {
		this.svgPathObjs[pathId - 1].guideBoxSvgObj.setAttribute('onmousemove', null);
		(this.canvasObj).attr('onmousedown', "canvas2.drawNewPath(evt, this)");
	}

}

// TODO: if larger vector drawn over smaller vector, smaller vector cannot be selected anymore