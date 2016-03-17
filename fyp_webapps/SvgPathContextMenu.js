/**
 * Context menu of an SVG path.
 * Currently has 3 settings:
 * 	- Stroke width
 * 	- Stroke opacity
 * 	- Stroke fill
 *
 * Created by joanne on 14/1/16.
 */

function SvgPathContextMenu() {
	"use strict";
	var that = (this === window) ? {} : this;

	var fillMeterWidth = $("#svg-path-context-menu").width()-10;

	var redCurrX = 0;
	var yellowCurrX = 0;
	var whiteCurrX = 0;

	var currStrokeGradient = null;
	var updateStrokePropertiesCallback = null;

	//--- initialise listeners
	listenToWidthInput();
	listenToGradientInput();
	listenToPatternInput();
	listenToOpacityInput();

	//----- private methods -----//
	
	function listenToWidthInput() {
		$("#width-slider, #width-val").on("input", function() {
			$("#width-val").val($(this)[0].value);
			updateStrokePropertiesCallback("strokeWidth", $(this)[0].value);
			
		});
	}

	function listenToOpacityInput() {
		$("#opacity-slider, #opacity-val").on("input", function() {
			$("#opacity-val").val($(this)[0].value);
			$("#Gradient-fill-red, #Gradient-fill-yellow, #Gradient-fill-white").attr('stop-opacity', $(this)[0].value);
			updateStrokePropertiesCallback("opacity", $(this)[0].value);
		});
	}

	function listenToGradientInput() {
		$("#slider-red, #slider-yellow, #slider-white").mousedown(function() {
			event.stopPropagation();
			var color = ($(this)[0].id).substr(7);

			$(this).mousemove(function(evt) {
				updateSlider(color, evt.offsetX);
				updateGradient(color, evt.offsetX);
			}).mouseup(function() {
				$(this).off('mousemove');
				$(this).off('mouseup');
			}).mouseout(function() {
				$(this).off('mousemove');
				$(this).off('mouseout');
			});
		});
	}

	function updateSlider(color, currX) {
		var colorCurrX = 0;
		var dx = 0;

		//--- calculate slider dx
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

	function updateGradient(color, currX) {
		//--- update preview gradient
		$("#Gradient-fill-" + color).attr('offset', currX/fillMeterWidth * 100 + "%");
		if (color == "red") {
			$("#Gradient-fill").attr('fx', ((currX - 5) / fillMeterWidth * 100) + "%");
		}
		//--- update path gradient
		var newStrokeFillGradient = {
			color: color,
			newOffset: currX/fillMeterWidth * 100
		};
		updateStrokePropertiesCallback("strokeFillGradient", newStrokeFillGradient);
	}

	function listenToPatternInput() {
		$("#bg-fill-checkbox").change(function() {
			var isGradient = !($(this).is(":checked"));
			updateStrokePropertiesCallback("strokeFillType", isGradient);
		});
	}


	//----- privileged methods -----//

	this.showContextMenu = function(e, updateStrokeProperties, strokeWidth, strokeOpacity, strokeGradient, isGradient) {
		updateStrokePropertiesCallback = updateStrokeProperties;

		//--- set SVG path's width		
		$("#width-val, #width-slider").val(strokeWidth);

		//--- set SVG path's gradient value
		currStrokeGradient = strokeGradient;
		var gradientValues = currStrokeGradient.getGradientProperties();
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

		if (!isGradient) {
			$("#bg-fill-checkbox").prop('checked', true);
		} else {
			$("#bg-fill-checkbox").prop('checked', false);
		}

		//--- set SVG path's opacity value
		$("#opacity-val, #opacity-slider").val(strokeOpacity);
		$("#Gradient-fill-red, #Gradient-fill-yellow, #Gradient-fill-white").attr('stop-opacity', strokeOpacity);

		//--- reposition context menu
		$("#svg-path-context-menu").offset({
			top: (e.pageY),
			left: (e.pageX)
		});

		//--- show menu
		$("#svg-path-context-menu").show();
	};

	this.hideContextMenu = function() {
		$("#svg-path-context-menu").offset({
			top: 0,
			left: 0
		});	// reset position to prevent it from flying off the screen
		$("#svg-path-context-menu").hide();
	}
 
	return that;
}
