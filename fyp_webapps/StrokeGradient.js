/**
 * Gradient of a stroke of an SVG path.
 * Only has 3 colours, red, yellow and white to represent
 * the amplitude of a harmonic.
 *
 * Created by joanne on 12/1/16.
 */

// TODO: change white to black
function StrokeGradient(pathId) {
	"use strict";

	var that = (this === window) ? {} : this;
	var id = "gradient-fill-" + pathId;

	var gradientDefObj;
	var linearGradientObj;
	var redStopObj;
	var yellowStopObj;
	var whiteStopObj;

	var redOffset = 25;
	var yellowOffset = 50;
	var whiteOffset = 75;

	var redTranslateX = 0;
	var yellowTranslateX = 0;
	var whiteTranslateX = 0;

	var verticalPos = 50;

	var opacity = 1;

	createGradientDefObj();

	//----- private methods -----//
	function createGradientDefObj() {
		gradientDefObj = document.createElementNS("http://www.w3.org/2000/svg", 'defs');

		linearGradientObj = document.createElementNS("http://www.w3.org/2000/svg", 'linearGradient');
		linearGradientObj.setAttribute('id', id);
		linearGradientObj.setAttribute('fx', redOffset + "%");
		linearGradientObj.setAttribute('fy', verticalPos + "%");
		linearGradientObj.setAttribute('r', "0.8");

		redStopObj = createStopObj("red", redOffset);
		yellowStopObj = createStopObj("yellow", yellowOffset);
		whiteStopObj = createStopObj("white", whiteOffset);

		linearGradientObj.appendChild(redStopObj);
		linearGradientObj.appendChild(yellowStopObj);
		linearGradientObj.appendChild(whiteStopObj);
		gradientDefObj.appendChild(linearGradientObj);
	}

	function createStopObj(stopColor, offsetVal) {
		var stopObj = document.createElementNS("http://www.w3.org/2000/svg", 'stop');
		stopObj.setAttribute('stop-color', stopColor);
		stopObj.setAttribute('stop-opacity', opacity);
		stopObj.setAttribute('offset', offsetVal + "%");

		return stopObj;
	}

	function setRedOffset(newOffsetVal) {
		redOffset = newOffsetVal;
		redStopObj.setAttribute('offset', newOffsetVal + "%");
		linearGradientObj.setAttribute('fx', newOffsetVal + "%");
	};

	function setYellowOffset(newOffsetVal) {
		yellowOffset = newOffsetVal;
		yellowStopObj.setAttribute('offset', newOffsetVal + "%");
	};

	function setWhiteOffset(newOffsetVal) {
		whiteOffset = newOffsetVal;
		whiteStopObj.setAttribute('offset', newOffsetVal + "%");
	};

	//----- privileged methods -----//
	
	this.setOffset = function (color, newOffsetVal) {
		switch(color) {
			case "red":
				setRedOffset(newOffsetVal);
				break;
			case "yellow":
				setYellowOffset(newOffsetVal);
				break;
			case "white":
				setWhiteOffset(newOffsetVal);
				break;
			default:
				console.log("Error: unknown value of 'color'.");
		}
	}

	this.setOpacity = function(newOpacityVal) {
		opacity = newOpacityVal;
		redStopObj.setAttribute('stop-opacity', newOpacityVal);
		yellowStopObj.setAttribute('stop-opacity', newOpacityVal);
		whiteStopObj.setAttribute('stop-opacity', newOpacityVal);
	};

	this.updateId = function(newId) {
		id = "gradient-fill-" + newId;
	};

	this.getGradientDefObj = function() {
		return gradientDefObj;
	};

	this.getGradientId = function() {
		return id;
	};

	//TODO: find a better way to clone this
	this.getGradientProperties = function() {
		return {
			redOffset: redOffset,
			yellowOffset: yellowOffset,
			whiteOffset: whiteOffset,
			opacity: opacity
		};
	};

	return that;
}
