/*
    Winwheel.js, by Douglas McKechie @ www.dougtesting.net
    See website for tutorials and other documentation.

    The MIT License (MIT)
*/

import { sumArr } from 'e';
import { Canvas, CanvasRenderingContext2D } from 'skia-canvas/lib';

type TextAlignment = 'inner' | 'outer' | 'center';

export interface WinwheelSegment {
	fillStyle: string;
	text: string;
	textAlignment: TextAlignment;
	weight: number;
}

export type ParsedSegment = { size: number } & Omit<WinwheelSegment, 'weight'>;
export type DrawMode = 'code' | 'image' | 'segmentImage';

export interface WinwheelOptions {
	size: number;
	segments: WinwheelSegment[];
	drawMode?: DrawMode;
	showPins?: boolean;

	centerX?: any;
	centerY?: any;
	outerRadius?: any;
	innerRadius?: number;
	numSegments?: number;
	rotationAngle?: number;
	textFontFamily?: string;
	textFontSize?: number;
	textFontWeight?: string;
	textOrientation?: string;
	textAlignment?: string;
	textDirection?: string;
	textMargin?: any;
	textFillStyle?: string;
	textStrokeStyle?: any;
	textLineWidth?: number;
	fillStyle?: string;
	strokeStyle?: string;
	lineWidth?: number;
	clearTheCanvas?: boolean;
	imageOverlay?: boolean;
	drawText?: boolean;
	pointerAngle?: number;
	wheelImage?: any;
	imageDirection?: string;
	scaleFactor?: number;
}

const defaultOptions = {
	canvasId: 'canvas', // Id of the canvas which the wheel is to draw on to.
	centerX: null, // X position of the center of the wheel. The default of these are null which means will be placed in center of the canvas.
	centerY: null, // Y position of the wheel center. If left null at time of construct the center of the canvas is used.
	outerRadius: null, // The radius of the outside of the wheel. If left null it will be set to the radius from the center of the canvas to its shortest side.
	innerRadius: 0, // Normally 0. Allows the creation of rings / doughnuts if set to value > 0. Should not exceed outer radius.
	drawMode: 'code', // The draw mode. Possible values are 'code', 'image', 'segmentImage'. Default is code which means segments are drawn using canvas arc() function.
	rotationAngle: 0, // The angle of rotation of the wheel - 0 is 12 o'clock position.
	textFontFamily: 'Arial', // Segment text font, you should use web safe fonts.
	textFontSize: 20, // Size of the segment text.
	textFontWeight: 'bold', // Font weight.
	textOrientation: 'horizontal', // Either horizontal, vertical, or curved.
	textAlignment: 'center', // Either center, inner, or outer.
	textDirection: 'normal', // Either normal or reversed. In normal mode for horizontal text in segment at 3 o'clock is correct way up, in reversed text at 9 o'clock segment is correct way up.
	textMargin: null, // Margin between the inner or outer of the wheel (depends on textAlignment).
	textFillStyle: 'black', // This is basically the text colour.
	textStrokeStyle: null, // Basically the line colour for segment text, only looks good for large text so off by default.
	textLineWidth: 1, // Width of the lines around the text. Even though this defaults to 1, a line is only drawn if textStrokeStyle specified.
	fillStyle: 'silver', // The segment background colour.
	strokeStyle: 'black', // Segment line colour. Again segment lines only drawn if this is specified.
	lineWidth: 1, // Width of lines around segments.
	clearTheCanvas: true, // When set to true the canvas will be cleared before the wheel is drawn.
	imageOverlay: false, // If set to true in image drawing mode the outline of the segments will be displayed over the image. Does nothing in code drawMode.
	drawText: true, // By default the text of the segments is rendered in code drawMode and not in image drawMode.
	pointerAngle: 0, // Location of the pointer that indicates the prize when wheel has stopped. Default is 0 so the (corrected) 12 o'clock position.
	wheelImage: null, // Must be set to image data in order to use image to draw the wheel - drawMode must also be 'image'.
	imageDirection: 'N' // Used when drawMode is segmentImage. Default is north, can also be (E)ast, (S)outh, (W)est.
};

export class Winwheel {
	canvas: Canvas;
	ctx: CanvasRenderingContext2D;
	segments: ParsedSegment[];
	numSegments: number;
	drawMode: DrawMode;
	pins: number | null = null;
	rotationAngle = 0;
	scaleFactor = 0;
	centerX: number;
	centerY: number;
	outerRadius: number;
	lineWidth = 1;

	constructor(options: WinwheelOptions) {
		this.canvas = new Canvas(options.size, options.size);
		this.ctx = this.canvas.getContext('2d');
		const totalWeight = sumArr(options.segments.map(i => i.weight));
		this.segments = options.segments.map(i => ({ ...i, size: (i.weight / totalWeight) * 360 }));
		this.numSegments = this.segments.length;
		this.updateSegmentSizes();

		this.centerX = this.canvas.width / 2;
		this.centerY = this.canvas.height / 2;

		if (this.canvas.width < this.canvas.height) {
			this.outerRadius = this.canvas.width / 2 - this.lineWidth;
		} else {
			this.outerRadius = this.canvas.height / 2 - this.lineWidth;
		}

		this.drawMode = options.drawMode ?? 'code';
		this.pins = options.showPins ? this.numSegments : null;

		if (this.textMargin === null) {
			this.textMargin = this.textFontSize / 1.7;
		}

		// if (options != null && options.animation && typeof options.animation !== 'undefined') {
		// 	this.animation = new Animation(options.animation);
		// } else {
		// 	this.animation = new Animation();
		// }

		// ------------------------------------------
		// If some pin options then create create a pin object and then pass them in.
		if (options.showPins) {
			this.pins = new Pin();
		}

		// ------------------------------------------
		// If the drawMode is image change some defaults provided a value has not been specified.
		if (this.drawMode === 'image' || this.drawMode === 'segmentImage') {
			// Remove grey fillStyle.
			if (typeof options.fillStyle === 'undefined') {
				this.fillStyle = null;
			}

			// Set strokeStyle to red.
			if (typeof options.strokeStyle === 'undefined') {
				this.strokeStyle = 'red';
			}

			// Set drawText to false as we will assume any text is part of the image.
			if (typeof options.drawText === 'undefined') {
				this.drawText = false;
			}

			// Also set the lineWidth to 1 so that segment overlay will look correct.
			if (typeof options.lineWidth === 'undefined') {
				this.lineWidth = 1;
			}

			// Set drawWheel to false as normally the image needs to be loaded first.
			if (typeof drawWheel === 'undefined') {
				drawWheel = false;
			}
		} else {
			// When in code drawMode the default is the wheel will draw.
			if (typeof drawWheel === 'undefined') {
				drawWheel = true;
			}
		}

		// Create pointer guide.
		if (options != null && options.pointerGuide && typeof options.pointerGuide !== 'undefined') {
			this.pointerGuide = new PointerGuide(options.pointerGuide);
		} else {
			this.pointerGuide = new PointerGuide();
		}

		// Check if the wheel is to be responsive, if so then need to save the original size of the canvas
		// and also check for data- attributes on the canvas which help control the scaling.
		if (this.responsive) {
			winwheelToDrawDuringAnimation = this;

			// Save the original defined width and height of the canvas, this is needed later to work out the scaling.
			this._originalCanvasWidth = this.canvas.width;
			this._originalCanvasHeight = this.canvas.height;

			// Get data-attributes on the canvas.
			this._responsiveScaleHeight = this.canvas.dataset.responsivescaleheight;
			this._responsiveMinWidth = this.canvas.dataset.responsiveminwidth;
			this._responsiveMinHeight = this.canvas.dataset.responsiveminheight;
			this._responsiveMargin = this.canvas.dataset.responsivemargin;
		}

		// Finally if drawWheel is true then call function to render the wheel, segment text, overlay etc.
		if (drawWheel === true) {
			this.draw(this.clearTheCanvas);
		} else if (this.drawMode === 'segmentImage') {
			// If segment image then loop though all the segments and load the images for them setting a callback
			// which will call the draw function of the wheel once all the images have been loaded.
			winwheelToDrawDuringAnimation = this;
			winhweelAlreadyDrawn = false;

			for (let y = 1; y <= this.numSegments; y++) {
				if (this.segments[y].image !== null) {
					this.segments[y].imgData = new Image();
					this.segments[y].imgData.onload = winwheelLoadedImage;
					this.segments[y].imgData.src = this.segments[y].image;
				}
			}
		}
	}

