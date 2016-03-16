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

	var zoomVal = 1.0;
	var zoomDx = 0; var zoomDy = 0;
	var spectTransformMatrix = [1, 0, 0, 1, 0, 0];
	// var freqTicksTransformMatrix = [1, 0, 0, 1, 0, 0];
	// var timeTicksTransformMatrix = [1, 0, 0, 1, 0, 0];

	var svgLinkNs = "http://www.w3.org/2000/svg";

	drawFreqTicks();
	drawTimeTicks();
	
	$("#canvas-space").mousedown(function(evt) {
		evt.stopPropagation();
		that.deselectAllPaths();

		if (evt.which == gLeftMouseButton) {
			gSvgPathContextMenu.hideContextMenu();

			if (gCurrTool == "pencilTool") {
				drawNewPath(evt.offsetX, evt.offsetY);
			} else if (gCurrTool == "harmonicPencilTool") {
				drawNewHarmonic(evt.offsetX, evt.offsetY);
			} else {
				dragSpectrograms(evt.clientX, evt.clientY);
			}
		}
	});

	$("#canvas-space").bind('mousewheel', function(evt) {
		evt.stopPropagation();

		zoomSpectrograms(evt.originalEvent.wheelDelta, evt.offsetX, evt.offsetY);
		return false;	// prevent page fom scrolling
	});


	//----- private methods called during initialisation -----//
	
	function drawFreqTicks() {

		//--- calculate spacing between ticks relative to size of canvas
		
		//--- min tick spacing: 1.25px; max freq fixed at 22100Hz
		var pxPerHz = (canvasObj.height() / 22100.0);
		var minHzPerTick = 1.25 / pxPerHz;
		
		var hzPerTick = 10;	// if each tick is min 2.5px

		if (minHzPerTick <= 10) {
			hzPerTick = 10;
		} else if (minHzPerTick <= 20) {
			hzPerTick = 20;
		} else if (minHzPerTick <= 50) {
			hzPerTick = 50;
		} else if (minHzPerTick <= 100) {
			hzPerTick = 100;
		} else if (minHzPerTick <= 200) {
			hzPerTick = 200;
		} else {
			console.log("Not enough screen resolution");
			return;
		}

		var pxPerTick = pxPerHz * hzPerTick;

		
		//--- draw the ticks
		
		var tickNo = 0;
		for (var y = 0; y <= canvasObj.height(); y += pxPerTick) {

			
			if (tickNo % 5 == 0) {
				$("#freq-ticks-1x")[0].appendChild(makeNewTick("white", 0.5, y));

				if (tickNo % 25 == 0) {
					$("#freq-ticks-1x")[0].appendChild(
						makeNewTickText("red", 14, y, (tickNo * hzPerTick)));
				} else {
					$("#freq-ticks-5x")[0].appendChild(
						makeNewTickText("red", 4, y, (tickNo * hzPerTick)%1000));
				}
				
			} else {
				$("#freq-ticks-5x")[0].appendChild(makeNewTick("white", 0.2, y));

			}

			tickNo++;
		}
	}

	function makeNewTick(color, width, y) {
		var newLine = document.createElementNS(svgLinkNs, 'line');
		newLine.setAttribute('stroke', color);
		newLine.setAttribute('stroke-width', width + "px");
		newLine.setAttribute('x1', 18);
		newLine.setAttribute('y1', canvasObj.height() - y);
		newLine.setAttribute('x2', 30);
		newLine.setAttribute('y2', canvasObj.height() - y);

		return newLine;
	}

	function makeNewTickText(color, fontSize, y, value) {
		var newText = document.createElementNS(svgLinkNs, 'text');
		newText.setAttribute('fill', color);
		newText.setAttribute('font-size', fontSize);
		newText.setAttribute('text-anchor', "middle");
		newText.setAttribute('x', 24);
		newText.setAttribute('y', canvasObj.height() - y);
		newText.innerHTML = value;

		return newText;
	}

	// TODO: change scale values again after uploading new sound file 
	function drawTimeTicks() {
		var newPath = null;

		var newText = null;
		var noOfSecs = 0;

		for (var x = 0;  x <= canvasObj.width(); x += 10) {
			newPath = document.createElementNS("http://www.w3.org/2000/svg", 'path');
			newPath.setAttribute('stroke', "black");
			newPath.setAttribute('vector-effect', "non-scaling-stroke");
			newPath.setAttribute('opacity', "0.5");
			$("#time-ticks")[0].appendChild(newPath);
			
			if (x%120 == 0) {
				newPath.setAttribute('d', "M " + x + ", 0 " + x + ",11");
				newPath.setAttribute('stroke-width', "4px");

				newText = document.createElementNS("http://www.w3.org/2000/svg", 'text');
				newText.setAttribute('font-size', 14);
				newText.setAttribute('text-anchor', "middle");
				newText.setAttribute('x', x);
				newText.setAttribute('y', 25);
				noOfSecs = x / 2;

				newText.innerHTML = ("0" + parseInt(noOfSecs/60)).slice(-2) + ":" + ("0" + noOfSecs%60).slice(-2);
				$("#time-ticks")[0].appendChild(newText);
			} else {
				if (x%60 == 0) {
					newPath.setAttribute('d', "M " + x + ", 0 " + x + ",11");

					newText = document.createElementNS("http://www.w3.org/2000/svg", 'text');
					newText.setAttribute('font-size', 14);
					newText.setAttribute('text-anchor', "middle");
					newText.setAttribute('x', x);
					newText.setAttribute('y', 25);
					noOfSecs = x / 2;
					
					newText.innerHTML = ("0" + parseInt(noOfSecs/60)).slice(-2) + ":" + ("0" + noOfSecs%60).slice(-2);
					$("#time-ticks")[0].appendChild(newText);
				} else {
					newPath.setAttribute('d', "M " + x + ", 0 " + x + ",7");
				}
				newPath.setAttribute('stroke-width', "2px");
			}

			
		}
	}


	//----- private methods called after initialisation -----//

	function drawNewPath(x, y) {
		var newSvgPathObj = new SvgPathObject(noOfSvgPathObjs,
			x, y, x, y, ("M " + x + "," + y));

		$("#sound-canvas").mousemove(function(evt) {
			event.stopPropagation();

			newSvgPathObj.drawPath(evt.offsetX, evt.offsetY);

			//--- insert group onto canvas
			canvasObj.css({transform: "matrix(1 0 0 1 0 0)"});
			canvasObj[0].children[1].appendChild(newSvgPathObj.getGroupedSvgObj());
			canvasObj.css({transform: "matrix(" + spectTransformMatrix.join(',') + ")"});

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

	function drawNewHarmonic(x, y) {
		var newSvgHarmonicObj = new SvgHarmonic(noOfSvgHarmonicObjs, noOfSvgPathObjs, 
			x, y, x, y, "3");
		
		$("#sound-canvas").mousemove(function(evt) {
			event.stopPropagation();

			newSvgHarmonicObj.drawHarmonics(evt.offsetX, evt.offsetY);

			//--- insert group onto canvas
			canvasObj.css({transform: "matrix(1 0 0 1 0 0)"});
			canvasObj[0].children[1].appendChild(newSvgHarmonicObj.getGroupedSvgHarmonicObj());
			canvasObj.css({transform: "matrix(" + spectTransformMatrix.join(',') + ")"});

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

	function dragSpectrograms(currX, currY) {
		$(document).mousemove(function(evt) {
			evt.stopPropagation();

			spectTransformMatrix[4] = +(spectTransformMatrix[4] + (evt.clientX - currX)).toFixed(1);
			spectTransformMatrix[5] = +(spectTransformMatrix[5] + (evt.clientY - currY)).toFixed(1);

			$("#sound-canvas").css({transform: "matrix(" + spectTransformMatrix.join(',') + ")"});

			currX = evt.clientX;
			currY = evt.clientY;

		}).mouseup(function() {
			event.stopPropagation();
			$(this).off('mousemove');
			$(this).off('mouseup');
		});
	}

	function zoomSpectrograms(mouseWheelDelta, offsetX, offsetY) {
		var prevZoom = zoomVal;

		if(mouseWheelDelta < 0) {
			
			//--- scroll down
			zoomVal = +(zoomVal - 0.1).toFixed(1);
			if (zoomVal == 4.9) {
				$("#freq-ticks-5x").hide();
			}

		}else {
			
			//--- scroll up
			zoomVal = +(zoomVal + 0.1).toFixed(1);
			if (zoomVal == 5) {
				$("#freq-ticks-5x").show();
			}

		}


		if (zoomVal > 0) {

			//--- actual transforming for zooming
			zoomDx = (1 - zoomVal/prevZoom) * (offsetX - spectTransformMatrix[4]);
			zoomDy = (1 - zoomVal/prevZoom) * (offsetY - spectTransformMatrix[5]);

			spectTransformMatrix[0] = zoomVal;
			spectTransformMatrix[3] = zoomVal;

			spectTransformMatrix[4] = +(zoomDx + spectTransformMatrix[4]).toFixed(1);
			spectTransformMatrix[5] = +(zoomDy + spectTransformMatrix[5]).toFixed(1);
			
			$("#sound-canvas").css({transform: "matrix(" + spectTransformMatrix.join(',') + ")"});

		} else {
			zoomVal = prevZoom;
		}
	}
	

	//----- privileged methods -----//

	this.resetZoom = function() {
		zoomVal = 1.0;
		spectTransformMatrix = [1, 0, 0, 1, 0, 0];
		
		$("#sound-canvas").css({transform: "matrix(" + spectTransformMatrix.join(',') + ")"});
	};

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
			pathStr);
		//TODO: update gradient values, or find a better way to clone the SVG path

		//--- insert group onto canvas
		newSvgPathObj.offsetPosition();
		newSvgPathObj.updateGuideBox();
		canvasObj[0].children[1].appendChild(newSvgPathObj.getGroupedSvgObj());

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
				canvasObj[0].children[1].removeChild(svgPathObjs[currId].getGroupedSvgObj());
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
