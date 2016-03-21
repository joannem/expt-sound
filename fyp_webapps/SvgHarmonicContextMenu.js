/**
 * Context menu of an SVG harmonic.
 * Currently takes information from 2 values:
 *  - Number of harmonics
 *  - The level (opacity) of each harmonic
 *  - Path properties of each path in the harmonic
 */

function SvgHarmonicContextMenu() {
	"use strict";
	var that = (this === window) ? {} : this;
	var svgns = "http://www.w3.org/2000/svg";

	var harmonicLevelWidth = 0;

	var harmonics = [];
	var noOfHarmonics = 0;

	function createListeners() {
		listenToHarmonicLevelChange();
		listenToNoOfHarmonics();
	}

	function listenToHarmonicLevelChange() {
		$(".level-meter").mousedown(function(evt) {
			evt.stopPropagation();

			var harmonicNo = ($(this)[0].id).substr($(this)[0].id.length-1);
			
			var newOpacity = evt.offsetX/harmonicLevelWidth;
			$("#level-value-" + harmonicNo).attr('width', newOpacity * 100.0 + "%");
			harmonics[harmonicNo].updateStrokeOpacity(newOpacity * 1.0);

			$("#level-value-" + harmonicNo + ", #level-background-" + harmonicNo).mousemove(function(evt) {
				newOpacity = evt.offsetX/harmonicLevelWidth;
				$("#level-value-" + harmonicNo).attr('width', newOpacity * 100.0 + "%");
				harmonics[harmonicNo].updateStrokeOpacity(newOpacity * 1.0);
			}).mouseup(function() {
				$("#level-value-" + harmonicNo + ", #level-background-" + harmonicNo).off('mousemove');
				$("#level-value-" + harmonicNo + ", #level-background-" + harmonicNo).off('mouseup');
			});
		});
	}

	function listenToNoOfHarmonics() {
		$("#no-of-harmonics-input").on("input", function() {
			noOfHarmonics = $(this)[0].value;
			//--- update interface
		});

		$("#add-harmonics").click(function(evt) {
			evt.stopPropagation();
			noOfHarmonics++;
			//--- update interface
		});

		$("#minus-harmonics").click(function(evt) {
			evt.stopPropagation();
			noOfHarmonics--;
			//--- update interface
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
		
		//--- add new harmonic levels and 
		var height = 100.0 / noOfHarmonics;
		var opacityVal = 0;
		
		for (var i = 0; i < noOfHarmonics; i++) {
			opacityVal = harmonics[i].getStrokeProperties().strokeOpacity * 100;
			
			$("#harmonic-levels")[0].appendChild(
				makeSvgRect("background", "#FFFFFF", i, 100, height));
			$("#harmonic-levels")[0].appendChild(
				makeSvgRect("value", "#4D4D4D", i, opacityVal, height));
			$("#harmonic-dividers")[0].appendChild(
				makeSvgLine(i, height));
		}

	}

	function makeSvgRect(type, fill, harmonicNo, width, height) {
		
		var newRect = document.createElementNS(svgns, 'rect');
		newRect.setAttribute('class', "level-meter");
		newRect.setAttribute('id', "level-" + type + "-" + harmonicNo);
		newRect.setAttribute('x', 0);
		newRect.setAttribute('y', (harmonicNo * height) + "%");
		newRect.setAttribute('height', height + "%");
		newRect.setAttribute('width', width + "%");
		newRect.setAttribute('fill', fill);

		return newRect;
	}

	function makeSvgLine(harmonicNo, height) {
		var newLine = document.createElementNS(svgns, 'line');
		newLine.setAttribute('x1', 0);
		newLine.setAttribute('y1', (harmonicNo * height) + "%");
		newLine.setAttribute('x2', "100%");
		newLine.setAttribute('y2', (harmonicNo * height) + "%");
		newLine.setAttribute('stroke', "#737373");
		newLine.setAttribute('stroke-width', 1);

		return newLine;
	}

	this.showHarmonicContextMenu = function(evt, harmonicPaths) {
		//--- update fields in the context menu
		harmonics = harmonicPaths;
		noOfHarmonics = harmonicPaths.length;
		$("#no-of-harmonics-input").val(noOfHarmonics);
		updateHarmonicLevelsDisplayed();
		
		//--- reposition context menu
		$("#svg-harmonic-context-menu").offset({
			top: (evt.pageY),
			left: (evt.pageX)
		});

		createListeners();

		//--- show menu
		$("#svg-harmonic-context-menu").show();
		harmonicLevelWidth = $("#harmonic-levels-container").width();
	}

	this.hideHarmonicContextMenu = function() {
		$("#svg-harmonic-context-menu").offset({
			top: 0,
			left: 0
		});	// reset position to prevent it from flying off the screen
		$("#svg-harmonic-context-menu").hide();
	}

}