	getIndicatedSegment() {
		// Call function below to work this out and return the prizeNumber.
		let prizeNumber = this.getIndicatedSegmentNumber();

		// Then simply return the segment in the segments array at that position.
		return this.segments[prizeNumber];
	}

	updateSegmentSizes() {
		// If this object actually contains some segments
		if (this.segments) {
			// First add up the arc used for the segments where the size has been set.
			let arcUsed = 0;
			let numSet = 0;

			// Remember, to make it easy to access segments, the position of the segments in the array starts from 1 (not 0).
			for (let x = 1; x <= this.numSegments; x++) {
				if (this.segments[x].size !== null) {
					arcUsed += this.segments[x].size;
					numSet++;
				}
			}

			let arcLeft = 360 - arcUsed;

			// Create variable to hold how much each segment with non-set size will get in terms of degrees.
			let degreesEach = 0;

			if (arcLeft > 0) {
				degreesEach = arcLeft / (this.numSegments - numSet);
			}

			// ------------------------------------------
			// Now loop though and set the start and end angle of each segment.
			let currentDegree = 0;

			for (let x = 1; x <= this.numSegments; x++) {
				// Set start angle.
				this.segments[x].startAngle = currentDegree;

				// If the size is set then add this to the current degree to get the end, else add the degreesEach to it.
				if (this.segments[x].size) {
					currentDegree += this.segments[x].size;
				} else {
					currentDegree += degreesEach;
				}

				// Set end angle.
				this.segments[x].endAngle = currentDegree;
			}
		}
	}

	clearCanvas() {
		if (this.ctx) {
			this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
		}
	}

	draw(clearTheCanvas: boolean) {
		// If have the canvas context.
		if (this.ctx) {
			// Clear the canvas, unless told not to.
			if (typeof clearTheCanvas !== 'undefined') {
				if (clearTheCanvas) {
					this.clearCanvas();
				}
			} else {
				this.clearCanvas();
			}

			// Call functions to draw the segments and then segment text.
			if (this.drawMode === 'image') {
				// Draw the wheel by loading and drawing an image such as a png on the canvas.
				this.drawWheelImage();

				// If we are to draw the text, do so before the overlay is drawn
				// as this allows the overlay to be used to create some interesting effects.
				if (this.drawText === true) {
					this.drawSegmentText();
				}

				// If image overlay is true then call function to draw the segments over the top of the image.
				// This is useful during development to check alignment between where the code thinks the segments are and where they appear on the image.
				if (this.imageOverlay === true) {
					this.drawSegments();
				}
			} else if (this.drawMode === 'segmentImage') {
				// Draw the wheel by rendering the image for each segment.
				this.drawSegmentImages();

				// If we are to draw the text, do so before the overlay is drawn
				// as this allows the overlay to be used to create some interesting effects.
				if (this.drawText === true) {
					this.drawSegmentText();
				}

				// If image overlay is true then call function to draw the segments over the top of the image.
				// This is useful during development to check alignment between where the code thinks the segments are and where they appear on the image.
				if (this.imageOverlay === true) {
					this.drawSegments();
				}
			} else {
				// The default operation is to draw the segments using code via the canvas arc() method.
				this.drawSegments();

				// The text is drawn on top.
				if (this.drawText === true) {
					this.drawSegmentText();
				}
			}

			// If this class has pins.
			if (typeof this.pins !== 'undefined') {
				// If they are to be visible then draw them.
				if (this.pins.visible === true) {
					this.drawPins();
				}
			}

			// If pointer guide is display property is set to true then call function to draw the pointer guide.
			if (this.pointerGuide.display === true) {
				this.drawPointerGuide();
			}
		}
	}

	drawPins() {
		if (this.pins && this.pins.number) {
			// Get scaled centerX and centerY to use in the code below so pins will draw responsively too.
			let centerX = this.centerX * this.scaleFactor;
			let centerY = this.centerY * this.scaleFactor;
			let outerRadius = this.outerRadius * this.scaleFactor;

			// Check if the pin's size is to be responsive too, if so set the pinOuterRadius to a scaled version number.
			let pinOuterRadius = this.pins.outerRadius;
			let pinMargin = this.pins.margin;

			if (this.pins.responsive) {
				pinOuterRadius = this.pins.outerRadius * this.scaleFactor;
				pinMargin = this.pins.margin * this.scaleFactor;
			}

			// Work out the angle to draw each pin a which is simply 360 / the number of pins as they space evenly around.
			// ++ There is a slight oddity with the pins in that there is a pin at 0 and also one at 360 and these will be drawn
			// ++ directly over the top of each other. Also pins are 0 indexed which could possibly cause some confusion
			// ++ with the getCurrentPin function - for now this is just used for audio so probably not a problem.
			let pinSpacing = 360 / this.pins.number;

			for (let i = 1; i <= this.pins.number; i++) {
				this.ctx.save();

				// Set the stroke style and line width.
				this.ctx.strokeStyle = this.pins.strokeStyle;
				this.ctx.lineWidth = this.pins.lineWidth;
				this.ctx.fillStyle = this.pins.fillStyle;

				// Move to the center.
				this.ctx.translate(centerX, centerY);

				// Rotate to to the pin location which is i * the pinSpacing.
				this.ctx.rotate(this.degToRad(i * pinSpacing + this.rotationAngle));

				// Move back out.
				this.ctx.translate(-centerX, -centerY);

				// Create a path for the pin circle.
				this.ctx.beginPath();
				// x, y, radius, startAngle, endAngle.
				this.ctx.arc(
					centerX,
					centerY - outerRadius + pinOuterRadius + pinMargin,
					pinOuterRadius,
					0,
					2 * Math.PI
				);

				if (this.pins.fillStyle) {
					this.ctx.fill();
				}

				if (this.pins.strokeStyle) {
					this.ctx.stroke();
				}

				this.ctx.restore();
			}
		}
	}

	drawPointerGuide() {
		// Get scaled center x an y and also the outer radius.
		let centerX = this.centerX * this.scaleFactor;
		let centerY = this.centerY * this.scaleFactor;
		let outerRadius = this.outerRadius * this.scaleFactor;

		this.ctx.save();

		// Rotate the canvas to the line goes towards the location of the pointer.
		this.ctx.translate(centerX, centerY);
		this.ctx.rotate(this.degToRad(this.pointerAngle));
		this.ctx.translate(-centerX, -centerY);

		// Set line colour and width.
		this.ctx.strokeStyle = this.pointerGuide.strokeStyle;
		this.ctx.lineWidth = this.pointerGuide.lineWidth;

		// Draw from the center of the wheel outwards past the wheel outer radius.
		this.ctx.beginPath();
		this.ctx.moveTo(centerX, centerY);
		this.ctx.lineTo(centerX, -(outerRadius / 4));

		this.ctx.stroke();
		this.ctx.restore();
	}

	drawWheelImage() {
		// Double check the wheelImage property of this class is not null. This does not actually detect that an image
		// source was set and actually loaded so might get error if this is not the case. This is why the initial call
		// to draw() should be done from a wheelImage.onload callback as detailed in example documentation.
		if (this.wheelImage != null) {
			// Get the centerX and centerY in to variables, adjust by the scaleFactor.
			let centerX = this.centerX * this.scaleFactor;
			let centerY = this.centerY * this.scaleFactor;

			// Get the scaled width and height of the image.
			let scaledWidth = this.wheelImage.width * this.scaleFactor;
			let scaledHeight = this.wheelImage.height * this.scaleFactor;

			// Work out the correct X and Y to draw the image at. We need to get the center point of the image
			// aligned over the center point of the wheel, we can't just place it at 0, 0.
			let imageLeft = centerX - scaledWidth / 2;
			let imageTop = centerY - scaledHeight / 2;

			// Rotate and then draw the wheel.
			// We must rotate by the rotationAngle before drawing to ensure that image wheels will spin.
			this.ctx.save();
			this.ctx.translate(centerX, centerY);
			this.ctx.rotate(this.degToRad(this.rotationAngle));
			this.ctx.translate(-centerX, -centerY);

			// Draw the image passing the scaled width and height which will ensure the image will be responsive.
			this.ctx.drawImage(this.wheelImage, imageLeft, imageTop, scaledWidth, scaledHeight);

			this.ctx.restore();
		}
	}

