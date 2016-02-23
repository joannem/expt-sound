/**
 * Context menu of an SVG path.
 * Currently has 3 settings:
 * 	- Stroke width
 * 	- Stroke fill
 * 	- Stroke opacity
 *
 * Created by joanne on 14/1/16.
 */

function SvgPathContextMenu () {
	"use strict";
	var that = (this === window) ? {} : this;

	var fillMeterWidth = $("#svg-path-context-menu").width()-10;

	var redCurrX = 0;
	var yellowCurrX = 0;
	var whiteCurrX = 0;

	var currStrokeGradient = null;
	var currUpdateStrokeWidthCallback = null;

	//----- private methods -----//
	
	function turnOffAllInputListeners() {
		$("#width-slider, #width-val").off("input");
		$("#opacity-slider, #opacity-val").off("input");
	}
	
	function listenToWidthInput() {
		$("#width-slider, #width-val").on("input", function() {
			$("#width-val").val($(this)[0].value);
			currUpdateStrokeWidthCallback($(this)[0].value);
			
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
				dx = currX - redCurrX;
				break;
			case "yellow":
				colorCurrX = yellowCurrX;
				dx = currX - yellowCurrX;
				break;
			case "white":
				colorCurrX = whiteCurrX;
				dx = currX - whiteCurrX;
				break;
			default:
				console.log("Error: unknown value of 'color'.");
		}

		//--- move slider
		colorCurrX += dx;
		$("#slider-" + color).attr('transform', "translate(" + (colorCurrX - 5) + ")");
	}

	function updateGradient(color, currX) {
		//--- update path gradient
		currStrokeGradient.setOffset(color, currX/fillMeterWidth * 100);

		//--- update preview gradient
		$("#Gradient-fill-" + color).attr('offset', currX/fillMeterWidth * 100 + "%");
		if (color == "red") {
			$("#Gradient-fill").attr('fx', ((currX - 5) / fillMeterWidth * 100) + "%");
		}
	}

	function listenToOpacityInput() {
		$("#opacity-slider, #opacity-val").on("input", function() {
			$("#opacity-val").val($(this)[0].value);
			currStrokeGradient.setOpacity($(this)[0].value);
			$("#Gradient-fill-red, #Gradient-fill-yellow, #Gradient-fill-white").attr('stop-opacity', $(this)[0].value);
		});
	}

	//----- privileged methods -----//

	this.showContextMenu = function(e, updateStrokeWidthCallback, strokeWidth, strokeGradient) {
		currUpdateStrokeWidthCallback = updateStrokeWidthCallback;

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

		//--- set SVG path's opacity value
		$("#opacity-val, #opacity-slider").val(gradientValues.opacity);
		$("#Gradient-fill-red, #Gradient-fill-yellow, #Gradient-fill-white").attr('stop-opacity', gradientValues.opacity);

		//--- reposition context menu
		$("#svg-path-context-menu").offset({
			top: (e.pageY),
			left: (e.pageX)
		});

		//--- show menu
		$("#svg-path-context-menu").show();

		listenToWidthInput();
		listenToGradientInput();
		listenToOpacityInput();
	};

	this.hideContextMenu = function() {
		$("#svg-path-context-menu").offset({
			top: 0,
			left: 0
		});	// reset position to prevent it from flying off the screen
		$("#svg-path-context-menu").hide();
		turnOffAllInputListeners();
	}
 
	return that;
}
