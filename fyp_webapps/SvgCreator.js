/**
 * A class to allow SVG elements to be created dynamically. 
 * Only takes in basic properties, position, color, width/size.
 * 
 */

function SvgCreator() {
	"use strict";
	
	var that = (this === window) ? {} : this;
	var svgLinkNs = "http://www.w3.org/2000/svg";

	this.createSvgPath = function(pathStr, color, strokeWidth) {
		var svgPath = document.createElementNS(svgLinkNs, 'path');
		svgPath.setAttribute('d', pathStr);
		svgPath.setAttribute('stroke', color);
		svgPath.setAttribute('stroke-width', strokeWidth + "px");
		svgPath.setAttribute('stroke-linecap', "round");
		svgPath.setAttribute('stroke-linejoin', "round");
		svgPath.setAttribute('fill', "transparent");

		return svgPath;
	};

	this.createHoriSvgLine = function(x1, x2, y, strokeColor, strokeWidth) {
		var svgHoriLine = document.createElementNS(svgLinkNs, 'line');
		svgHoriLine.setAttribute('x1', x1);
		svgHoriLine.setAttribute('y1', y);
		svgHoriLine.setAttribute('x2', x2);
		svgHoriLine.setAttribute('y2', y);
		svgHoriLine.setAttribute('stroke', strokeColor);
		svgHoriLine.setAttribute('stroke-width', strokeWidth + "px");

		return svgHoriLine;
	};

	this.createVertSvgLine = function(x, y1, y2, strokeColor, strokeWidth) {
		var svgVertLine = document.createElementNS(svgLinkNs, 'line');
		svgVertLine.setAttribute('x1', x);
		svgVertLine.setAttribute('y1', y1);
		svgVertLine.setAttribute('x2', x);
		svgVertLine.setAttribute('y2', y2);
		svgVertLine.setAttribute('stroke', strokeColor);
		svgVertLine.setAttribute('stroke-width', strokeWidth + "px");

		return svgVertLine;
	};

	this.createTransparentSvgRect = function(x, y, width, height, strokeColor, strokeWidth) {
		var svgRect = document.createElementNS(svgLinkNs, 'rect');
		svgRect.setAttribute('x', x);
		svgRect.setAttribute('y', y);
		svgRect.setAttribute('width', width);
		svgRect.setAttribute('height', height);
		svgRect.setAttribute('stroke', strokeColor);
		svgRect.setAttribute('stroke-width', strokeWidth);
		svgRect.setAttribute('fill', "transparent");

		return svgRect;
	};

	this.createSolidSvgRect = function(x, y, width, height, fill) {
		var svgRect = document.createElementNS(svgLinkNs, 'rect');
		svgRect.setAttribute('x', x);
		svgRect.setAttribute('y', y);
		svgRect.setAttribute('width', width);
		svgRect.setAttribute('height', height);
		svgRect.setAttribute('fill', fill);
		
		return svgRect;
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
	};

	this.createSvgGroup = function() {
		return (document.createElementNS(svgLinkNs, 'g'));
	};
}