	drawSegmentImages() {
		// Get the centerX and centerY of the wheel adjusted with the scale factor.
		let centerX = this.centerX * this.scaleFactor;
		let centerY = this.centerY * this.scaleFactor;

		// Draw the segments if there is at least one in the segments array.
		if (this.segments) {
			// Loop though and output all segments - position 0 of the array is not used, so start loop from index 1
			// this is to avoid confusion when talking about the first segment.
			for (let x = 1; x <= this.numSegments; x++) {
				// Get the segment object as we need it to read options from.
				let seg = this.segments[x];

				// Check image has loaded so a property such as height has a value.
				if (seg.imgData.height) {
					// Work out the correct X and Y to draw the image at which depends on the direction of the image.
					// Images can be created in 4 directions. North, South, East, West.
					// North: Outside at top, inside at bottom. Sits evenly over the 0 degrees angle.
					// South: Outside at bottom, inside at top. Sits evenly over the 180 degrees angle.
					// East: Outside at right, inside at left. Sits evenly over the 90 degrees angle.
					// West: Outside at left, inside at right. Sits evenly over the 270 degrees angle.
					let imageLeft = 0;
					let imageTop = 0;
					let imageAngle = 0;
					let imageDirection = '';

					// Get scaled width and height of the segment image.
					let scaledWidth = seg.imgData.width * this.scaleFactor;
					let scaledHeight = seg.imgData.height * this.scaleFactor;

					if (seg.imageDirection !== null) {
						imageDirection = seg.imageDirection;
					} else {
						imageDirection = this.imageDirection;
					}

					if (imageDirection === 'S') {
						// Left set so image sits half/half over the 180 degrees point.
						imageLeft = centerX - scaledWidth / 2;

						// Top so image starts at the centerY.
						imageTop = centerY;

						// Angle to draw the image is its starting angle + half its size.
						// Here we add 180 to the angle to the segment is poistioned correctly.
						imageAngle = seg.startAngle + 180 + (seg.endAngle - seg.startAngle) / 2;
					} else if (imageDirection === 'E') {
						// Left set so image starts and the center point.
						imageLeft = centerX;

						// Top is so that it sits half/half over the 90 degree point.
						imageTop = centerY - scaledHeight / 2;

						// Again get the angle in the center of the segment and add it to the rotation angle.
						// this time we need to add 270 to that to the segment is rendered the correct place.
						imageAngle = seg.startAngle + 270 + (seg.endAngle - seg.startAngle) / 2;
					} else if (imageDirection === 'W') {
						// Left is the centerX minus the width of the image.
						imageLeft = centerX - scaledWidth;

						// Top is so that it sits half/half over the 270 degree point.
						imageTop = centerY - scaledHeight / 2;

						// Again get the angle in the center of the segment and add it to the rotation angle.
						// this time we need to add 90 to that to the segment is rendered the correct place.
						imageAngle = seg.startAngle + 90 + (seg.endAngle - seg.startAngle) / 2;
					} else {
						// North is the default.
						// Left set so image sits half/half over the 0 degrees point.
						imageLeft = centerX - scaledWidth / 2;

						// Top so image is its height out (above) the center point.
						imageTop = centerY - scaledHeight;

						// Angle to draw the image is its starting angle + half its size.
						// this sits it half/half over the center angle of the segment.
						imageAngle = seg.startAngle + (seg.endAngle - seg.startAngle) / 2;
					}

					// --------------------------------------------------
					// Rotate to the position of the segment and then draw the image.
					this.ctx.save();
					this.ctx.translate(centerX, centerY);

					// So math here is the rotation angle of the wheel plus half way between the start and end angle of the segment.
					this.ctx.rotate(this.degToRad(this.rotationAngle + imageAngle));
					this.ctx.translate(-centerX, -centerY);

					// Draw the image passing the scaled width and height so that it can be responsive.
					this.ctx.drawImage(seg.imgData, imageLeft, imageTop, scaledWidth, scaledHeight);

					this.ctx.restore();
				} else {
					console.log(`Segment ${x} imgData is not loaded`);
				}
			}
		}
	}

	drawSegments = function () {
		// Again check have context in case this function was called directly and not via draw function.
		if (this.ctx) {
			// Draw the segments if there is at least one in the segments array.
			if (this.segments) {
				// Get scaled centerX and centerY and also scaled inner and outer radius.
				let centerX = this.centerX * this.scaleFactor;
				let centerY = this.centerY * this.scaleFactor;
				let innerRadius = this.innerRadius * this.scaleFactor;
				let outerRadius = this.outerRadius * this.scaleFactor;

				// Loop though and output all segments - position 0 of the array is not used, so start loop from index 1
				// this is to avoid confusion when talking about the first segment.
				for (let x = 1; x <= this.numSegments; x++) {
					// Get the segment object as we need it to read options from.
					let seg = this.segments[x];

					let fillStyle;
					let lineWidth;
					let strokeStyle;

					// Set the variables that defined in the segment, or use the default options.
					if (seg.fillStyle !== null) {
						fillStyle = seg.fillStyle;
					} else {
						fillStyle = this.fillStyle;
					}

					this.ctx.fillStyle = fillStyle;

					if (seg.lineWidth !== null) {
						lineWidth = seg.lineWidth;
					} else {
						lineWidth = this.lineWidth;
					}

					this.ctx.lineWidth = lineWidth;

					if (seg.strokeStyle !== null) {
						strokeStyle = seg.strokeStyle;
					} else {
						strokeStyle = this.strokeStyle;
					}

					this.ctx.strokeStyle = strokeStyle;

					// Check there is a strokeStyle or fillStyle, if not the segment is invisible so should not try to draw it otherwise a path is began but not ended.
					if (strokeStyle || fillStyle) {
						// Begin a path as the segment consists of an arc and 2 lines.
						this.ctx.beginPath();

						// If don't have an inner radius then move to the center of the wheel as we want a line out from the center
						// to the start of the arc for the outside of the wheel when we arc. Canvas will draw the connecting line for us.
						if (!this.innerRadius) {
							this.ctx.moveTo(centerX, centerY);
						} else {
							// Work out the x and y values for the starting point of the segment which is at its starting angle
							// but out from the center point of the wheel by the value of the innerRadius. Some correction for line width is needed.
							let iX =
								Math.cos(this.degToRad(seg.startAngle + this.rotationAngle - 90)) *
								(innerRadius - lineWidth / 2);
							let iY =
								Math.sin(this.degToRad(seg.startAngle + this.rotationAngle - 90)) *
								(innerRadius - lineWidth / 2);

							// Now move here relative to the center point of the wheel.
							this.ctx.moveTo(centerX + iX, centerY + iY);
						}

						// Draw the outer arc of the segment clockwise in direction -->
						this.ctx.arc(
							centerX,
							centerY,
							outerRadius,
							this.degToRad(seg.startAngle + this.rotationAngle - 90),
							this.degToRad(seg.endAngle + this.rotationAngle - 90),
							false
						);

						if (this.innerRadius) {
							// Draw another arc, this time anticlockwise <-- at the innerRadius between the end angle and the start angle.
							// Canvas will draw a connecting line from the end of the outer arc to the beginning of the inner arc completing the shape.
							this.ctx.arc(
								centerX,
								centerY,
								innerRadius,
								this.degToRad(seg.endAngle + this.rotationAngle - 90),
								this.degToRad(seg.startAngle + this.rotationAngle - 90),
								true
							);
						} else {
							// If no inner radius then we draw a line back to the center of the wheel.
							this.ctx.lineTo(centerX, centerY);
						}

						// Fill and stroke the segment. Only do either if a style was specified, if the style is null then
						// we assume the developer did not want that particular thing.
						// For example no stroke style so no lines to be drawn.
						if (fillStyle) {
							this.ctx.fill();
						}

						if (strokeStyle) {
							this.ctx.stroke();
						}
					}
				}
			}
		}
	};

