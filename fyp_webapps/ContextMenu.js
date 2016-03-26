/**
 * Context menu that inspects a harmonic and its individual paths.
 */

function ContextMenu() {
	"use strict";
	var that = (this === window) ? {} : this;
	
	var fillMeterWidth = $("#svg-path-context-menu").width()-10;
	var harmonicLevelWidth = fillMeterWidth * 0.8;

	var harmonicObj = null;
	var svgPaths = [];
	var currHarmonicNo = 0;

	var noOfHarmonics = 0;

	//--- slider positions of preview gradient of path context menu
	var redCurrX = 0;
	var yellowCurrX = 0;
	var whiteCurrX = 0;

	initialiseListeners();

	function initialiseListeners() {
		
		//--- Path menu
		listenToWidthInput();
		listenToOpacityInput();
		listenToGradientInput();
		listenToGradientTypeChange();

		//--- Harmonic menu
		listenToNoOfHarmonics();

	}

	
	//--- Path menu

	function listenToWidthInput() {
		$("#width-slider, #width-val").on("input", function() {
			$("#width-val").val($(this)[0].value);
			svgPaths[currHarmonicNo].updateStrokeProperties("strokeWidth", $(this)[0].value);
			
		});
	}

	function listenToOpacityInput() {
		$("#opacity-slider, #opacity-val").on("input", function() {
			$("#opacity-val").val($(this)[0].value);
			$("#Gradient-fill-red, #Gradient-fill-yellow, #Gradient-fill-white").attr('stop-opacity', $(this)[0].value);

			if (svgPaths.length > 1) {
				$("#level-value-" + currHarmonicNo).attr('width', ($(this)[0].value) * 100.0 + "%");
			}
			svgPaths[currHarmonicNo].updateStrokeProperties("opacity", $(this)[0].value);
		});
	}

	function listenToGradientInput() {
		$("#slider-red, #slider-yellow, #slider-white").mousedown(function() {
			event.stopPropagation();
			var color = ($(this)[0].id).substr(7);

			$(this).mousemove(function(evt) {
				moveContextMenuSlider(color, evt.offsetX);
				updatePathGradient(color, evt.offsetX);
			}).mouseup(function() {
				$(this).off('mousemove');
				$(this).off('mouseup');
			}).mouseout(function() {
				$(this).off('mousemove');
				$(this).off('mouseout');
			});
		});
	}

	function moveContextMenuSlider(color, currX) {
		var colorCurrX = 0;
		var dx = 0;

		switch(color) {
			case "red":
				colorCurrX = redCurrX;
				break;
			case "yellow":
				colorCurrX = yellowCurrX;
				break;
			case "white":
				colorCurrX = whiteCurrX;
				break;
			default:
				console.log("Error: unknown value of 'color'.");
		}

		//--- move slider
		dx = currX - colorCurrX;
		colorCurrX += dx;
		$("#slider-" + color).attr('transform', "translate(" + (colorCurrX - 5) + ")");
	}

	function updatePathGradient(color, currX) {
		$("#Gradient-fill-" + color).attr('offset', currX/fillMeterWidth * 100 + "%");
		if (color == "red") {
			$("#Gradient-fill").attr('fx', ((currX - 5) / fillMeterWidth * 100) + "%");
		}

		var newStrokeFillGradient = {
			color: color,
			newOffset: currX/fillMeterWidth * 100
		};
		svgPaths[currHarmonicNo].updateStrokeProperties("strokeFillGradient", newStrokeFillGradient);
	}

	function listenToGradientTypeChange() {
		$("#bg-fill-checkbox").change(function() {
			var isGradient = !($(this).is(":checked"));
			svgPaths[currHarmonicNo].updateStrokeProperties("strokeFillType", isGradient);
		});
	}

	function listenToBackButton() {
		$("#back-harmonic-button").click(function() {
			event.stopPropagation();
			$("#svg-path-context-menu").hide();
			$("#svg-harmonic-context-menu").show();
		});
	}

	//--- Harmonic menu
	
	function listenToNoOfHarmonics() {
		$("#add-harmonics").click(function(evt) {
			evt.stopPropagation();
			if (noOfHarmonics < 15) {
				noOfHarmonics++;
				$("#no-of-harmonics-input").val(noOfHarmonics);

				harmonicObj.addHarmonic();
				updateHarmonicLevelsDisplayed();
			}
		});

		$("#minus-harmonics").click(function(evt) {
			evt.stopPropagation();

			if (noOfHarmonics > 1) {
				noOfHarmonics--;
				$("#no-of-harmonics-input").val(noOfHarmonics);

				harmonicObj.deleteHarmonic();
				updateHarmonicLevelsDisplayed();
			}
		});
	}

	function updateHarmonicLevelsDisplayed() {

		//--- remove old harmonic levels
		while ($("#harmonic-levels")[0].firstChild) {
		    $("#harmonic-levels")[0].removeChild($("#harmonic-levels")[0].firstChild);
		}

		//--- remove old harmonic dividers
		while ($("#harmonic-dividers")[0].firstChild) {
		    $("#harmonic-dividers")[0].removeChild($("#harmonic-dividers")[0].firstChild);
		}

		//--- remove old harmonic path buttons
		while ($("#harmonic-paths-buttons")[0].firstChild) {
		    $("#harmonic-paths-buttons")[0].removeChild($("#harmonic-paths-buttons")[0].firstChild);
		}

		//--- remove old harmonic path buttons dividers
		while ($("#harmonic-paths-buttons-dividers")[0].firstChild) {
		    $("#harmonic-paths-buttons-dividers")[0].removeChild($("#harmonic-paths-buttons-dividers")[0].firstChild);
		}
		
		//--- add new harmonic levels 
		var height = 100.0 / noOfHarmonics;
		var opacityVal = 0;
		
		for (var i = 0; i < noOfHarmonics; i++) {
			opacityVal = svgPaths[i].getStrokeProperties().strokeOpacity * 100;
			
			$("#harmonic-levels")[0].appendChild(
				makeLevelSvgRect("background", "#FFFFFF", i, 100, height));
			$("#harmonic-levels")[0].appendChild(
				makeLevelSvgRect("value", "#4D4D4D", i, opacityVal, height));
			$("#harmonic-paths-buttons")[0].appendChild(makeLevelButtonSvgRect(i, height));
			
			$("#harmonic-dividers")[0].appendChild(makeSvgLine(i, height));
			$("#harmonic-paths-buttons-dividers")[0].appendChild(makeSvgLine(i, height));
		}

		resetListeners();
	}

	function makeLevelSvgRect(type, fill, harmonicNo, width, height) {
		var newRect = gSvgCreator.createSolidSvgRect(0, (noOfHarmonics - 1 - harmonicNo) * height + "%", width + "%", height + "%", fill);
		newRect.setAttribute('class', "level-meter");
		newRect.setAttribute('id', "level-" + type + "-" + harmonicNo);
		
		return newRect;
	}

	function makeLevelButtonSvgRect(harmonicNo, height) {
		var newRect = gSvgCreator.createSolidSvgRect(0, (noOfHarmonics - 1 - harmonicNo) * height + "%", "100%", height + "%", "orange");
		newRect.setAttribute('class', "level-button");
		newRect.setAttribute('id', "level-button" + "-" + harmonicNo);

		return newRect;
	}

	function makeSvgLine(harmonicNo, height) {
		return gSvgCreator.createHoriSvgLine(0, "100%", (noOfHarmonics - 1 - harmonicNo) * height + "%", "#737373", 1);
	}

	function resetListeners() {
		listenToHarmonicLevelChange();
		listenToPathInspector();
	}

	// TODO: mouse move a bit off
	function listenToHarmonicLevelChange() {
		$(".level-meter").mousedown(function(evt) {
			evt.stopPropagation();

			var harmonicNo = $(this)[0].id.split("-")[2];
			
			var newOpacity = evt.offsetX/harmonicLevelWidth;
			$("#level-value-" + harmonicNo).attr('width', newOpacity * 100.0 + "%");
			svgPaths[harmonicNo].updateStrokeProperties("opacity", (newOpacity * 1.0));
			
			$("#level-value-" + harmonicNo + ", #level-background-" + harmonicNo).mousemove(function(evt) {
				newOpacity = evt.offsetX/harmonicLevelWidth;
				$("#level-value-" + harmonicNo).attr('width', newOpacity * 100.0 + "%");
				svgPaths[harmonicNo].updateStrokeProperties("opacity", (newOpacity * 1.0));
			}).mouseup(function() {
				$("#level-value-" + harmonicNo + ", #level-background-" + harmonicNo).off('mousemove');
				$("#level-value-" + harmonicNo + ", #level-background-" + harmonicNo).off('mouseup');
			});
		});
	}

	function listenToPathInspector() {
		$(".level-button").click(function(evt) {
			evt.stopPropagation();

			currHarmonicNo = ($(this)[0].id).split("-")[2];
			setPathValues(svgPaths[currHarmonicNo].getStrokeProperties());
			$("#svg-harmonic-context-menu").hide();
			$("#svg-path-context-menu").show();
		});
	}

	
	//--- Set path menu properties
	
	function setPathValues(strokeProperties) {
		//--- set SVG path's width		
		$("#width-val, #width-slider").val(strokeProperties.strokeWidth);

		//--- set SVG path's gradient value
		var gradientValues = strokeProperties.strokeGradient;
		$("#Gradient-fill").attr('fx', (gradientValues.redOffset) + "%");
		$("#Gradient-fill-red").attr('offset', (gradientValues.redOffset) + "%");
		$("#Gradient-fill-yellow").attr('offset', (gradientValues.yellowOffset) + "%");
		$("#Gradient-fill-white").attr('offset', (gradientValues.whiteOffset) + "%");

		redCurrX = gradientValues.redOffset/100 * fillMeterWidth;
		yellowCurrX = gradientValues.yellowOffset/100 * fillMeterWidth;
		whiteCurrX = gradientValues.whiteOffset/100 * fillMeterWidth;
		
		$("#slider-red").attr('transform', "translate(" + (redCurrX - 5) + ")");
		$("#slider-yellow").attr('transform', "translate(" + (yellowCurrX - 5) + ")");
		$("#slider-white").attr('transform', "translate(" + (whiteCurrX - 5) + ")");

		if (!strokeProperties.isGradient) {
			$("#bg-fill-checkbox").prop('checked', true);
		} else {
			$("#bg-fill-checkbox").prop('checked', false);
		}

		//--- set SVG path's opacity value
		$("#opacity-val, #opacity-slider").val(strokeProperties.strokeOpacity);
		$("#Gradient-fill-red, #Gradient-fill-yellow, #Gradient-fill-white").attr('stop-opacity', strokeProperties.strokeOpacity);
	}


	//--- Set harmonic menu properties
	
	function setHarmonicValues() {
		noOfHarmonics = svgPaths.length;
		$("#no-of-harmonics-input").val(noOfHarmonics);
		updateHarmonicLevelsDisplayed();
	}


	this.showContextMenus = function(top, left, isHarmonic, svgObj) {
		
		//--- reposition context menu
		$(".context-menu").offset({
			top: top,
			left: left
		});

		svgPaths = [];
		currHarmonicNo = 0;

		if (!isHarmonic) {
			svgPaths[0] = svgObj;

			//--- initaialise values for SVG path
			setPathValues(svgPaths[0].getStrokeProperties());

			$("#back-harmonic-button").prop('disabled', true);
			$("#back-harmonic-button").off();
			$("#svg-path-context-menu").show();

		} else {
			svgPaths = svgObj.getSvgPathObjs();
			harmonicObj = svgObj;

			//--- initialise values for SVG harmonic
			setHarmonicValues();
			
			$("#back-harmonic-button").prop('disabled', false);
			listenToBackButton();
			$("#svg-harmonic-context-menu").show();
		}

	};

	this.hideContextMenu = function() {
		$(".context-menu").offset({
			top: 0,
			left: 0
		});	// reset position to prevent it from flying off the screen
		$(".context-menu").hide();
	};
};
