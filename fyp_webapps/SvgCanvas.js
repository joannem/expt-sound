/**
 * A Canvas to draw SvgObjects on.
 * Requires: jQuery, SvgPathObject.js, StrokeGradient.js
 *
 * Created by joanne on 19/12/15.
 */

function SvgCanvas(canvasObj) {
	"use strict";
	
	var that = (this === window) ? {} : this;

	var svgPathObjs = [];
	var svgHarmonicObjs = [];
	var noOfSvgPathObjs = 0;
	var noOfSvgHarmonicObjs = 0;

	canvasObj.mousedown(function(evt) {
		evt.stopPropagation();
		that.deselectAllPaths();
		if (evt.which == gLeftMouseButton) {
			gSvgPathContextMenu.hideContextMenu();

			if (gCurrTool == "pencilTool") {
				drawNewPath(evt);
			} 

			if (gCurrTool == "harmonicPencilTool") {
				drawNewHarmonic(evt);
			}
		}
	});

	//----- private methods -----//
	function drawNewPath(evt) {
		var newSvgPathObj = new SvgPathObject(noOfSvgPathObjs,
			evt.offsetX, evt.offsetY, evt.offsetX, evt.offsetY,
			("M " + evt.offsetX + "," + evt.offsetY), "3");

		canvasObj.mousemove(function(evt) {
			event.stopPropagation();
			newSvgPathObj.drawPath(evt.offsetX, evt.offsetY);

			//--- insert group onto canvas
			canvasObj[0].appendChild(newSvgPathObj.getGroupedSvgObj());

		}).mouseup(function(){
			event.stopPropagation();
			$(this).off('mousemove');
			newSvgPathObj.updateGuideBox();

			//--- update list of objects in SvgCanvas
			noOfSvgPathObjs++;
			svgPathObjs.push(newSvgPathObj);

			$(this).off('mouseup');
		});
	}

	function drawNewHarmonic(evt) {
		var newSvgHarmonicObj = new SvgHarmonic(noOfSvgHarmonicObjs, noOfSvgPathObjs, 
			evt.offsetX, evt.offsetY, evt.offsetX, evt.offsetY, "3");
		
		canvasObj.mousemove(function(evt) {
			event.stopPropagation();
			newSvgHarmonicObj.drawHarmonics(evt.offsetX, evt.offsetY);

			//--- insert group onto canvas
			canvasObj[0].appendChild(newSvgHarmonicObj.getGroupedSvgHarmonicObj());

		}).mouseup(function(){
			event.stopPropagation();
			$(this).off('mousemove');
			newSvgHarmonicObj.updateGuideBox();

			//--- update list of objects in SvgCanvas
			noOfSvgPathObjs += 3;
			noOfSvgHarmonicObjs++;
			svgHarmonicObjs.push(newSvgHarmonicObj);

			$(this).off('mouseup');
		});
	}

	//----- privileged methods -----//

	/**
	 * Duplicates all the selected SVG paths.
	 */
	this.duplicateSvgPaths = function() {
		var lengthBeforeDuplication = svgPathObjs.length;

		// TODO: what if nothing is selected (still have to iterate through the list)
		for (var i = 0; i < lengthBeforeDuplication; ++i) {
			//--- delete from canvas and array
			if (svgPathObjs[i].isSelected()) {
				this.duplicateSvgPath(i);
			}
		}
	};

	/**
	 * Duplicates the path, color and width of an SVG path,
	 * then pastes the path on the original path's position before it was moved.
	 *
	 * @param id[in]    ID of the SVG path to be duplicated.
	 */
	this.duplicateSvgPath = function(id) {
		//-- grab properties of original SVG path
		var guideBoxCoordinates = svgPathObjs[id].getGuideboxCoordinates();
		var pathStr = svgPathObjs[id].getPathStr();
		var strokeProperties = svgPathObjs[id].getStrokeProperties();

		//--- create new SVG path object based off properties from the original path
		var newSvgPathObj = new SvgPathObject(noOfSvgPathObjs,
			guideBoxCoordinates.minX, guideBoxCoordinates.minY,
			guideBoxCoordinates.maxX, guideBoxCoordinates.maxY,
			pathStr, strokeProperties.strokeWidth);
		//TODO: update gradient values, or find a better way to clone the SVG path

		//--- insert group onto canvas
		newSvgPathObj.offsetPosition();
		newSvgPathObj.updateGuideBox();
		canvasObj[0].appendChild(newSvgPathObj.getGroupedSvgObj());

		//--- update list of objects in SvgCanvas
		noOfSvgPathObjs++;
		svgPathObjs.push(newSvgPathObj);
	};

	/**
	 * Deletes all SVG paths that are selected.
	 */
	this.deleteSelectedSvgPaths = function() {
		var currId = 0;

		// TODO: what if nothing is selected (still have to iterate through the list)
		while(currId < svgPathObjs.length) {
			//--- delete from canvas and array
			if (svgPathObjs[currId].isSelected()) {
				canvasObj[0].removeChild(svgPathObjs[currId].getGroupedSvgObj());
				svgPathObjs.splice(currId, 1);

			} else {
				//-- update ID value
				svgPathObjs[currId].updateId(currId);
				currId++;
			}
		}
	};

	this.deselectAllPaths = function() {
		for (var i = 0; i < svgPathObjs.length; i++) {
			svgPathObjs[i].deselect();
		}
	};

	return that;
}
