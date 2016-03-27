/**
 * An editable SVG path object that is drawn by the mouse.
 * Requires: jQuery, StrokeGradient.js
 * 
 * Created by joanne on 17/12/15.
 */

function SvgPathObject(id, minX, minY, maxX, maxY, pathStr) {
	"use strict";
	var that = (this === window) ? {} : this;

	var selected = false;

	var pathSvgObj;
	var guideBoxSvgObj;
	var groupedSvgObj;

	//--- properties of stroke
	var strokeOpacity = 1.0;
	var strokeWidth = 3;
	var isGradient = true;
	var strokeGradient = new StrokeGradient(id, strokeOpacity);

	//--- for drawing guide box

	//--- for dragging
	var transformMatrix = [1, 0, 0, 1, 0, 0];
	var currX = 0;
	var currY = 0;

	//--- initialising objects
	createSvgPathObject(strokeWidth);
	createGuideBox();
	appendObjectsIntoGroup();
	groupedSvgObj.setAttributeNS(null, "transform", "matrix(" + transformMatrix.join(' ') + ")");

	//--- to select and move SVG path object
	groupedSvgObj.onmousedown = function(evt) {
		if (gCurrTool == "selectTool") {
			evt.stopPropagation();
			
			if (evt.which == gLeftMouseButton) {
				gContextMenu.hideContextMenu();
			
				var moved = false;
				currX = evt.clientX;
				currY = evt.clientY;

				$(document).mousemove(function(evt) {
					event.stopPropagation();
					moveGroup(evt);
					moved = true;
				}).mouseup(function() {
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
	groupedSvgObj.addEventListener("contextmenu", function(evt) {
		evt.stopPropagation();
		evt.preventDefault();

		if (gCurrTool == "selectTool" && selected) {
			gContextMenu.showContextMenus(evt.pageY, evt.pageX, false, that);
		}

		$(this).off('contextmenu');
	});

	//----- private methods -----//

	//--- Called during initialisation only

	function createSvgPathObject(strokeWidth) {
		pathSvgObj = gSvgCreator.createSvgPath(pathStr, "url(#" + strokeGradient.getGradientId() + ")", strokeWidth);
	}

	function createGuideBox() {
		guideBoxSvgObj = gSvgCreator.createTransparentSvgRect(minX - 1, minY - 1, (maxX - minX) + 2, (maxY - minY) + 2, "green", 1);
		guideBoxSvgObj.setAttribute('stroke-opacity', 0);
	}

	function appendObjectsIntoGroup() {
		groupedSvgObj = gSvgCreator.createSvgGroup();
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

	function updateStrokeOpacity (newStrokeOpacity) {
		strokeOpacity = newStrokeOpacity;
		pathSvgObj.setAttribute('stroke-opacity', strokeOpacity);
		strokeGradient.setOpacity(strokeOpacity);
	}
	
	function updateStrokeFillType(newIsGradient) {
		isGradient = newIsGradient;
		if (isGradient) {
			pathSvgObj.setAttribute('stroke', "url(#" + strokeGradient.getGradientId() + ")");
		} else {
			pathSvgObj.setAttribute('stroke', "url(#svg-pattern)");
		}
	}

	function updateStrokeFillGradient(color, newOffset) {
		strokeGradient.setOffset(color, newOffset);
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

	this.offsetPosition = function(newTransformMatrix) {
		transformMatrix = newTransformMatrix;
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

	this.updateId = function(newId) {
		id = newId;
		strokeGradient.updateId(newId);
	};

	this.updateStrokeProperties = function(property, value) {
		switch(property) {
			case "strokeWidth":
				updateStrokeWidth(value);
				break;
			case "opacity":
				updateStrokeOpacity(value);
				break;
			case "strokeFillType":
				updateStrokeFillType(value);
				break;
			case "strokeFillGradient":
				updateStrokeFillGradient(value.color, value.newOffset);
				break;
			default:
				console.log("Error: unable to determine stroke property");
		}
	};

	this.isSelected = function() {
		return selected;
	};

	this.getGuideboxCoordinates = function() {
		return {
			minX: minX, minY: minY,
			maxX: maxX, maxY: maxY
		};
	};

	this.getPathStr = function() {
		return pathStr;
	};

	this.getStrokeProperties = function() {
	  return {
		  strokeWidth: strokeWidth,
		  strokeOpacity: strokeOpacity,
		  isGradient: isGradient,
		  strokeGradient: strokeGradient.getGradientProperties(),
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
