/**
 * An editable SVG path object that is drawn by the mouse.
 * Requires: jQuery, StrokeGradient.js
 * Created by joanne on 17/12/15.
 */

function SvgPathObject(id, minX, minY, maxX, maxY, pathStr, strokeWidth) {
"use strict";
	var that = (this === window) ? {} : this;

	//var id = id;
	var selected = false;

	var pathSvgObj;
	var guideBoxSvgObj;
	var groupedSvgObj;

	//--- properties of stroke
	//var pathStr, strokeWidth;
	var strokeGradient;

	//--- for drawing guide box

	//--- for dragging
	var transformMatrix = [1, 0, 0, 1, 0, 0];
	var currX = 0;
	var currY = 0;

	//--- initialising objects
	strokeGradient = new StrokeGradient(id);
	createSvgPathObject(strokeWidth);
	createGuideBox();
	appendObjectsIntoGroup();
	groupedSvgObj.setAttributeNS(null, "transform", "matrix(" + transformMatrix.join(' ') + ")");

	//--- to select and move SVG path object
	groupedSvgObj.onmousedown = function(evt) {
		evt.stopPropagation();
		if (evt.which == gLeftMouseButton) {
			gSvgPathContextMenu.hideContextMenu();
			
			if (gCurrTool == "selectTool") {
				currX = evt.clientX;
				currY = evt.clientY;

				var moved = false;

				// TODO: move multiple objects at one time
				$(document).mousemove(function (evt) {
					event.stopPropagation();
					moveGroup(evt);
					moved = true;
				}).mouseup(function () {
					event.stopPropagation();
					$(this).off('mousemove');
					$(this).off('mouseup');
					
					if (!moved) {
						toggleSelection();
					} else {
						that.select();
					}
				});
			}
		}
	};

	//--- show context menu of SVG path object
	groupedSvgObj.addEventListener("contextmenu", function(e) {
		e.stopPropagation();
		e.preventDefault();

		if (gCurrTool == "selectTool" && selected) {
			gSvgPathContextMenu.showContextMenu(e, updateStrokeWidth, strokeWidth, strokeGradient);
		}

		$(this).off('contextmenu');
	});

	//----- private methods -----//

	//--- Called during initialisation only

	function createSvgPathObject(strokeWidth) {
		pathSvgObj = document.createElementNS("http://www.w3.org/2000/svg", 'path');
		pathSvgObj.setAttribute('d', pathStr);
		pathSvgObj.setAttribute('stroke', "url(#" + strokeGradient.getGradientId() + ")");
		pathSvgObj.setAttribute('stroke-width', strokeWidth + "px");
		pathSvgObj.setAttribute('stroke-linecap', "round");
		pathSvgObj.setAttribute('stroke-linejoin', "round");
		pathSvgObj.setAttribute('fill', "transparent");
	}

	function createGuideBox() {
		guideBoxSvgObj = document.createElementNS("http://www.w3.org/2000/svg", 'rect');
		guideBoxSvgObj.setAttribute('x', minX - 1);
		guideBoxSvgObj.setAttribute('y', minY - 1);
		guideBoxSvgObj.setAttribute('width', (maxX - minX) + 2);
		guideBoxSvgObj.setAttribute('height', (maxY - minY) + 2);
		guideBoxSvgObj.setAttribute('stroke', "green");
		guideBoxSvgObj.setAttribute('fill', "transparent");
		guideBoxSvgObj.setAttribute('stroke-width', 1);
		guideBoxSvgObj.setAttribute('stroke-opacity', 0.5);
	}

	function appendObjectsIntoGroup() {
		groupedSvgObj = document.createElementNS("http://www.w3.org/2000/svg", 'g');
		groupedSvgObj.appendChild(strokeGradient.getGradientDefObj());
		groupedSvgObj.appendChild(pathSvgObj);
		groupedSvgObj.appendChild(guideBoxSvgObj);
	}

	//--- Called after initialisation

	function toggleSelection() {
		if (selected) {
			that.deselect();
		} else {
			that.select();
		}
	}

	function moveGroup(evt) {
		transformMatrix[4] += evt.clientX - currX;
		transformMatrix[5] += evt.clientY - currY;

		groupedSvgObj.setAttributeNS(null, "transform", "matrix(" + transformMatrix.join(' ') + ")");

		currX = evt.clientX;
		currY = evt.clientY;
	}

	function updateStrokeWidth(newStrokeWidth) {
		strokeWidth = newStrokeWidth;
		pathSvgObj.setAttribute('stroke-width', strokeWidth + "px");

		that.updateGuideBox();
	}

	//----- privileged methods -----//

	/**
	 * Get the DOM of the gropued SVG object consisting of its path and guide box.
	 *
	 * @returns grouped SVG object containing the SVG path and SVG guide box
	 */
	this.getGroupedSvgObj = function() {
	  return groupedSvgObj;
	};

	this.drawPath = function(x, y) {
		pathStr += " " + x + "," + y;
		pathSvgObj.setAttribute('d', pathStr);

		minX = (minX < x) ? minX : x;
		maxX = (maxX > x) ? maxX : x;
		minY = (minY < y) ? minY : y;
		maxY = (maxY > y) ? maxY : y;
	};

	this.offsetPosition = function() {
		transformMatrix[4] += 20;
		transformMatrix[5] += 20;
		groupedSvgObj.setAttributeNS(null, "transform", "matrix(" + transformMatrix.join(' ') + ")");
	};

	/**
	 * Takes minimum and maximum coordinates of SVG path drawn, minX, minY, maxX and maxY,
	 * and adjusts the size of the SVG guide box accordingly.
	 *
	 * Call this everytime the path value is changed.
	 * TODO: make this a private, automatic function
	 */
	this.updateGuideBox = function() {
		var thickness = strokeWidth >> 1;
		guideBoxSvgObj.setAttribute('x', minX - thickness);
		guideBoxSvgObj.setAttribute('y', minY - thickness);
		guideBoxSvgObj.setAttribute('width', (maxX - minX) + (thickness << 1));
		guideBoxSvgObj.setAttribute('height', (maxY - minY) + (thickness << 1));
	};

	this.updateId = function (newId) {
		id = newId;
		strokeGradient.updateId(newId);
	};

	this.isSelected = function() {
	  return selected;
	};

	this.getGuideboxCoordinates = function() {
	  return  {
		  minX: minX, minY: minY,
		  maxX: maxX, maxY: maxY
	  };
	};

	this.getPathStr = function() {
		return pathStr;
	};

	this.getStrokeProperties = function() {
		// TODO: stroke gradient
	  return {
		  strokeGradient: strokeGradient.getGradientProperties(),
		  strokeWidth: strokeWidth
	  };
	};

	this.getStrokeGradient = function() {
		return strokeGradient;
	};


	this.select = function() {
		selected = true;
		guideBoxSvgObj.setAttribute('stroke-opacity', 1);
		gSelectedSvgPathId = id;
	};

	this.deselect = function() {
		selected = false;
		guideBoxSvgObj.setAttribute('stroke-opacity', 0);
	};

	return that;
}
