/**
 * An group of SVG path objects positioned in integer intervals
 * above each other.
 * Requires: jQuery, StrokeGradient.js, SvgPathObject.js
 *
 * Created by joanne on 04/02/16
 */

function SvgHarmonic (id, pathId, minX, minY, maxX, maxY, strokeWidth) {
	"use strict";
	var that = (this === window) ? {} : this;

	var selected = false;

	var noOfHarmonics = 3;		// default
	var svgPathObjs = [];
	var harmonicGuideBoxSvgObj;
	var groupedSvgHarmonicObj;

	var baseFreq = 0;

	//--- for dragging
	var transformMatrix = [1, 0, 0, 1, 0, 0];
	var currX = 0;
	var currY = 0;

	//--- initialise
	createIndividualHarmonics();
	createGuideBox();
	appendObjectsIntoGroup();
	groupedSvgHarmonicObj.setAttributeNS(null, "transform", "matrix(" + transformMatrix.join(' ') + ")");

	//--- to select and move SVG harmonic object
	groupedSvgHarmonicObj.onmousedown = function(evt) {
		evt.stopPropagation();
		if (evt.which == gLeftMouseButton) {
			gSvgHarmonicContextMenu.hideHarmonicContextMenu();
			
			if (gCurrTool = "selectTool") {
				currX = evt.clientX;
				currY = evt.clientY;

				var moved = false;

				$(document).mousemove(function(evt) {
					evt.stopPropagation();
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
	
	//--- show context menu of SVG harmonic object
	groupedSvgHarmonicObj.addEventListener("contextmenu", function(evt) {
		evt.stopPropagation();
		evt.preventDefault();

		if (gCurrTool == "selectTool" && selected) {
			gSvgHarmonicContextMenu.showHarmonicContextMenu(evt, svgPathObjs, that.addHarmonic);
		}

		$(this).off('contextmenu');
	});

	
	function createIndividualHarmonics() {
		// TODO: find a way to calculate hz and map it to px
		for (var i = 0; i < noOfHarmonics; i++) {
			svgPathObjs[i] = new SvgPathObject(pathId + i, minX, minY, maxX, maxY, ("M " + minX + "," + minY), strokeWidth);
		}
		svgPathObjs[1].offsetPosition([1, 0, 0, 1, 0, -10]);
		svgPathObjs[2].offsetPosition([1, 0, 0, 1, 0, -20]);
	}

	function createGuideBox() {
		harmonicGuideBoxSvgObj = document.createElementNS("http://www.w3.org/2000/svg", 'rect');
		harmonicGuideBoxSvgObj.setAttribute('x', minX - 1);
		harmonicGuideBoxSvgObj.setAttribute('y', minY - 1);
		harmonicGuideBoxSvgObj.setAttribute('width', (maxX - minX) + 2);
		harmonicGuideBoxSvgObj.setAttribute('height', (maxY - minY) + 2);
		harmonicGuideBoxSvgObj.setAttribute('stroke', "#00FFFF");
		harmonicGuideBoxSvgObj.setAttribute('fill', "transparent");
		harmonicGuideBoxSvgObj.setAttribute('stroke-width', 1);
		harmonicGuideBoxSvgObj.setAttribute('stroke-opacity', 0.5);
	}

	function appendObjectsIntoGroup() {
		groupedSvgHarmonicObj = document.createElementNS("http://www.w3.org/2000/svg", 'g');
		groupedSvgHarmonicObj.appendChild(svgPathObjs[0].getGroupedSvgObj());
		groupedSvgHarmonicObj.appendChild(svgPathObjs[1].getGroupedSvgObj());
		groupedSvgHarmonicObj.appendChild(svgPathObjs[2].getGroupedSvgObj());
		groupedSvgHarmonicObj.appendChild(harmonicGuideBoxSvgObj);
	}

	function moveGroup(evt) {
		transformMatrix[4] += evt.clientX - currX;
		transformMatrix[5] += evt.clientY - currY;

		groupedSvgHarmonicObj.setAttributeNS(null, "transform", "matrix(" + transformMatrix.join(' ') + ")");

		currX = evt.clientX;
		currY = evt.clientY;
	}

	//--- Called after initialisation
	
	function toggleSelection() {
		if (selected) {
			that.deselect();
		} else {
			that.select();
		}
	}

	//----- privileged methods -----//
	
	/**
	 * Get the DOM of the gropued SVG object consisting of 
	 * its path and guide box.
	 *
	 * @returns grouped SVG object containing the SVG path and SVG guide box
	 */
	this.getGroupedSvgHarmonicObj = function() {
	  return groupedSvgHarmonicObj;
	};

	this.drawHarmonics = function(x, y) {
		svgPathObjs[0].drawPath(x, y);
		svgPathObjs[1].drawPath(x, y);
		svgPathObjs[2].drawPath(x, y);
	};

	/**
	 * Takes minimum and maximum coordinates of the first and last SVG 
	 * path drawn, minX, minY, maxX and maxY, and adjusts the size of 
	 * the SVG guide box accordingly.
	 *
	 * Call this everytime the path value is changed.
	 * TODO: make this a private, automatic function
	 */
	this.updateGuideBox = function() {
		var thickness = strokeWidth >> 1;
		var coor = svgPathObjs[0].getGuideboxCoordinates();
		
		harmonicGuideBoxSvgObj.setAttribute('x', coor.minX - thickness);
		harmonicGuideBoxSvgObj.setAttribute('y', coor.minY - (noOfHarmonics-1)*10 - thickness);
		harmonicGuideBoxSvgObj.setAttribute('width', (coor.maxX - coor.minX) + (thickness << 1));
		harmonicGuideBoxSvgObj.setAttribute('height', (coor.maxY - coor.minY + (noOfHarmonics-1)*10) + (thickness << 1));
	};

	this.select = function() {
		selected = true;
		harmonicGuideBoxSvgObj.setAttribute('stroke-opacity', 1);
		gSelectedSvgHarmonicId = id;
	};

	this.deselect = function() {
		selected = false;
		harmonicGuideBoxSvgObj.setAttribute('stroke-opacity', 0);
	};

	this.addHarmonic = function() {
		noOfHarmonics++;
		svgPathObjs[noOfHarmonics-1] = new SvgPathObject(gNoOfSvgPathObjs, minX, minY + 20, maxX, maxY + 20, (svgPathObjs[0].getPathStr()), strokeWidth);
		groupedSvgHarmonicObj.insertBefore(svgPathObjs[noOfHarmonics-1].getGroupedSvgObj(), svgPathObjs[noOfHarmonics-2].getGroupedSvgObj().nextSibling);
		svgPathObjs[noOfHarmonics-1].offsetPosition([1, 0, 0, 1, 0, -10 * (noOfHarmonics-1)]);
		
		gNoOfSvgPathObjs++;

		that.updateGuideBox();
	};

	// TOOD: hide harmonic ?
	
	// delete harmonic
	this.deleteHarmonic = function() {
		noOfHarmonics--;
	};

}