	drawSegmentText() {
		// Again only draw the text if have a canvas context.
		if (this.ctx) {
			// Declare variables to hold the values. These are populated either with the value for the specific segment,
			// or if not specified then the global default value.
			let fontFamily;
			let fontSize;
			let fontWeight;
			let orientation;
			let alignment;
			let direction;
			let margin;
			let fillStyle;
			let strokeStyle;
			let lineWidth;
			let fontSetting;

			// Get the centerX and centerY scaled with the scale factor, also the same for outer and inner radius.
			let centerX = this.centerX * this.scaleFactor;
			let centerY = this.centerY * this.scaleFactor;
			let outerRadius = this.outerRadius * this.scaleFactor;
			let innerRadius = this.innerRadius * this.scaleFactor;

			// Loop though all the segments.
			for (let x = 1; x <= this.numSegments; x++) {
				// Save the context so it is certain that each segment text option will not affect the other.
				this.ctx.save();

				// Get the segment object as we need it to read options from.
				let seg = this.segments[x];

				// Check is text as no point trying to draw if there is no text to render.
				if (seg.text) {
					// Set values to those for the specific segment or use global default if null.
					if (seg.textFontFamily !== null) fontFamily = seg.textFontFamily;
					else fontFamily = this.textFontFamily;
					if (seg.textFontSize !== null) fontSize = seg.textFontSize;
					else fontSize = this.textFontSize;
					if (seg.textFontWeight !== null) fontWeight = seg.textFontWeight;
					else fontWeight = this.textFontWeight;
					if (seg.textOrientation !== null) orientation = seg.textOrientation;
					else orientation = this.textOrientation;
					if (seg.textAlignment !== null) alignment = seg.textAlignment;
					else alignment = this.textAlignment;
					if (seg.textDirection !== null) direction = seg.textDirection;
					else direction = this.textDirection;
					if (seg.textMargin !== null) margin = seg.textMargin;
					else margin = this.textMargin;
					if (seg.textFillStyle !== null) fillStyle = seg.textFillStyle;
					else fillStyle = this.textFillStyle;
					if (seg.textStrokeStyle !== null) strokeStyle = seg.textStrokeStyle;
					else strokeStyle = this.textStrokeStyle;
					if (seg.textLineWidth !== null) lineWidth = seg.textLineWidth;
					else lineWidth = this.textLineWidth;

					// Scale the font size and the margin by the scale factor so the text can be responsive.
					fontSize *= this.scaleFactor;
					margin *= this.scaleFactor;

					// ------------------------------
					// We need to put the font bits together in to one string.
					let fontSetting = '';

					if (fontWeight != null) {
						fontSetting += `${fontWeight} `;
					}

					if (fontSize != null) {
						fontSetting += `${fontSize}px `; // Fonts on canvas are always a px value.
					}

					if (fontFamily != null) {
						fontSetting += fontFamily;
					}

					// Now set the canvas context to the decided values.
					this.ctx.font = fontSetting;
					this.ctx.fillStyle = fillStyle;
					this.ctx.strokeStyle = strokeStyle;
					this.ctx.lineWidth = lineWidth;

					// Split the text in to multiple lines on the \n character.
					let lines = seg.text.split('\n');

					// Figure out the starting offset for the lines as when there are multiple lines need to center the text
					// vertically in the segment (when thinking of normal horozontal text).
					let lineOffset = 0 - fontSize * (lines.length / 2) + fontSize / 2;

					// The offset works great for horozontal and vertial text, also centered curved. But when the text is curved
					// and the alignment is outer then the multiline text should not have some text outside the wheel. Same if inner curved.
					if (orientation === 'curved' && (alignment === 'inner' || alignment === 'outer')) {
						lineOffset = 0;
					}

					for (let i = 0; i < lines.length; i++) {
						// If direction is reversed then do things differently than if normal (which is the default - see further down)
						if (direction === 'reversed') {
							// When drawing reversed or 'upside down' we need to do some trickery on our part.
							// The canvas text rendering function still draws the text left to right and the correct way up,
							// so we need to overcome this with rotating the opposite side of the wheel the correct way up then pulling the text
							// through the center point to the correct segment it is supposed to be on.
							if (orientation === 'horizontal') {
								if (alignment === 'inner') {
									this.ctx.textAlign = 'right';
								} else if (alignment === 'outer') {
									this.ctx.textAlign = 'left';
								} else {
									this.ctx.textAlign = 'center';
								}

								this.ctx.textBaseline = 'middle';

								// Work out the angle to rotate the wheel, this is in the center of the segment but on the opposite side of the wheel which is why do -180.
								let textAngle = this.degToRad(
									seg.endAngle - (seg.endAngle - seg.startAngle) / 2 + this.rotationAngle - 90 - 180
								);

								this.ctx.save();
								this.ctx.translate(centerX, centerY);
								this.ctx.rotate(textAngle);
								this.ctx.translate(-centerX, -centerY);

								if (alignment === 'inner') {
									// In reversed state the margin is subtracted from the innerX.
									// When inner the inner radius also comes in to play.
									if (fillStyle) {
										this.ctx.fillText(
											lines[i],
											centerX - innerRadius - margin,
											centerY + lineOffset
										);
									}

									if (strokeStyle) {
										this.ctx.strokeText(
											lines[i],
											centerX - innerRadius - margin,
											centerY + lineOffset
										);
									}
								} else if (alignment === 'outer') {
									// In reversed state the position is the center minus the radius + the margin for outer aligned text.
									if (fillStyle) {
										this.ctx.fillText(
											lines[i],
											centerX - outerRadius + margin,
											centerY + lineOffset
										);
									}

									if (strokeStyle) {
										this.ctx.strokeText(
											lines[i],
											centerX - outerRadius + margin,
											centerY + lineOffset
										);
									}
								} else {
									// In reversed state the everything in minused.
									if (fillStyle) {
										this.ctx.fillText(
											lines[i],
											centerX - innerRadius - (outerRadius - innerRadius) / 2 - margin,
											centerY + lineOffset
										);
									}

									if (strokeStyle) {
										this.ctx.strokeText(
											lines[i],
											centerX - innerRadius - (outerRadius - innerRadius) / 2 - margin,
											centerY + lineOffset
										);
									}
								}

								this.ctx.restore();
							} else if (orientation === 'vertical') {
								// See normal code further down for comments on how it works, this is similar by plus/minus is reversed.
								this.ctx.textAlign = 'center';

								// In reversed mode this are reversed.
								if (alignment === 'inner') {
									this.ctx.textBaseline = 'top';
								} else if (alignment === 'outer') {
									this.ctx.textBaseline = 'bottom';
								} else {
									this.ctx.textBaseline = 'middle';
								}

								let textAngle = seg.endAngle - (seg.endAngle - seg.startAngle) / 2 - 180;
								textAngle += this.rotationAngle;

								this.ctx.save();
								this.ctx.translate(centerX, centerY);
								this.ctx.rotate(this.degToRad(textAngle));
								this.ctx.translate(-centerX, -centerY);

								// ++ @TODO double-check the default of 0 is correct.
								let yPos = 0;
								if (alignment === 'outer') {
									yPos = centerY + outerRadius - margin;
								} else if (alignment === 'inner') {
									yPos = centerY + innerRadius + margin;
								}

								// I have found that the text looks best when a fraction of the font size is shaved off.
								let yInc = fontSize - fontSize / 9;

								// Loop though and output the characters.
								if (alignment === 'outer') {
									// In reversed mode outer means text in 6 o'clock segment sits at bottom of the wheel and we draw up.
									for (let c = lines[i].length - 1; c >= 0; c--) {
										let character = lines[i].charAt(c);

										if (fillStyle) {
											this.ctx.fillText(character, centerX + lineOffset, yPos);
										}

										if (strokeStyle) {
											this.ctx.strokeText(character, centerX + lineOffset, yPos);
										}

										yPos -= yInc;
									}
								} else if (alignment === 'inner') {
									// In reversed mode inner text is drawn from top of segment at 6 o'clock position to bottom of the wheel.
									for (let c = 0; c < lines[i].length; c++) {
										let character = lines[i].charAt(c);

										if (fillStyle) {
											this.ctx.fillText(character, centerX + lineOffset, yPos);
										}

										if (strokeStyle) {
											this.ctx.strokeText(character, centerX + lineOffset, yPos);
										}

										yPos += yInc;
									}
								} else if (alignment === 'center') {
									// Again for reversed this is the opposite of before.
									// If there is more than one character in the text then an adjustment to the position needs to be done.
									// What we are aiming for is to position the center of the text at the center point between the inner and outer radius.
									let centerAdjustment = 0;

									if (lines[i].length > 1) {
										centerAdjustment = (yInc * (lines[i].length - 1)) / 2;
									}

									let yPos =
										centerY +
										innerRadius +
										(outerRadius - innerRadius) / 2 +
										centerAdjustment +
										margin;

									for (let c = lines[i].length - 1; c >= 0; c--) {
										let character = lines[i].charAt(c);

										if (fillStyle) {
											this.ctx.fillText(character, centerX + lineOffset, yPos);
										}

										if (strokeStyle) {
											this.ctx.strokeText(character, centerX + lineOffset, yPos);
										}

										yPos -= yInc;
									}
								}

								this.ctx.restore();
							} else if (orientation === 'curved') {
								// There is no built in canvas function to draw text around an arc,
								// so we need to do this ourselves.
								let radius = 0;

								// Set the alignment of the text - inner, outer, or center by calculating
								// how far out from the center point of the wheel the text is drawn.
								if (alignment === 'inner') {
									// When alignment is inner the radius is the innerRadius plus any margin.
									radius = innerRadius + margin;
									this.ctx.textBaseline = 'top';
								} else if (alignment === 'outer') {
									// Outer it is the outerRadius minus any margin.
									radius = outerRadius - margin;
									this.ctx.textBaseline = 'bottom';

									// We need to adjust the radius in this case to take in to multiline text.
									// In this case the radius needs to be further out, not at the inner radius.
									radius -= fontSize * (lines.length - 1);
								} else if (alignment === 'center') {
									// When center we want the text halfway between the inner and outer radius.
									radius = innerRadius + margin + (outerRadius - innerRadius) / 2;
									this.ctx.textBaseline = 'middle';
								}

								// Set the angle to increment by when looping though and outputting the characters in the text
								// as we do this by rotating the wheel small amounts adding each character.
								let anglePerChar = 0;
								let drawAngle = 0;

								// If more than one character in the text then...
								if (lines[i].length > 1) {
									// Text is drawn from the left.
									this.ctx.textAlign = 'left';

									// Work out how much angle the text rendering loop below needs to rotate by for each character to render them next to each other.
									// I have discovered that 4 * the font size / 10 at 100px radius is the correct spacing for between the characters
									// using a monospace font, non monospace may look a little odd as in there will appear to be extra spaces between chars.
									anglePerChar = 4 * (fontSize / 10);

									// Work out what percentage the radius the text will be drawn at is of 100px.
									let radiusPercent = 100 / radius;

									// Then use this to scale up or down the anglePerChar value.
									// When the radius is less than 100px we need more angle between the letters, when radius is greater (so the text is further
									// away from the center of the wheel) the angle needs to be less otherwise the characters will appear further apart.
									anglePerChar *= radiusPercent;

									// Next we want the text to be drawn in the middle of the segment, without this it would start at the beginning of the segment.
									// To do this we need to work out how much arc the text will take up in total then subtract half of this from the center
									// of the segment so that it sits centred.
									let totalArc = anglePerChar * lines[i].length;

									// Now set initial draw angle to half way between the start and end of the segment.
									drawAngle = seg.startAngle + ((seg.endAngle - seg.startAngle) / 2 - totalArc / 2);
								} else {
									// The initial draw angle is the center of the segment when only one character.
									drawAngle = seg.startAngle + (seg.endAngle - seg.startAngle) / 2;

									// To ensure is dead-center the text alignment also needs to be centered.
									this.ctx.textAlign = 'center';
								}

								// ----------------------
								// Adjust the initial draw angle as needed to take in to account the rotationAngle of the wheel.
								drawAngle += this.rotationAngle;

								// And as with other 'reverse' text direction functions we need to subtract 180 degrees from the angle
								// because when it comes to draw the characters in the loop below we add the radius instead of subtract it.
								drawAngle -= 180;

								// ----------------------
								// Now the drawing itself.
								// In reversed direction mode we loop through the characters in the text backwards in order for them to appear on screen correctly
								for (let c = lines[i].length; c >= 0; c--) {
									this.ctx.save();

									let character = lines[i].charAt(c);

									// Rotate the wheel to the draw angle as we need to add the character at this location.
									this.ctx.translate(centerX, centerY);
									this.ctx.rotate(this.degToRad(drawAngle));
									this.ctx.translate(-centerX, -centerY);

									// Now draw the character directly below the center point of the wheel at the appropriate radius.
									// Note in the reversed mode we add the radius to the this.centerY instead of subtract.
									if (strokeStyle) {
										this.ctx.strokeText(character, centerX, centerY + radius + lineOffset);
									}

									if (fillStyle) {
										this.ctx.fillText(character, centerX, centerY + radius + lineOffset);
									}

									// Increment the drawAngle by the angle per character so next loop we rotate
									// to the next angle required to draw the character at.
									drawAngle += anglePerChar;

									this.ctx.restore();
								}
							}
						} else if (orientation === 'horizontal') {
							// Based on the text alignment, set the correct value in the context.
							if (alignment === 'inner') {
								this.ctx.textAlign = 'left';
							} else if (alignment === 'outer') {
								this.ctx.textAlign = 'right';
							} else {
								this.ctx.textAlign = 'center';
							}

							// Set this too.
							this.ctx.textBaseline = 'middle';

							// Work out the angle around the wheel to draw the text at, which is simply in the middle of the segment the text is for.
							// The rotation angle is added in to correct the annoyance with the canvas arc drawing functions which put the 0 degrees at the 3 oclock
							let textAngle = this.degToRad(
								seg.endAngle - (seg.endAngle - seg.startAngle) / 2 + this.rotationAngle - 90
							);

							// We need to rotate in order to draw the text because it is output horizontally, so to
							// place correctly around the wheel for all but a segment at 3 o'clock we need to rotate.
							this.ctx.save();
							this.ctx.translate(centerX, centerY);
							this.ctx.rotate(textAngle);
							this.ctx.translate(-centerX, -centerY);

							// --------------------------
							// Draw the text based on its alignment adding margin if inner or outer.
							if (alignment === 'inner') {
								// Inner means that the text is aligned with the inner of the wheel. If looking at a segment in in the 3 o'clock position
								// it would look like the text is left aligned within the segment.

								// Because the segments are smaller towards the inner of the wheel, in order for the text to fit is is a good idea that
								// a margin is added which pushes the text towards the outer a bit.

								// The inner radius also needs to be taken in to account as when inner aligned.

								// If fillstyle is set the draw the text filled in.
								if (fillStyle) {
									this.ctx.fillText(lines[i], centerX + innerRadius + margin, centerY + lineOffset);
								}

								// If stroke style is set draw the text outline.
								if (strokeStyle) {
									this.ctx.strokeText(lines[i], centerX + innerRadius + margin, centerY + lineOffset);
								}
							} else if (alignment === 'outer') {
								// Outer means the text is aligned with the outside of the wheel, so if looking at a segment in the 3 o'clock position
								// it would appear the text is right aligned. To position we add the radius of the wheel in to the equation
								// and subtract the margin this time, rather than add it.

								// I don't understand why, but in order of the text to render correctly with stroke and fill, the stroke needs to
								// come first when drawing outer, rather than second when doing inner.
								if (fillStyle) {
									this.ctx.fillText(lines[i], centerX + outerRadius - margin, centerY + lineOffset);
								}

								// If fillstyle the fill the text.
								if (strokeStyle) {
									this.ctx.strokeText(lines[i], centerX + outerRadius - margin, centerY + lineOffset);
								}
							} else {
								// In this case the text is to drawn centred in the segment.
								// Typically no margin is required, however even though centred the text can look closer to the inner of the wheel
								// due to the way the segments narrow in (is optical effect), so if a margin is specified it is placed on the inner
								// side so the text is pushed towards the outer.

								// If stoke style the stroke the text.
								if (fillStyle) {
									this.ctx.fillText(
										lines[i],
										centerX + innerRadius + (outerRadius - innerRadius) / 2 + margin,
										centerY + lineOffset
									);
								}

								// If fillstyle the fill the text.
								if (strokeStyle) {
									this.ctx.strokeText(
										lines[i],
										centerX + innerRadius + (outerRadius - innerRadius) / 2 + margin,
										centerY + lineOffset
									);
								}
							}

							// Restore the context so that wheel is returned to original position.
							this.ctx.restore();
						} else if (orientation === 'vertical') {
							// If vertical then we need to do this ourselves because as far as I am aware there is no option built in to html canvas
							// which causes the text to draw downwards or upwards one character after another.

							// In this case the textAlign is always center, but the baseline is either top or bottom
							// depending on if inner or outer alignment has been specified.
							this.ctx.textAlign = 'center';

							if (alignment === 'inner') {
								this.ctx.textBaseline = 'bottom';
							} else if (alignment === 'outer') {
								this.ctx.textBaseline = 'top';
							} else {
								this.ctx.textBaseline = 'middle';
							}

							// The angle to draw the text at is halfway between the end and the starting angle of the segment.
							let textAngle = seg.endAngle - (seg.endAngle - seg.startAngle) / 2;

							// Ensure the rotation angle of the wheel is added in, otherwise the test placement won't match
							// the segments they are supposed to be for.
							textAngle += this.rotationAngle;

							// Rotate so can begin to place the text.
							this.ctx.save();
							this.ctx.translate(centerX, centerY);
							this.ctx.rotate(this.degToRad(textAngle));
							this.ctx.translate(-centerX, -centerY);

							// Work out the position to start drawing in based on the alignment.
							// If outer then when considering a segment at the 12 o'clock position want to start drawing down from the top of the wheel.
							// ++ TODO check this as yPos did not seem to have a defualt before.
							let yPos = 0;

							if (alignment === 'outer') {
								yPos = centerY - outerRadius + margin;
							} else if (alignment === 'inner') {
								yPos = centerY - innerRadius - margin;
							}

							// We need to know how much to move the y axis each time.
							// This is not quite simply the font size as that puts a larger gap in between the letters
							// than expected, especially with monospace fonts. I found that shaving a little off makes it look "right".
							let yInc = fontSize - fontSize / 9;

							// Loop though and output the characters.
							if (alignment === 'outer') {
								// For this alignment we draw down from the top of a segment at the 12 o'clock position to simply
								// loop though the characters in order.
								for (let c = 0; c < lines[i].length; c++) {
									let character = lines[i].charAt(c);

									if (fillStyle) {
										this.ctx.fillText(character, centerX + lineOffset, yPos);
									}

									if (strokeStyle) {
										this.ctx.strokeText(character, centerX + lineOffset, yPos);
									}

									yPos += yInc;
								}
							} else if (alignment === 'inner') {
								// Here we draw from the inner of the wheel up, but in order for the letters in the text text to
								// remain in the correct order when reading, we actually need to loop though the text characters backwards.
								for (let c = lines[i].length - 1; c >= 0; c--) {
									let character = lines[i].charAt(c);

									if (fillStyle) {
										this.ctx.fillText(character, centerX + lineOffset, yPos);
									}

									if (strokeStyle) {
										this.ctx.strokeText(character, centerX + lineOffset, yPos);
									}

									yPos -= yInc;
								}
							} else if (alignment === 'center') {
								// This is the most complex of the three as we need to draw the text top down centred between the inner and outer of the wheel.
								// So logically we have to put the middle character of the text in the center then put the others each side of it.
								// In reality that is a really bad way to do it, we can achieve the same if not better positioning using a
								// variation on the method used for the rendering of outer aligned text once we have figured out the height of the text.

								// If there is more than one character in the text then an adjustment to the position needs to be done.
								// What we are aiming for is to position the center of the text at the center point between the inner and outer radius.
								let centerAdjustment = 0;

								if (lines[i].length > 1) {
									centerAdjustment = (yInc * (lines[i].length - 1)) / 2;
								}

								// Now work out where to start rendering the string. This is half way between the inner and outer of the wheel, with the
								// centerAdjustment included to correctly position texts with more than one character over the center.
								// If there is a margin it is used to push the text away from the center of the wheel.
								let yPos =
									centerY - innerRadius - (outerRadius - innerRadius) / 2 - centerAdjustment - margin;

								// Now loop and draw just like outer text rendering.
								for (let c = 0; c < lines[i].length; c++) {
									let character = lines[i].charAt(c);

									if (fillStyle) {
										this.ctx.fillText(character, centerX + lineOffset, yPos);
									}

									if (strokeStyle) {
										this.ctx.strokeText(character, centerX + lineOffset, yPos);
									}

									yPos += yInc;
								}
							}

							this.ctx.restore();
						} else if (orientation === 'curved') {
							// There is no built in canvas function to draw text around an arc, so
							// we need to do this ourselves.
							let radius = 0;

							// Set the alignment of the text - inner, outer, or center by calculating
							// how far out from the center point of the wheel the text is drawn.
							if (alignment === 'inner') {
								// When alignment is inner the radius is the innerRadius plus any margin.
								radius = innerRadius + margin;
								this.ctx.textBaseline = 'bottom';

								// We need to adjust the radius in this case to take in to multiline text.
								// In this case the radius needs to be further out, not at the inner radius.
								radius += fontSize * (lines.length - 1);
							} else if (alignment === 'outer') {
								// Outer it is the outerRadius minus any margin.
								radius = outerRadius - margin;
								this.ctx.textBaseline = 'top';
							} else if (alignment === 'center') {
								// When center we want the text halfway between the inner and outer radius.
								radius = innerRadius + margin + (outerRadius - innerRadius) / 2;
								this.ctx.textBaseline = 'middle';
							}

							// Set the angle to increment by when looping though and outputting the characters in the text
							// as we do this by rotating the wheel small amounts adding each character.
							let anglePerChar = 0;
							let drawAngle = 0;

							// If more than one character in the text then...
							if (lines[i].length > 1) {
								// Text is drawn from the left.
								this.ctx.textAlign = 'left';

								// Work out how much angle the text rendering loop below needs to rotate by for each character to render them next to each other.
								// I have discovered that 4 * the font size / 10 at 100px radius is the correct spacing for between the characters
								// using a monospace font, non monospace may look a little odd as in there will appear to be extra spaces between chars.
								anglePerChar = 4 * (fontSize / 10);

								// Work out what percentage the radius the text will be drawn at is of 100px.
								let radiusPercent = 100 / radius;

								// Then use this to scale up or down the anglePerChar value.
								// When the radius is less than 100px we need more angle between the letters, when radius is greater (so the text is further
								// away from the center of the wheel) the angle needs to be less otherwise the characters will appear further apart.
								anglePerChar *= radiusPercent;

								// Next we want the text to be drawn in the middle of the segment, without this it would start at the beginning of the segment.
								// To do this we need to work out how much arc the text will take up in total then subtract half of this from the center
								// of the segment so that it sits centred.
								let totalArc = anglePerChar * lines[i].length;

								// Now set initial draw angle to half way between the start and end of the segment.
								drawAngle = seg.startAngle + ((seg.endAngle - seg.startAngle) / 2 - totalArc / 2);
							} else {
								// The initial draw angle is the center of the segment when only one character.
								drawAngle = seg.startAngle + (seg.endAngle - seg.startAngle) / 2;

								// To ensure is dead-center the text alignment also needs to be centred.
								this.ctx.textAlign = 'center';
							}

							// ----------------------
							// Adjust the initial draw angle as needed to take in to account the rotationAngle of the wheel.
							drawAngle += this.rotationAngle;

							// ----------------------
							// Now the drawing itself.
							// Loop for each character in the text.
							for (let c = 0; c < lines[i].length; c++) {
								this.ctx.save();

								let character = lines[i].charAt(c);

								// Rotate the wheel to the draw angle as we need to add the character at this location.
								this.ctx.translate(centerX, centerY);
								this.ctx.rotate(this.degToRad(drawAngle));
								this.ctx.translate(-centerX, -centerY);

								// Now draw the character directly above the center point of the wheel at the appropriate radius.
								if (strokeStyle) {
									this.ctx.strokeText(character, centerX, centerY - radius + lineOffset);
								}

								if (fillStyle) {
									this.ctx.fillText(character, centerX, centerY - radius + lineOffset);
								}

								// Increment the drawAngle by the angle per character so next loop we rotate
								// to the next angle required to draw the character at.
								drawAngle += anglePerChar;

								this.ctx.restore();
							}
						}

						// Increment this ready for the next time.
						lineOffset += fontSize;
					}
				}

				// Restore so all text options are reset ready for the next text.
				this.ctx.restore();
			}
		}
	}

