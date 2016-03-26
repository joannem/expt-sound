/**
 * A class to allow SVG elements to be created dynamically. 
 * Only takes in basic properties, position, colour, width/size.
 * 
 */

function SvgCreator() {
	"use strict";
	
	var that = (this === window) ? {} : this;
	var svgLinkNs = "http://www.w3.org/2000/svg";

	this.createHoriSvgLine = function(x1, x2, y, color, strokeWidth) {
		var svgHoriLine = document.createElementNS(svgLinkNs, 'line');
		svgHoriLine.setAttribute('x1', x1);
		svgHoriLine.setAttribute('y1', y);
		svgHoriLine.setAttribute('x2', x2);
		svgHoriLine.setAttribute('y2', y);
		svgHoriLine.setAttribute('stroke', color);
		svgHoriLine.setAttribute('stroke-width', strokeWidth + "px");

		return svgHoriLine;
	};

	this.createVertSvgLine = function(x, y1, y2, color, strokeWidth) {
		var svgVertLine = document.createElementNS(svgLinkNs, 'line');
		svgVertLine.setAttribute('x1', x);
		svgVertLine.setAttribute('y1', y1);
		svgVertLine.setAttribute('x2', x);
		svgVertLine.setAttribute('y2', y2);
		svgVertLine.setAttribute('stroke', color);
		svgVertLine.setAttribute('stroke-width', strokeWidth + "px");

		return svgVertLine;
	};

	this.createSvgText = function(text, x, y, color, fontSize) {
		var svgText = document.createElementNS(svgLinkNs, 'text');
		svgText.setAttribute('fill', color);
		svgText.setAttribute('font-size', fontSize);
		svgText.setAttribute('text-anchor', "middle");
		svgText.setAttribute('x', x);
		svgText.setAttribute('y', y);
		svgText.innerHTML = text;

		return svgText;
	}
}
