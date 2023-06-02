/*
    The MIT License (MIT)
    Copyright (c) 2012-2019 Douglas McKechie
*/
import { randFloat, sumArr } from "e";
import { Canvas } from "@napi-rs/canvas";

export function Winwheel(options, drawWheel) {
	let defaultOptions = {
		canvasId: "canvas", // Id of the canvas which the wheel is to draw on to.
		centerX: null, // X position of the center of the wheel. The default of these are null which means will be placed in center of the canvas.
		centerY: null, // Y position of the wheel center. If left null at time of construct the center of the canvas is used.
		outerRadius: null, // The radius of the outside of the wheel. If left null it will be set to the radius from the center of the canvas to its shortest side.
		innerRadius: 0, // Normally 0. Allows the creation of rings / doughnuts if set to value > 0. Should not exceed outer radius.
		numSegments: 1, // The number of segments. Need at least one to draw.
		drawMode: "code", // The draw mode. Possible values are 'code', 'image', 'segmentImage'. Default is code which means segments are drawn using canvas arc() function.
		rotationAngle: 0, // The angle of rotation of the wheel - 0 is 12 o'clock position.
		textFontFamily: "Arial", // Segment text font, you should use web safe fonts.
		textFontSize: 20, // Size of the segment text.
		textFontWeight: "bold", // Font weight.
		textOrientation: "horizontal", // Either horizontal, vertical, or curved.
		textAlignment: "center", // Either center, inner, or outer.
		textDirection: "normal", // Either normal or reversed. In normal mode for horizontal text in segment at 3 o'clock is correct way up, in reversed text at 9 o'clock segment is correct way up.
		textMargin: null, // Margin between the inner or outer of the wheel (depends on textAlignment).
		textFillStyle: "black", // This is basically the text colour.
		textStrokeStyle: null, // Basically the line colour for segment text, only looks good for large text so off by default.
		textLineWidth: 1, // Width of the lines around the text. Even though this defaults to 1, a line is only drawn if textStrokeStyle specified.
		fillStyle: "silver", // The segment background colour.
		strokeStyle: "black", // Segment line colour. Again segment lines only drawn if this is specified.
		lineWidth: 1, // Width of lines around segments.
		clearTheCanvas: true, // When set to true the canvas will be cleared before the wheel is drawn.
		imageOverlay: false, // If set to true in image drawing mode the outline of the segments will be displayed over the image. Does nothing in code drawMode.
		drawText: true, // By default the text of the segments is rendered in code drawMode and not in image drawMode.
		pointerAngle: 0, // Location of the pointer that indicates the prize when wheel has stopped. Default is 0 so the (corrected) 12 o'clock position.
		wheelImage: null, // Must be set to image data in order to use image to draw the wheel - drawMode must also be 'image'.
		imageDirection: "N", // Used when drawMode is segmentImage. Default is north, can also be (E)ast, (S)outh, (W)est.
		responsive: false, // If set to true the wheel will resize when the window first loads and also onResize.
		scaleFactor: 1, // Set by the responsive function. Used in many calculations to scale the wheel.
	};

	for (let key in defaultOptions) {
		if (options != null && typeof options[key] !== "undefined") {
			this[key] = options[key];
		} else {
			this[key] = defaultOptions[key];
		}
	}

	if (options != null) {
		for (let key in options) {
			if (typeof this[key] === "undefined") {
				this[key] = options[key];
			}
		}
	}

	const size = options.size ?? 500;
	this.canvas = new Canvas(size, size);

	if (this.centerX == null) {
		this.centerX = this.canvas.width / 2;
	}

	if (this.centerY == null) {
		this.centerY = this.canvas.height / 2;
	}

	if (this.outerRadius == null) {
		if (this.canvas.width < this.canvas.height) {
			this.outerRadius = this.canvas.width / 2 - this.lineWidth;
		} else {
			this.outerRadius = this.canvas.height / 2 - this.lineWidth;
		}
	}

	this.ctx = this.canvas.getContext("2d");

	this.ctx.font = '16px OSRSFontCompact';
	this.ctx.imageSmoothingEnabled = false;


	this.segments = new Array();
	const totalWeight = sumArr(options.segments.map((i) => i.weight));

	for (let x = 1; x <= this.numSegments; x++) {
		this.segments[x] = new Segment(options["segments"][x - 1]);
		this.segments[x].size = (this.segments[x].weight / totalWeight) * 360;
	}

	this.updateSegmentSizes();

	if (this.textMargin === null) {
		this.textMargin = this.textFontSize / 1.7;
	}

	if (
		options != null &&
		options["pins"] &&
		typeof options["pins"] !== "undefined"
	) {
		this.pins = new Pin(options["pins"]);
	}

	if (this.drawMode == "image" || this.drawMode == "segmentImage") {
		if (typeof options["fillStyle"] === "undefined") {
			this.fillStyle = null;
		}

		if (typeof options["strokeStyle"] === "undefined") {
			this.strokeStyle = "red";
		}

		if (typeof options["drawText"] === "undefined") {
			this.drawText = false;
		}

		if (typeof options["lineWidth"] === "undefined") {
			this.lineWidth = 1;
		}

		if (typeof drawWheel === "undefined") {
			drawWheel = false;
		}
	} else {
		if (typeof drawWheel === "undefined") {
			drawWheel = true;
		}
	}

	if (
		options != null &&
		options["pointerGuide"] &&
		typeof options["pointerGuide"] !== "undefined"
	) {
		this.pointerGuide = new PointerGuide(options["pointerGuide"]);
	} else {
		this.pointerGuide = new PointerGuide();
	}

	if (drawWheel == true) {
		this.draw(this.clearTheCanvas);
	} else if (this.drawMode == "segmentImage") {
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

Winwheel.prototype.updateSegmentSizes = function () {
	if (this.segments) {
		let arcUsed = 0;
		let numSet = 0;

		for (let x = 1; x <= this.numSegments; x++) {
			if (this.segments[x].size !== null) {
				arcUsed += this.segments[x].size;
				numSet++;
			}
		}

		let arcLeft = 360 - arcUsed;

		let degreesEach = 0;

		if (arcLeft > 0) {
			degreesEach = arcLeft / (this.numSegments - numSet);
		}

		let currentDegree = 0;

		for (let x = 1; x <= this.numSegments; x++) {
			this.segments[x].startAngle = currentDegree;

			if (this.segments[x].size) {
				currentDegree += this.segments[x].size;
			} else {
				currentDegree += degreesEach;
			}

			this.segments[x].endAngle = currentDegree;
		}
	}
};

Winwheel.prototype.clearCanvas = function () {
	if (this.ctx) {
		this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
	}
};

Winwheel.prototype.draw = function (clearTheCanvas) {
	if (this.ctx) {
		if (typeof clearTheCanvas !== "undefined") {
			if (clearTheCanvas == true) {
				this.clearCanvas();
			}
		} else {
			this.clearCanvas();
		}

		if (this.drawMode == "image") {
			this.drawWheelImage();

			if (this.drawText == true) {
				this.drawSegmentText();
			}

			if (this.imageOverlay == true) {
				this.drawSegments();
			}
		} else if (this.drawMode == "segmentImage") {
			this.drawSegmentImages();

			if (this.drawText == true) {
				this.drawSegmentText();
			}

			if (this.imageOverlay == true) {
				this.drawSegments();
			}
		} else {
			this.drawSegments();

			if (this.drawText == true) {
				this.drawSegmentText();
			}
		}

		if (typeof this.pins !== "undefined") {
			if (this.pins.visible == true) {
				this.drawPins();
			}
		}

		if (this.pointerGuide.display == true) {
			this.drawPointerGuide();
		}
	}
};

Winwheel.prototype.drawPins = function () {
	if (this.pins && this.pins.number) {
		let centerX = this.centerX * this.scaleFactor;
		let centerY = this.centerY * this.scaleFactor;
		let outerRadius = this.outerRadius * this.scaleFactor;

		let pinOuterRadius = this.pins.outerRadius;
		let pinMargin = this.pins.margin;

		if (this.pins.responsive) {
			pinOuterRadius = this.pins.outerRadius * this.scaleFactor;
			pinMargin = this.pins.margin * this.scaleFactor;
		}

		let pinSpacing = 360 / this.pins.number;

		for (let i = 1; i <= this.pins.number; i++) {
			this.ctx.save();

			this.ctx.strokeStyle = this.pins.strokeStyle;
			this.ctx.lineWidth = this.pins.lineWidth;
			this.ctx.fillStyle = this.pins.fillStyle;

			this.ctx.translate(centerX, centerY);

			this.ctx.rotate(this.degToRad(i * pinSpacing + this.rotationAngle));

			this.ctx.translate(-centerX, -centerY);

			this.ctx.beginPath();
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
};

Winwheel.prototype.drawPointerGuide = function () {
	if (this.ctx) {
		let centerX = this.centerX * this.scaleFactor;
		let centerY = this.centerY * this.scaleFactor;
		let outerRadius = this.outerRadius * this.scaleFactor;

		this.ctx.save();

		this.ctx.translate(centerX, centerY);
		this.ctx.rotate(this.degToRad(this.pointerAngle));
		this.ctx.translate(-centerX, -centerY);

		this.ctx.strokeStyle = this.pointerGuide.strokeStyle;
		this.ctx.lineWidth = this.pointerGuide.lineWidth;

		this.ctx.beginPath();
		this.ctx.moveTo(centerX, centerY);
		this.ctx.lineTo(centerX, -(outerRadius / 4));

		this.ctx.stroke();
		this.ctx.restore();
	}
};

Winwheel.prototype.drawWheelImage = function () {
	if (this.wheelImage != null) {
		let centerX = this.centerX * this.scaleFactor;
		let centerY = this.centerY * this.scaleFactor;

		let scaledWidth = this.wheelImage.width * this.scaleFactor;
		let scaledHeight = this.wheelImage.height * this.scaleFactor;

		let imageLeft = centerX - scaledWidth / 2;
		let imageTop = centerY - scaledHeight / 2;

		this.ctx.save();
		this.ctx.translate(centerX, centerY);
		this.ctx.rotate(this.degToRad(this.rotationAngle));
		this.ctx.translate(-centerX, -centerY);

		this.ctx.drawImage(
			this.wheelImage,
			imageLeft,
			imageTop,
			scaledWidth,
			scaledHeight
		);

		this.ctx.restore();
	}
};

Winwheel.prototype.drawSegmentImages = function () {
	if (this.ctx) {
		let centerX = this.centerX * this.scaleFactor;
		let centerY = this.centerY * this.scaleFactor;

		if (this.segments) {
			for (let x = 1; x <= this.numSegments; x++) {
				let seg = this.segments[x];

				if (seg.imgData.height) {
					let imageLeft = 0;
					let imageTop = 0;
					let imageAngle = 0;
					let imageDirection = "";

					let scaledWidth = seg.imgData.width * this.scaleFactor;
					let scaledHeight = seg.imgData.height * this.scaleFactor;

					if (seg.imageDirection !== null) {
						imageDirection = seg.imageDirection;
					} else {
						imageDirection = this.imageDirection;
					}

					if (imageDirection == "S") {
						imageLeft = centerX - scaledWidth / 2;

						// Top so image starts at the centerY.
						imageTop = centerY;

						imageAngle =
							seg.startAngle +
							180 +
							(seg.endAngle - seg.startAngle) / 2;
					} else if (imageDirection == "E") {
						imageLeft = centerX;

						imageTop = centerY - scaledHeight / 2;

						imageAngle =
							seg.startAngle +
							270 +
							(seg.endAngle - seg.startAngle) / 2;
					} else if (imageDirection == "W") {
						imageLeft = centerX - scaledWidth;
						imageTop = centerY - scaledHeight / 2;
						imageAngle =
							seg.startAngle +
							90 +
							(seg.endAngle - seg.startAngle) / 2;
					} else {
						imageLeft = centerX - scaledWidth / 2;
						imageTop = centerY - scaledHeight;
						imageAngle =
							seg.startAngle +
							(seg.endAngle - seg.startAngle) / 2;
					}
					this.ctx.save();
					this.ctx.translate(centerX, centerY);
					this.ctx.rotate(
						this.degToRad(this.rotationAngle + imageAngle)
					);
					this.ctx.translate(-centerX, -centerY);
					this.ctx.drawImage(
						seg.imgData,
						imageLeft,
						imageTop,
						scaledWidth,
						scaledHeight
					);
					this.ctx.restore();
				} else {
					console.log("Segment " + x + " imgData is not loaded");
				}
			}
		}
	}
};

Winwheel.prototype.drawSegments = function () {
	if (this.ctx) {
		if (this.segments) {
			let centerX = this.centerX * this.scaleFactor;
			let centerY = this.centerY * this.scaleFactor;
			let innerRadius = this.innerRadius * this.scaleFactor;
			let outerRadius = this.outerRadius * this.scaleFactor;
			for (let x = 1; x <= this.numSegments; x++) {
				let seg = this.segments[x];

				let fillStyle;
				let lineWidth;
				let strokeStyle;
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

				if (strokeStyle || fillStyle) {
					this.ctx.beginPath();
					if (!this.innerRadius) {
						this.ctx.moveTo(centerX, centerY);
					} else {
						let iX =
							Math.cos(
								this.degToRad(
									seg.startAngle + this.rotationAngle - 90
								)
							) *
							(innerRadius - lineWidth / 2);
						let iY =
							Math.sin(
								this.degToRad(
									seg.startAngle + this.rotationAngle - 90
								)
							) *
							(innerRadius - lineWidth / 2);

						this.ctx.moveTo(centerX + iX, centerY + iY);
					}

					this.ctx.arc(
						centerX,
						centerY,
						outerRadius,
						this.degToRad(seg.startAngle + this.rotationAngle - 90),
						this.degToRad(seg.endAngle + this.rotationAngle - 90),
						false
					);

					if (this.innerRadius) {
						this.ctx.arc(
							centerX,
							centerY,
							innerRadius,
							this.degToRad(
								seg.endAngle + this.rotationAngle - 90
							),
							this.degToRad(
								seg.startAngle + this.rotationAngle - 90
							),
							true
						);
					} else {
						this.ctx.lineTo(centerX, centerY);
					}

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

Winwheel.prototype.drawSegmentText = function () {
	if (this.ctx) {
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

		let centerX = this.centerX * this.scaleFactor;
		let centerY = this.centerY * this.scaleFactor;
		let outerRadius = this.outerRadius * this.scaleFactor;
		let innerRadius = this.innerRadius * this.scaleFactor;

		for (let x = 1; x <= this.numSegments; x++) {
			this.ctx.save();

			let seg = this.segments[x];

			if (seg.text) {
				if (seg.textFontFamily !== null)
					fontFamily = seg.textFontFamily;
				else fontFamily = this.textFontFamily;
				if (seg.textFontSize !== null) fontSize = seg.textFontSize;
				else fontSize = this.textFontSize;
				if (seg.textFontWeight !== null)
					fontWeight = seg.textFontWeight;
				else fontWeight = this.textFontWeight;
				if (seg.textOrientation !== null)
					orientation = seg.textOrientation;
				else orientation = this.textOrientation;
				if (seg.textAlignment !== null) alignment = seg.textAlignment;
				else alignment = this.textAlignment;
				if (seg.textDirection !== null) direction = seg.textDirection;
				else direction = this.textDirection;
				if (seg.textMargin !== null) margin = seg.textMargin;
				else margin = this.textMargin;
				if (seg.textFillStyle !== null) fillStyle = seg.textFillStyle;
				else fillStyle = this.textFillStyle;
				if (seg.textStrokeStyle !== null)
					strokeStyle = seg.textStrokeStyle;
				else strokeStyle = this.textStrokeStyle;
				if (seg.textLineWidth !== null) lineWidth = seg.textLineWidth;
				else lineWidth = this.textLineWidth;

				fontSize = fontSize * this.scaleFactor;
				margin = margin * this.scaleFactor;

				let fontSetting = "";

				if (fontWeight != null) {
					fontSetting += fontWeight + " ";
				}

				if (fontSize != null) {
					fontSetting += fontSize + "px "; // Fonts on canvas are always a px value.
				}

				if (fontFamily != null) {
					fontSetting += fontFamily;
				}

				this.ctx.font = fontSetting;
				this.ctx.fillStyle = fillStyle;
				this.ctx.strokeStyle = strokeStyle;
				this.ctx.lineWidth = lineWidth;

				let lines = seg.text.split("\n");

				let lineOffset =
					0 - fontSize * (lines.length / 2) + fontSize / 2;

				if (
					orientation == "curved" &&
					(alignment == "inner" || alignment == "outer")
				) {
					lineOffset = 0;
				}

				for (let i = 0; i < lines.length; i++) {
					if (direction == "reversed") {
						if (orientation == "horizontal") {
							if (alignment == "inner") {
								this.ctx.textAlign = "right";
							} else if (alignment == "outer") {
								this.ctx.textAlign = "left";
							} else {
								this.ctx.textAlign = "center";
							}

							this.ctx.textBaseline = "middle";

							let textAngle = this.degToRad(
								seg.endAngle -
									(seg.endAngle - seg.startAngle) / 2 +
									this.rotationAngle -
									90 -
									180
							);

							this.ctx.save();
							this.ctx.translate(centerX, centerY);
							this.ctx.rotate(textAngle);
							this.ctx.translate(-centerX, -centerY);

							if (alignment == "inner") {
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
							} else if (alignment == "outer") {
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
								if (fillStyle) {
									this.ctx.fillText(
										lines[i],
										centerX -
											innerRadius -
											(outerRadius - innerRadius) / 2 -
											margin,
										centerY + lineOffset
									);
								}

								if (strokeStyle) {
									this.ctx.strokeText(
										lines[i],
										centerX -
											innerRadius -
											(outerRadius - innerRadius) / 2 -
											margin,
										centerY + lineOffset
									);
								}
							}

							this.ctx.restore();
						} else if (orientation == "vertical") {
							this.ctx.textAlign = "center";
							if (alignment == "inner") {
								this.ctx.textBaseline = "top";
							} else if (alignment == "outer") {
								this.ctx.textBaseline = "bottom";
							} else {
								this.ctx.textBaseline = "middle";
							}

							let textAngle =
								seg.endAngle -
								(seg.endAngle - seg.startAngle) / 2 -
								180;
							textAngle += this.rotationAngle;

							this.ctx.save();
							this.ctx.translate(centerX, centerY);
							this.ctx.rotate(this.degToRad(textAngle));
							this.ctx.translate(-centerX, -centerY);

							let yPos = 0;
							if (alignment == "outer") {
								yPos = centerY + outerRadius - margin;
							} else if (alignment == "inner") {
								yPos = centerY + innerRadius + margin;
							}

							let yInc = fontSize - fontSize / 9;

							if (alignment == "outer") {
								for (let c = lines[i].length - 1; c >= 0; c--) {
									let character = lines[i].charAt(c);

									if (fillStyle) {
										this.ctx.fillText(
											character,
											centerX + lineOffset,
											yPos
										);
									}

									if (strokeStyle) {
										this.ctx.strokeText(
											character,
											centerX + lineOffset,
											yPos
										);
									}

									yPos -= yInc;
								}
							} else if (alignment == "inner") {
								for (let c = 0; c < lines[i].length; c++) {
									let character = lines[i].charAt(c);

									if (fillStyle) {
										this.ctx.fillText(
											character,
											centerX + lineOffset,
											yPos
										);
									}

									if (strokeStyle) {
										this.ctx.strokeText(
											character,
											centerX + lineOffset,
											yPos
										);
									}

									yPos += yInc;
								}
							} else if (alignment == "center") {
								let centerAdjustment = 0;

								if (lines[i].length > 1) {
									centerAdjustment =
										(yInc * (lines[i].length - 1)) / 2;
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
										this.ctx.fillText(
											character,
											centerX + lineOffset,
											yPos
										);
									}

									if (strokeStyle) {
										this.ctx.strokeText(
											character,
											centerX + lineOffset,
											yPos
										);
									}

									yPos -= yInc;
								}
							}

							this.ctx.restore();
						} else if (orientation == "curved") {
							let radius = 0;
							if (alignment == "inner") {
								radius = innerRadius + margin;
								this.ctx.textBaseline = "top";
							} else if (alignment == "outer") {
								radius = outerRadius - margin;
								this.ctx.textBaseline = "bottom";
								radius -= fontSize * (lines.length - 1);
							} else if (alignment == "center") {
								radius =
									innerRadius +
									margin +
									(outerRadius - innerRadius) / 2;
								this.ctx.textBaseline = "middle";
							}
							let anglePerChar = 0;
							let drawAngle = 0;

							if (lines[i].length > 1) {
								this.ctx.textAlign = "left";

								anglePerChar = 4 * (fontSize / 10);

								let radiusPercent = 100 / radius;

								anglePerChar = anglePerChar * radiusPercent;

								let totalArc = anglePerChar * lines[i].length;

								drawAngle =
									seg.startAngle +
									((seg.endAngle - seg.startAngle) / 2 -
										totalArc / 2);
							} else {
								drawAngle =
									seg.startAngle +
									(seg.endAngle - seg.startAngle) / 2;

								this.ctx.textAlign = "center";
							}

							drawAngle += this.rotationAngle;

							drawAngle -= 180;

							for (let c = lines[i].length; c >= 0; c--) {
								this.ctx.save();

								let character = lines[i].charAt(c);

								this.ctx.translate(centerX, centerY);
								this.ctx.rotate(this.degToRad(drawAngle));
								this.ctx.translate(-centerX, -centerY);

								if (strokeStyle) {
									this.ctx.strokeText(
										character,
										centerX,
										centerY + radius + lineOffset
									);
								}

								if (fillStyle) {
									this.ctx.fillText(
										character,
										centerX,
										centerY + radius + lineOffset
									);
								}

								drawAngle += anglePerChar;

								this.ctx.restore();
							}
						}
					} else {
						if (orientation == "horizontal") {
							if (alignment == "inner") {
								this.ctx.textAlign = "left";
							} else if (alignment == "outer") {
								this.ctx.textAlign = "right";
							} else {
								this.ctx.textAlign = "center";
							}

							this.ctx.textBaseline = "middle";

							let textAngle = this.degToRad(
								seg.endAngle -
									(seg.endAngle - seg.startAngle) / 2 +
									this.rotationAngle -
									90
							);

							this.ctx.save();
							this.ctx.translate(centerX, centerY);
							this.ctx.rotate(textAngle);
							this.ctx.translate(-centerX, -centerY);

							if (alignment == "inner") {
								if (fillStyle) {
									this.ctx.fillText(
										lines[i],
										centerX + innerRadius + margin,
										centerY + lineOffset
									);
								}

								if (strokeStyle) {
									this.ctx.strokeText(
										lines[i],
										centerX + innerRadius + margin,
										centerY + lineOffset
									);
								}
							} else if (alignment == "outer") {
								if (fillStyle) {
									this.ctx.fillText(
										lines[i],
										centerX + outerRadius - margin,
										centerY + lineOffset
									);
								}

								if (strokeStyle) {
									this.ctx.strokeText(
										lines[i],
										centerX + outerRadius - margin,
										centerY + lineOffset
									);
								}
							} else {
								if (fillStyle) {
									this.ctx.fillText(
										lines[i],
										centerX +
											innerRadius +
											(outerRadius - innerRadius) / 2 +
											margin,
										centerY + lineOffset
									);
								}

								if (strokeStyle) {
									this.ctx.strokeText(
										lines[i],
										centerX +
											innerRadius +
											(outerRadius - innerRadius) / 2 +
											margin,
										centerY + lineOffset
									);
								}
							}

							this.ctx.restore();
						} else if (orientation == "vertical") {
							this.ctx.textAlign = "center";

							if (alignment == "inner") {
								this.ctx.textBaseline = "bottom";
							} else if (alignment == "outer") {
								this.ctx.textBaseline = "top";
							} else {
								this.ctx.textBaseline = "middle";
							}

							let textAngle =
								seg.endAngle -
								(seg.endAngle - seg.startAngle) / 2;

							textAngle += this.rotationAngle;

							this.ctx.save();
							this.ctx.translate(centerX, centerY);
							this.ctx.rotate(this.degToRad(textAngle));
							this.ctx.translate(-centerX, -centerY);

							let yPos = 0;

							if (alignment == "outer") {
								yPos = centerY - outerRadius + margin;
							} else if (alignment == "inner") {
								yPos = centerY - innerRadius - margin;
							}

							let yInc = fontSize - fontSize / 9;

							if (alignment == "outer") {
								for (let c = 0; c < lines[i].length; c++) {
									let character = lines[i].charAt(c);

									if (fillStyle) {
										this.ctx.fillText(
											character,
											centerX + lineOffset,
											yPos
										);
									}

									if (strokeStyle) {
										this.ctx.strokeText(
											character,
											centerX + lineOffset,
											yPos
										);
									}

									yPos += yInc;
								}
							} else if (alignment == "inner") {
								for (let c = lines[i].length - 1; c >= 0; c--) {
									let character = lines[i].charAt(c);
									if (fillStyle) {
										this.ctx.fillText(
											character,
											centerX + lineOffset,
											yPos
										);
									}
									if (strokeStyle) {
										this.ctx.strokeText(
											character,
											centerX + lineOffset,
											yPos
										);
									}
									yPos -= yInc;
								}
							} else if (alignment == "center") {
								let centerAdjustment = 0;
								if (lines[i].length > 1) {
									centerAdjustment =
										(yInc * (lines[i].length - 1)) / 2;
								}
								let yPos =
									centerY -
									innerRadius -
									(outerRadius - innerRadius) / 2 -
									centerAdjustment -
									margin;

								for (let c = 0; c < lines[i].length; c++) {
									let character = lines[i].charAt(c);

									if (fillStyle) {
										this.ctx.fillText(
											character,
											centerX + lineOffset,
											yPos
										);
									}

									if (strokeStyle) {
										this.ctx.strokeText(
											character,
											centerX + lineOffset,
											yPos
										);
									}

									yPos += yInc;
								}
							}

							this.ctx.restore();
						} else if (orientation == "curved") {
							let radius = 0;

							if (alignment == "inner") {
								radius = innerRadius + margin;
								this.ctx.textBaseline = "bottom";

								radius += fontSize * (lines.length - 1);
							} else if (alignment == "outer") {
								radius = outerRadius - margin;
								this.ctx.textBaseline = "top";
							} else if (alignment == "center") {
								radius =
									innerRadius +
									margin +
									(outerRadius - innerRadius) / 2;
								this.ctx.textBaseline = "middle";
							}

							let anglePerChar = 0;
							let drawAngle = 0;

							if (lines[i].length > 1) {
								this.ctx.textAlign = "left";

								anglePerChar = 4 * (fontSize / 10);

								let radiusPercent = 100 / radius;

								anglePerChar = anglePerChar * radiusPercent;

								let totalArc = anglePerChar * lines[i].length;

								drawAngle =
									seg.startAngle +
									((seg.endAngle - seg.startAngle) / 2 -
										totalArc / 2);
							} else {
								drawAngle =
									seg.startAngle +
									(seg.endAngle - seg.startAngle) / 2;

								this.ctx.textAlign = "center";
							}

							drawAngle += this.rotationAngle;

							for (let c = 0; c < lines[i].length; c++) {
								this.ctx.save();

								let character = lines[i].charAt(c);

								this.ctx.translate(centerX, centerY);
								this.ctx.rotate(this.degToRad(drawAngle));
								this.ctx.translate(-centerX, -centerY);

								if (strokeStyle) {
									this.ctx.strokeText(
										character,
										centerX,
										centerY - radius + lineOffset
									);
								}

								if (fillStyle) {
									this.ctx.fillText(
										character,
										centerX,
										centerY - radius + lineOffset
									);
								}

								drawAngle += anglePerChar;

								this.ctx.restore();
							}
						}
					}

					lineOffset += fontSize;
				}
			}

			this.ctx.restore();
		}
	}
};

Winwheel.prototype.degToRad = function (d) {
	return d * 0.0174532925199432957;
};

Winwheel.prototype.setCenter = function (x, y) {
	this.centerX = x;
	this.centerY = y;
};

Winwheel.prototype.addSegment = function (options, position) {
	let newSegment = new Segment(options);

	this.numSegments++;
	let segmentPos;

	if (typeof position !== "undefined") {
		for (let x = this.numSegments; x > position; x--) {
			this.segments[x] = this.segments[x - 1];
		}

		this.segments[position] = newSegment;
		segmentPos = position;
	} else {
		this.segments[this.numSegments] = newSegment;
		segmentPos = this.numSegments;
	}

	this.updateSegmentSizes();

	return this.segments[segmentPos];
};

Winwheel.prototype.deleteSegment = function (position) {
	if (this.numSegments > 1) {
		if (typeof position !== "undefined") {
			for (let x = position; x < this.numSegments; x++) {
				this.segments[x] = this.segments[x + 1];
			}
		}

		this.segments[this.numSegments] = undefined;

		this.numSegments--;
		this.updateSegmentSizes();
	}
};

Winwheel.prototype.windowToCanvas = function (x, y) {
	let bbox = this.canvas.getBoundingClientRect();

	return {
		x: Math.floor(x - bbox.left * (this.canvas.width / bbox.width)),
		y: Math.floor(y - bbox.top * (this.canvas.height / bbox.height)),
	};
};

Winwheel.prototype.getSegmentAt = function (x, y) {
	let foundSegment = null;

	let segmentNumber = this.getSegmentNumberAt(x, y);

	if (segmentNumber !== null) {
		foundSegment = this.segments[segmentNumber];
	}

	return foundSegment;
};

Winwheel.prototype.getSegmentNumberAt = function (x, y) {
	let loc = this.windowToCanvas(x, y);

	let topBottom;
	let leftRight;
	let adjacentSideLength;
	let oppositeSideLength;
	let hypotenuseSideLength;

	let centerX = this.centerX * this.scaleFactor;
	let centerY = this.centerY * this.scaleFactor;
	let outerRadius = this.outerRadius * this.scaleFactor;
	let innerRadius = this.innerRadius * this.scaleFactor;

	if (loc.x > centerX) {
		adjacentSideLength = loc.x - centerX;
		leftRight = "R"; 
	} else {
		adjacentSideLength = centerX - loc.x;
		leftRight = "L"; 
	}

	if (loc.y > centerY) {
		oppositeSideLength = loc.y - centerY;
		topBottom = "B";
	} else {
		oppositeSideLength = centerY - loc.y;
		topBottom = "T";
	}

	let tanVal = oppositeSideLength / adjacentSideLength;

	let result = (Math.atan(tanVal) * 180) / Math.PI;
	let locationAngle = 0;

	hypotenuseSideLength = Math.sqrt(
		oppositeSideLength * oppositeSideLength +
			adjacentSideLength * adjacentSideLength
	);

	if (topBottom == "T" && leftRight == "R") {
		locationAngle = Math.round(90 - result);
	} else if (topBottom == "B" && leftRight == "R") {
		locationAngle = Math.round(result + 90);
	} else if (topBottom == "B" && leftRight == "L") {
		locationAngle = Math.round(90 - result + 180);
	} else if (topBottom == "T" && leftRight == "L") {
		locationAngle = Math.round(result + 270);
	}

	if (this.rotationAngle != 0) {
		let rotatedPosition = this.getRotationPosition();

		locationAngle = locationAngle - rotatedPosition;

		if (locationAngle < 0) {
			locationAngle = 360 - Math.abs(locationAngle);
		}
	}

	let foundSegmentNumber = null;

	for (let x = 1; x <= this.numSegments; x++) {
		if (
			locationAngle >= this.segments[x].startAngle &&
			locationAngle <= this.segments[x].endAngle
		) {
			if (
				hypotenuseSideLength >= innerRadius &&
				hypotenuseSideLength <= outerRadius
			) {
				foundSegmentNumber = x;
				break;
			}
		}
	}

	// Finally return the number.
	return foundSegmentNumber;
};

Winwheel.prototype.getIndicatedSegment = function () {
	let prizeNumber = this.getIndicatedSegmentNumber();
	return this.segments[prizeNumber];
};

Winwheel.prototype.getIndicatedSegmentNumber = function () {
	let indicatedPrize = 0;
	let rawAngle = this.getRotationPosition();
	let relativeAngle = Math.floor(this.pointerAngle - rawAngle);

	if (relativeAngle < 0) {
		relativeAngle = 360 - Math.abs(relativeAngle);
	}

	for (let x = 1; x < this.segments.length; x++) {
		if (
			relativeAngle >= this.segments[x]["startAngle"] &&
			relativeAngle <= this.segments[x]["endAngle"]
		) {
			indicatedPrize = x;
			break;
		}
	}

	return indicatedPrize;
};

Winwheel.prototype.getCurrentPinNumber = function () {
	let currentPin = 0;

	if (this.pins) {
		let rawAngle = this.getRotationPosition();

		let relativeAngle = Math.floor(this.pointerAngle - rawAngle);

		if (relativeAngle < 0) {
			relativeAngle = 360 - Math.abs(relativeAngle);
		}

		let pinSpacing = 360 / this.pins.number;
		let totalPinAngle = 0;

		for (let x = 0; x < this.pins.number; x++) {
			if (
				relativeAngle >= totalPinAngle &&
				relativeAngle <= totalPinAngle + pinSpacing
			) {
				currentPin = x;
				break;
			}

			totalPinAngle += pinSpacing;
		}

		if (this.animation.direction == "clockwise") {
			currentPin++;

			if (currentPin > this.pins.number) {
				currentPin = 0;
			}
		}
	}

	return currentPin;
};

Winwheel.prototype.getRotationPosition = function () {
	let rawAngle = this.rotationAngle; 

	if (rawAngle >= 0) {
		if (rawAngle > 360) {
			let timesPast360 = Math.floor(rawAngle / 360);

			rawAngle = rawAngle - 360 * timesPast360;
		}
	} else {
		if (rawAngle < -360) {
			let timesPast360 = Math.ceil(rawAngle / 360); 

			rawAngle = rawAngle - 360 * timesPast360; 
		}

		rawAngle = 360 + rawAngle;
	}

	return rawAngle;
};

Winwheel.prototype.startAnimation = function () {
	if (this.animation) {
		this.computeAnimation();

		winwheelToDrawDuringAnimation = this;

		let properties = new Array(null);
		properties[this.animation.propertyName] = this.animation.propertyValue; 
		properties["yoyo"] = this.animation.yoyo; 
		properties["repeat"] = this.animation.repeat;
		properties["ease"] = this.animation.easing;
		properties["onUpdate"] = winwheelAnimationLoop; 
		properties["onComplete"] = winwheelStopAnimation; 
		winwheelStopAnimation();
	}
};

Winwheel.prototype.stopAnimation = function (canCallback) {
	if (winwheelToDrawDuringAnimation) {
		if (winwheelToDrawDuringAnimation.tween) {
			winwheelToDrawDuringAnimation.tween.kill();
		}
		winwheelStopAnimation(canCallback);
	}
	winwheelToDrawDuringAnimation = this;
};

Winwheel.prototype.staticSpin = async function () {
	this.rotationAngle = randFloat(0, 360);
	this.draw();
	const winner = this.getIndicatedSegment();
	return {
		winner: winner.text,
		winnerIndex: this.getIndicatedSegmentNumber(),
		newCanvas:  this.canvas,
	};
};


Winwheel.prototype.getRandomForSegment = function (segmentNumber) {
	let stopAngle = 0;

	if (segmentNumber) {
		if (typeof this.segments[segmentNumber] !== "undefined") {
			let startAngle = this.segments[segmentNumber].startAngle;
			let endAngle = this.segments[segmentNumber].endAngle;
			let range = endAngle - startAngle - 2;

			if (range > 0) {
				stopAngle = startAngle + 1 + Math.floor(Math.random() * range);
			} else {
				console.log(
					"Segment size is too small to safely get random angle inside it"
				);
			}
		} else {
			console.log("Segment " + segmentNumber + " undefined");
		}
	} else {
		console.log("Segment number not specified");
	}

	return stopAngle;
};

function Pin(options) {
	let defaultOptions = {
		visible: true, // In future there might be some functionality related to the pins even if they are not displayed.
		number: 36, // The number of pins. These are evenly distributed around the wheel.
		outerRadius: 3, // Radius of the pins which determines their size.
		fillStyle: "grey", // Fill colour of the pins.
		strokeStyle: "black", // Line colour of the pins.
		lineWidth: 1, // Line width of the pins.
		margin: 3, // The space between outside edge of the wheel and the pins.
		responsive: false, // If set to true the diameter of the pin will resize when the wheel is responsive.
	};

	for (let key in defaultOptions) {
		if (options != null && typeof options[key] !== "undefined") {
			this[key] = options[key];
		} else {
			this[key] = defaultOptions[key];
		}
	}
	if (options != null) {
		for (let key in options) {
			if (typeof this[key] === "undefined") {
				this[key] = options[key];
			}
		}
	}
}


function Segment(options) {
	let defaultOptions = {
		size: null, // Leave null for automatic. Valid values are degrees 0-360. Use percentToDegrees function if needed to convert.
		text: "", // Default is blank.
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
		imgData: null, // Image object created here and loaded with image data.
	};

	for (let key in defaultOptions) {
		if (options != null && typeof options[key] !== "undefined") {
			this[key] = options[key];
		} else {
			this[key] = defaultOptions[key];
		}
	}

	if (options != null) {
		for (let key in options) {
			if (typeof this[key] === "undefined") {
				this[key] = options[key];
			}
		}
	}

	this.startAngle = 0;
	this.endAngle = 0;
}

Segment.prototype.changeImage = function (image, imageDirection) {
	this.image = image;
	this.imgData = null;

	if (imageDirection) {
		this.imageDirection = imageDirection;
	}

	winhweelAlreadyDrawn = false;
	this.imgData = new Image();
	this.imgData.onload = winwheelLoadedImage;
	this.imgData.src = this.image;
};

function PointerGuide(options) {
	let defaultOptions = {
		display: false,
		strokeStyle: "red",
		lineWidth: 3,
	};

	for (let key in defaultOptions) {
		if (options != null && typeof options[key] !== "undefined") {
			this[key] = options[key];
		} else {
			this[key] = defaultOptions[key];
		}
	}
}

function winwheelPercentToDegrees(percentValue) {
	let degrees = 0;

	if (percentValue > 0 && percentValue <= 100) {
		let divider = percentValue / 100;
		degrees = 360 * divider;
	}

	return degrees;
}

function winwheelAnimationLoop() {
	if (winwheelToDrawDuringAnimation) {
		if (winwheelToDrawDuringAnimation.animation.clearTheCanvas != false) {
			winwheelToDrawDuringAnimation.ctx.clearRect(
				0,
				0,
				winwheelToDrawDuringAnimation.canvas.width,
				winwheelToDrawDuringAnimation.canvas.height
			);
		}

		let callbackBefore =
			winwheelToDrawDuringAnimation.animation.callbackBefore;
		let callbackAfter =
			winwheelToDrawDuringAnimation.animation.callbackAfter;

		if (callbackBefore != null) {
			if (typeof callbackBefore === "function") {
				callbackBefore();
			}
		}

		winwheelToDrawDuringAnimation.draw(false);

		if (callbackAfter != null) {
			if (typeof callbackAfter === "function") {
				callbackAfter();
			}
		}
	}
}

let winwheelToDrawDuringAnimation = null;

function winwheelStopAnimation(canCallback) {
	if (canCallback != false) {
		let callback = winwheelToDrawDuringAnimation.animation.callbackFinished;

		if (callback != null) {
			if (typeof callback === "function") {
				callback(winwheelToDrawDuringAnimation.getIndicatedSegment());
			}
		}
	}
}

let winhweelAlreadyDrawn = false;

function winwheelLoadedImage() {
	if (winhweelAlreadyDrawn == false) {
		let winwheelImageLoadCount = 0;

		for (let i = 1; i <= winwheelToDrawDuringAnimation.numSegments; i++) {
			if (
				winwheelToDrawDuringAnimation.segments[i].imgData != null &&
				winwheelToDrawDuringAnimation.segments[i].imgData.height
			) {
				winwheelImageLoadCount++;
			}
		}

		if (
			winwheelImageLoadCount == winwheelToDrawDuringAnimation.numSegments
		) {
			winhweelAlreadyDrawn = true;
			winwheelToDrawDuringAnimation.draw();
		}
	}
}

function winwheelResize() {
	let margin = 40;

	if (
		typeof winwheelToDrawDuringAnimation._responsiveMargin !== "undefined"
	) {
		margin = winwheelToDrawDuringAnimation._responsiveMargin;
	}

	let width = window.innerWidth - margin;
	let minWidth = winwheelToDrawDuringAnimation._responsiveMinWidth;
	let minHeight = winwheelToDrawDuringAnimation._responsiveMinHeight;

	if (width < minWidth) {
		width = minWidth;
	} else if (width > winwheelToDrawDuringAnimation._originalCanvasWidth) {
		width = winwheelToDrawDuringAnimation._originalCanvasWidth;
	}

	let percent = width / winwheelToDrawDuringAnimation._originalCanvasWidth;

	winwheelToDrawDuringAnimation.canvas.width =
		winwheelToDrawDuringAnimation._originalCanvasWidth * percent;

	if (winwheelToDrawDuringAnimation._responsiveScaleHeight) {
		let height =
			winwheelToDrawDuringAnimation._originalCanvasHeight * percent;

		if (height < minHeight) {
			height = minHeight;
		} else if (
			height > winwheelToDrawDuringAnimation._originalCanvasHeight
		) {
			height = winwheelToDrawDuringAnimation._originalCanvasHeight;
		}

		winwheelToDrawDuringAnimation.canvas.height = height;
	}

	winwheelToDrawDuringAnimation.scaleFactor = percent;

	winwheelToDrawDuringAnimation.draw();
}