	degToRad(d: number) {
		return d * 0.017_453_292_519_943_295_7;
	}

	addSegment(options, position) {
		// Create a new segment object passing the options in.
		let newSegment = new Segment(options);

		// Increment the numSegments property of the class since new segment being added.
		this.numSegments++;
		let segmentPos;

		// Work out where to place the segment, the default is simply as a new segment at the end of the wheel.
		if (typeof position !== 'undefined') {
			// Because we need to insert the segment at this position, not overwrite it, we need to move all segments after this
			// location along one in the segments array, before finally adding this new segment at the specified location.
			for (let x = this.numSegments; x > position; x--) {
				this.segments[x] = this.segments[x - 1];
			}

			this.segments[position] = newSegment;
			segmentPos = position;
		} else {
			this.segments[this.numSegments] = newSegment;
			segmentPos = this.numSegments;
		}

		// Since a segment has been added the segment sizes need to be re-computed so call function to do this.
		this.updateSegmentSizes();

		// Return the segment object just created in the wheel (JavaScript will return it by reference), so that
		// further things can be done with it by the calling code if desired.
		return this.segments[segmentPos];
	}

	getSegmentAt(x: number, y: number) {
		let foundSegment = null;

		// Call function to return segment number.
		let segmentNumber = this.getSegmentNumberAt(x, y);

		// If found one then set found segment to pointer to the segment object.
		if (segmentNumber !== null) {
			foundSegment = this.segments[segmentNumber];
		}

		return foundSegment;
	}

