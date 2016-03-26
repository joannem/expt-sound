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
	
	var zoomVal = 1.0;
	var zoomDx = 0; var zoomDy = 0;
	var spectTransformMatrix = [1, 0, 0, 1, 0, 0];

	drawFreqTicks();
	drawTimeTicks(5 * 60);	// default, 5 mins
	
	$("#canvas-space").mousedown(function(evt) {
		evt.stopPropagation();
		that.deselectAllPaths();

		if (evt.which == gLeftMouseButton) {
			gContextMenu.hideContextMenu();

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
				$("#freq-ticks-1x")[0].appendChild(makeNewFreqTick("white", 0.5, y));

				if (tickNo % 25 == 0) {
					$("#freq-ticks-1x")[0].appendChild(
						makeNewFreqTickText("red", 14, y, (tickNo * hzPerTick)));
				} else {
					$("#freq-ticks-5x")[0].appendChild(
						makeNewFreqTickText("red", 4, y, (tickNo * hzPerTick)%1000));
				}
				
			} else {
				$("#freq-ticks-5x")[0].appendChild(makeNewFreqTick("white", 0.2, y));

			}

			tickNo++;
		}
	}

	function makeNewFreqTick(color, width, y) {
		return gSvgCreator.createHoriSvgLine(18, 30, canvasObj.height() - y, color, width);
	}

	function makeNewFreqTickText(color, fontSize, y, value) {
		return gSvgCreator.createSvgText(value, 24, canvasObj.height() - y, color, fontSize);
	}

	// TODO: dragging then zoom bug
	
	function drawTimeTicks(soundLenInSecs) {

		//--- calculate spacing between ticks relative to size of canvas
		
		//--- min tick spacing: 2.5px; max freq fixed at 22100Hz
		var pxPerSec = (canvasObj.width() / soundLenInSecs);
		var minSecPerTick = 2.5 / pxPerSec;
		
		var secPerTick = 10;	// if each tick is min 2.5px

		if (minSecPerTick <= 1) {
			secPerTick = 1;
		} else if (minSecPerTick <= 10) {
			secPerTick = 10;
		} else if (minSecPerTick <= 15) {
			secPerTick = 15;
		} else if (minSecPerTick <= 30) {
			secPerTick = 30;
		} else if (minSecPerTick <= 60) {
			secPerTick = 60;
		} else if (minSecPerTick <= 300) {
			secPerTick = 300;
		} else {
			console.log("Not enough screen resolution");
			return;
		}

		var pxPerTick = pxPerSec * secPerTick;

		//--- draw the ticks
		
		var noOfSecs = 0;
		for (var x = 0;  x <= canvasObj.width(); x += pxPerTick) {

			if (noOfSecs%60 == 0) {
				$("#time-ticks-1x")[0].appendChild(makeNewTimeTick(x, 15, 1));
				$("#time-ticks-1x")[0].appendChild(makeNewTimeTickText(12, x, noOfSecs));
			} else {
				if (noOfSecs%15 == 0) {
					$("#time-ticks-1x")[0].appendChild(makeNewTimeTick(x, 10, 1));
					$("#time-ticks-1x")[0].appendChild(makeNewTimeTickText(12, x, noOfSecs));
				} else {
					if (noOfSecs%5 == 0) {
						$("#time-ticks-1x")[0].appendChild(makeNewTimeTick(x, 10, 1));
						$("#time-ticks-5x")[0].appendChild(makeNewTimeTickSecText(7, x, noOfSecs));
					} else {
						$("#time-ticks-1x")[0].appendChild(makeNewTimeTick(x, 7, 1));
					}
				}
			}

			noOfSecs += secPerTick;
		}
	}

	function makeNewTimeTick(x, y, strokeWidth) {
		var newLine = gSvgCreator.createVertSvgLine(x, 0, y, "black", strokeWidth);
		newLine.setAttribute('opacity', "0.5");
		
		return newLine;
	}

	function makeNewTimeTickText(fontSize, x, noOfSecs) {
		var tickVal = ("0" + parseInt(noOfSecs/60)).slice(-2) + ":" + ("0" + noOfSecs%60).slice(-2);
		return gSvgCreator.createSvgText(tickVal, x, 20, "black", fontSize)
	}

	function makeNewTimeTickSecText(fontSize, x, noOfSecs) {
		var tickVal = ("0" + noOfSecs%60).slice(-2);
		return gSvgCreator.createSvgText(tickVal, x, 15, "black", fontSize);
	}


	//----- private methods called after initialisation -----//

	function drawNewPath(x, y) {
		var newSvgPathObj = new SvgPathObject(gNoOfSvgPathObjs,
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
			gNoOfSvgPathObjs++;
			svgPathObjs.push(newSvgPathObj);

			$(this).off('mouseup');
		});
	}

	function drawNewHarmonic(x, y) {
		var newSvgHarmonicObj = new SvgHarmonic(gNoOfSvgHarmonicObjs, gNoOfSvgPathObjs, 
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
			gNoOfSvgPathObjs += 3;
			gNoOfSvgHarmonicObjs++;
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
				$("#time-ticks-5x").hide();
			}

		}else {
			
			//--- scroll up
			zoomVal = +(zoomVal + 0.1).toFixed(1);
			if (zoomVal == 5) {
				$("#freq-ticks-5x").show();
				$("#time-ticks-5x").show();
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
		var newSvgPathObj = new SvgPathObject(gNoOfSvgPathObjs,
			guideBoxCoordinates.minX, guideBoxCoordinates.minY,
			guideBoxCoordinates.maxX, guideBoxCoordinates.maxY,
			pathStr);
		//TODO: update gradient values, or find a better way to clone the SVG path

		//--- insert group onto canvas
		newSvgPathObj.updateGuideBox();
		canvasObj[0].children[1].appendChild(newSvgPathObj.getGroupedSvgObj());

		//--- update list of objects in SvgCanvas
		gNoOfSvgPathObjs++;
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