	getSegmentNumberAt(x: number, y: number) {
		// Call function above to convert the raw x and y from the user's browser to canvas coordinates
		// i.e. top and left is top and left of canvas, not top and left of the user's browser.
		let loc = this.windowToCanvas(x, y);

		// ------------------------------------------
		// Now start the process of working out the segment clicked.
		// First we need to figure out the angle of an imaginary line between the centerX and centerY of the wheel and
		// the X and Y of the location (for example a mouse click).
		let topBottom;
		let leftRight;
		let adjacentSideLength;
		let oppositeSideLength;
		let hypotenuseSideLength;

		// Get the centerX and centerY scaled with the scale factor, also the same for outer and inner radius.
		let centerX = this.centerX * this.scaleFactor;
		let centerY = this.centerY * this.scaleFactor;
		let outerRadius = this.outerRadius * this.scaleFactor;
		let innerRadius = this.innerRadius * this.scaleFactor;

		// We will use right triangle maths with the TAN function.
		// The start of the triangle is the wheel center, the adjacent side is along the x axis, and the opposite side is along the y axis.

		// We only ever use positive numbers to work out the triangle and the center of the wheel needs to be considered as 0 for the numbers
		// in the maths which is why there is the subtractions below. We also remember what quadrant of the wheel the location is in as we
		// need this information later to add 90, 180, 270 degrees to the angle worked out from the triangle to get the position around a 360 degree wheel.
		if (loc.x > centerX) {
			adjacentSideLength = loc.x - centerX;
			leftRight = 'R'; // Location is in the right half of the wheel.
		} else {
			adjacentSideLength = centerX - loc.x;
			leftRight = 'L'; // Location is in the left half of the wheel.
		}

		if (loc.y > centerY) {
			oppositeSideLength = loc.y - centerY;
			topBottom = 'B'; // Bottom half of wheel.
		} else {
			oppositeSideLength = centerY - loc.y;
			topBottom = 'T'; // Top Half of wheel.
		}

		// Now divide opposite by adjacent to get tan value.
		let tanVal = oppositeSideLength / adjacentSideLength;

		// Use the tan function and convert results to degrees since that is what we work with.
		let result = (Math.atan(tanVal) * 180) / Math.PI;
		let locationAngle = 0;

		// We also need the length of the hypotenuse as later on we need to compare this to the outerRadius of the segment / circle.
		hypotenuseSideLength = Math.sqrt(
			oppositeSideLength * oppositeSideLength + adjacentSideLength * adjacentSideLength
		);

		// ------------------------------------------
		// Now to make sense around the wheel we need to alter the values based on if the location was in top or bottom half
		// and also right or left half of the wheel, by adding 90, 180, 270 etc. Also for some the initial locationAngle needs to be inverted.
		if (topBottom === 'T' && leftRight === 'R') {
			locationAngle = Math.round(90 - result);
		} else if (topBottom === 'B' && leftRight === 'R') {
			locationAngle = Math.round(result + 90);
		} else if (topBottom === 'B' && leftRight === 'L') {
			locationAngle = Math.round(90 - result + 180);
		} else if (topBottom === 'T' && leftRight === 'L') {
			locationAngle = Math.round(result + 270);
		}

		// ------------------------------------------
		// And now we have to adjust to make sense when the wheel is rotated from the 0 degrees either
		// positive or negative and it can be many times past 360 degrees.
		if (this.rotationAngle != 0) {
			let rotatedPosition = this.getRotationPosition();

			// So we have this, now we need to alter the locationAngle as a result of this.
			locationAngle -= rotatedPosition;

			// If negative then take the location away from 360.
			if (locationAngle < 0) {
				locationAngle = 360 - Math.abs(locationAngle);
			}
		}

		// ------------------------------------------
		// OK, so after all of that we have the angle of a line between the centerX and centerY of the wheel and
		// the X and Y of the location on the canvas where the mouse was clicked. Now time to work out the segment
		// this corresponds to. We can use the segment start and end angles for this.
		let foundSegmentNumber = null;

		for (let x = 1; x <= this.numSegments; x++) {
			// Due to segments sharing start and end angles, if line is clicked will pick earlier segment.
			if (locationAngle >= this.segments[x].startAngle && locationAngle <= this.segments[x].endAngle) {
				// To ensure that a click anywhere on the canvas in the segment direction will not cause a
				// segment to be matched, as well as the angles, we need to ensure the click was within the radius
				// of the segment (or circle if no segment radius).

				// If the hypotenuseSideLength (length of location from the center of the wheel) is with the radius
				// then we can assign the segment to the found segment and break out the loop.

				// Have to take in to account hollow wheels (doughnuts) so check is greater than innerRadius as
				// well as less than or equal to the outerRadius of the wheel.
				if (hypotenuseSideLength >= innerRadius && hypotenuseSideLength <= outerRadius) {
					foundSegmentNumber = x;
					break;
				}
			}
		}

		// Finally return the number.
		return foundSegmentNumber;
	}

	getIndicatedSegmentNumber() {
		let indicatedPrize = 0;
		let rawAngle = this.getRotationPosition();

		// Now we have the angle of the wheel, but we need to take in to account where the pointer is because
		// will not always be at the 12 o'clock 0 degrees location.
		let relativeAngle = Math.floor(this.pointerAngle - rawAngle);

		if (relativeAngle < 0) {
			relativeAngle = 360 - Math.abs(relativeAngle);
		}

		// Now we can work out the prize won by seeing what prize segment startAngle and endAngle the relativeAngle is between.
		for (let x = 1; x < this.segments.length; x++) {
			if (relativeAngle >= this.segments[x].startAngle && relativeAngle <= this.segments[x].endAngle) {
				indicatedPrize = x;
				break;
			}
		}

		return indicatedPrize;
	}

	getCurrentPinNumber() {
		let currentPin = 0;

		if (this.pins) {
			let rawAngle = this.getRotationPosition();

			// Now we have the angle of the wheel, but we need to take in to account where the pointer is because
			// will not always be at the 12 o'clock 0 degrees location.
			let relativeAngle = Math.floor(this.pointerAngle - rawAngle);

			if (relativeAngle < 0) {
				relativeAngle = 360 - Math.abs(relativeAngle);
			}

			// Work out the angle of the pins as this is simply 360 / the number of pins as they space evenly around.
			let pinSpacing = 360 / this.pins.number;
			let totalPinAngle = 0;

			// Now we can work out the pin by seeing what pins relativeAngle is between.
			for (let x = 0; x < this.pins.number; x++) {
				if (relativeAngle >= totalPinAngle && relativeAngle <= totalPinAngle + pinSpacing) {
					currentPin = x;
					break;
				}

				totalPinAngle += pinSpacing;
			}

			// Now if rotating clockwise we must add 1 to the current pin as we want the pin which has just passed
			// the pointer to be returned as the current pin, not the start of the one we are between.
			if (this.animation.direction === 'clockwise') {
				currentPin++;

				if (currentPin > this.pins.number) {
					currentPin = 0;
				}
			}
		}

		return currentPin;
	}

	getRotationPosition() {
		let rawAngle = this.rotationAngle; // Get current rotation angle of wheel.

		// If positive work out how many times past 360 this is and then take the floor of this off the rawAngle.
		if (rawAngle >= 0) {
			if (rawAngle > 360) {
				// Get floor of the number of times past 360 degrees.
				let timesPast360 = Math.floor(rawAngle / 360);

				// Take all this extra off to get just the angle 0-360 degrees.
				rawAngle -= 360 * timesPast360;
			}
		} else {
			// Is negative, need to take off the extra then convert in to 0-360 degree value
			// so if, for example, was -90 then final value will be (360 - 90) = 270 degrees.
			if (rawAngle < -360) {
				let timesPast360 = Math.ceil(rawAngle / 360); // Ceil when negative.

				rawAngle -= 360 * timesPast360; // Is minus because dealing with negative.
			}

			rawAngle = 360 + rawAngle; // Make in the range 0-360. Is plus because raw is still negative.
		}

		return rawAngle;
	}

	getRandomForSegment(segmentNumber: number) {
		let stopAngle = 0;

		if (segmentNumber) {
			if (typeof this.segments[segmentNumber] !== 'undefined') {
				let { startAngle } = this.segments[segmentNumber];
				let { endAngle } = this.segments[segmentNumber];
				let range = endAngle - startAngle - 2;

				if (range > 0) {
					stopAngle = startAngle + 1 + Math.floor(Math.random() * range);
				} else {
					console.log('Segment size is too small to safely get random angle inside it');
				}
			} else {
				console.log(`Segment ${segmentNumber} undefined`);
			}
		} else {
			console.log('Segment number not specified');
		}

		return stopAngle;
	}
}

class Pin {
	visible: boolean;
	outerRadius: number;
	number: number;
	fillStyle: string;
	strokeStyle: string;
	lineWidth: number;
	margin: number;

	constructor(options: any) {
		let defaultOptions = {
			visible: true, // In future there might be some functionality related to the pins even if they are not displayed.
			number: 36, // The number of pins. These are evenly distributed around the wheel.
			outerRadius: 3, // Radius of the pins which determines their size.
			fillStyle: 'grey', // Fill colour of the pins.
			strokeStyle: 'black', // Line colour of the pins.
			lineWidth: 1, // Line width of the pins.
			margin: 3 // The space between outside edge of the wheel and the pins.
		} as const;
	}
}

class Segment {

    constructor(options: any) {
        
    }
	let defaultOptions = {
		size: null, // Leave null for automatic. Valid values are degrees 0-360. Use percentToDegrees function if needed to convert.
		text: '', // Default is blank.
		fillStyle: null, // If null for the rest the global default will be used.
		strokeStyle: null,
		lineWidth: null,
		textFontFamily: null,
		textFontSize: null,
		textFontWeight: null,
		textOrientation: null,
		textAlignment: null,
		textDirection: null,
		textMargin: null,
		textFillStyle: null,
		textStrokeStyle: null,
		textLineWidth: null,
		image: null, // Name/path to the image
		imageDirection: null, // Direction of the image, can be set globally for the whole wheel.
		imgData: null // Image object created here and loaded with image data.
	};

	// Now loop through the default options and create properties of this class set to the value for
	// the option passed in if a value was, or if not then set the value of the default.
	for (let key in defaultOptions) {
		if (options != null && typeof options[key] !== 'undefined') {
			this[key] = options[key];
		} else {
			this[key] = defaultOptions[key];
		}
	}

	if (options != null) {
		for (let key in options) {
			if (typeof this[key] === 'undefined') {
				this[key] = options[key];
			}
		}
	}

	this.startAngle = 0;
	this.endAngle = 0;
}

// ====================================================================================================================
// Changes an image for a segment by setting a callback to render the wheel once the image has loaded.
// ====================================================================================================================
Segment.prototype.changeImage = function (image, imageDirection) {
	// Change image name, blank image data.
	this.image = image;
	this.imgData = null;

	// Set direction.
	if (imageDirection) {
		this.imageDirection = imageDirection;
	}

	// Set imgData to a new image object, change set callback and change src (just like in wheel constructor).
	winhweelAlreadyDrawn = false;
	this.imgData = new Image();
	this.imgData.onload = winwheelLoadedImage;
	this.imgData.src = this.image;
};

// ====================================================================================================================
// Class that is created as property of the wheel. Draws line from center of the wheel out to edge of canvas to
// indicate where the code thinks the pointer location is. Helpful to get alignment correct esp when using images.
// ====================================================================================================================
function PointerGuide(options) {
	let defaultOptions = {
		display: false,
		strokeStyle: 'red',
		lineWidth: 3
	};

	// Now loop through the default options and create properties of this class set to the value for
	// the option passed in if a value was, or if not then set the value of the default.
	for (let key in defaultOptions) {
		if (options != null && typeof options[key] !== 'undefined') {
			this[key] = options[key];
		} else {
			this[key] = defaultOptions[key];
		}
	}
}

// function winwheelPercentToDegrees(percentValue) {
// 	let degrees = 0;

// 	if (percentValue > 0 && percentValue <= 100) {
// 		let divider = percentValue / 100;
// 		degrees = 360 * divider;
// 	}

// 	return degrees;
// }

function winwheelLoadedImage() {
	winhweelAlreadyDrawn = false;
	winwheelToDrawDuringAnimation = null;
	// Prevent multiple drawings of the wheel which ocurrs without this check due to timing of function calls.
	if (!winhweelAlreadyDrawn) {
		// Set to 0.
		let winwheelImageLoadCount = 0;

		// Loop though all the segments of the wheel and check if image data loaded, if so increment counter.
		for (let i = 1; i <= winwheelToDrawDuringAnimation.numSegments; i++) {
			// Check the image data object is not null and also that the image has completed loading by checking
			// that a property of it such as the height has some sort of true value.
			if (
				winwheelToDrawDuringAnimation.segments[i].imgData != null &&
				winwheelToDrawDuringAnimation.segments[i].imgData.height
			) {
				winwheelImageLoadCount++;
			}
		}

		// If number of images loaded matches the segments then all the images for the wheel are loaded.
		if (winwheelImageLoadCount === winwheelToDrawDuringAnimation.numSegments) {
			// Call draw function to render the wheel.
			winhweelAlreadyDrawn = true;
			winwheelToDrawDuringAnimation.draw();
		}
	}
}
