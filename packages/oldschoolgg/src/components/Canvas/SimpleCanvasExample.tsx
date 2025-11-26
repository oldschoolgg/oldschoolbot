import { useEffect, useRef, useState } from 'react';
import { OSRSCanvas } from './OSRSCanvas';
import { loadOSRSFonts } from './fontLoader';

interface SimpleCanvasExampleProps {
	width?: number;
	height?: number;
}

/**
 * Simple example component that demonstrates OSRSCanvas text rendering
 * without requiring item spritesheets.
 */
export function SimpleCanvasExample({ width = 500, height = 400 }: SimpleCanvasExampleProps) {
	const canvasRef = useRef<HTMLCanvasElement>(null);
	const [isLoading, setIsLoading] = useState(true);
	const [error, setError] = useState<string | null>(null);

	useEffect(() => {
		let mounted = true;

		async function renderCanvas() {
			try {
				// Load fonts first
				await loadOSRSFonts();

				if (!mounted) return;

				// Create OSRSCanvas instance
				const osrsCanvas = new OSRSCanvas({
					width,
					height,
					sprite: null
				});

				// Draw background
				osrsCanvas.ctx.fillStyle = '#2d2d2d';
				osrsCanvas.ctx.fillRect(0, 0, width, height);

				// Draw a gradient background
				const gradient = osrsCanvas.ctx.createLinearGradient(0, 0, 0, height);
				gradient.addColorStop(0, '#1a1a1a');
				gradient.addColorStop(1, '#3d3933');
				osrsCanvas.ctx.fillStyle = gradient;
				osrsCanvas.ctx.fillRect(0, 0, width, height);

				// Draw title
				osrsCanvas.drawTitleText({
					text: 'OSRS Canvas Demo',
					x: width / 2,
					y: 40,
					center: true
				});

				// Draw various text examples
				let yPos = 80;
				const lineSpacing = 35;

				osrsCanvas.drawText({
					text: 'Welcome to the browser-based OSRS Canvas!',
					x: width / 2,
					y: yPos,
					center: true,
					color: OSRSCanvas.COLORS.WHITE,
					font: 'Compact'
				});

				yPos += lineSpacing;

				osrsCanvas.drawText({
					text: 'Different colors are supported:',
					x: 30,
					y: yPos,
					color: OSRSCanvas.COLORS.WHITE,
					font: 'Compact'
				});

				yPos += lineSpacing;

				// Color examples
				const colors = [
					{ name: 'Orange', color: OSRSCanvas.COLORS.ORANGE },
					{ name: 'Green', color: OSRSCanvas.COLORS.GREEN },
					{ name: 'Red', color: OSRSCanvas.COLORS.RED },
					{ name: 'Yellow', color: OSRSCanvas.COLORS.YELLOW },
					{ name: 'Purple', color: OSRSCanvas.COLORS.PURPLE },
					{ name: 'Magenta', color: OSRSCanvas.COLORS.MAGENTA }
				];

				colors.forEach(({ name, color }) => {
					osrsCanvas.drawText({
						text: `• ${name}`,
						x: 50,
						y: yPos,
						color,
						font: 'Compact'
					});
					yPos += lineSpacing;
				});

				// Draw a box
				osrsCanvas.ctx.fillStyle = '#474032';
				osrsCanvas.drawSquare(width - 200, 100, 170, 120);

				// Draw text inside the box
				osrsCanvas.drawText({
					text: 'This is a box with',
					x: width - 115,
					y: 130,
					center: true,
					color: OSRSCanvas.COLORS.WHITE,
					font: 'Compact'
				});

				osrsCanvas.drawText({
					text: 'multiple lines of',
					x: width - 115,
					y: 150,
					center: true,
					color: OSRSCanvas.COLORS.ORANGE,
					font: 'Compact'
				});

				osrsCanvas.drawText({
					text: 'centered text!',
					x: width - 115,
					y: 170,
					center: true,
					color: OSRSCanvas.COLORS.GREEN,
					font: 'Bold'
				});

				// Draw hollow square border around box
				osrsCanvas.ctx.strokeStyle = OSRSCanvas.COLORS.ORANGE;
				osrsCanvas.drawHollowSquare(width - 200, 100, 170, 120);

				// Draw text wrapping example
				yPos = height - 80;
				osrsCanvas.drawText({
					text: 'This is a very long text that will wrap across multiple lines when maxWidth is specified',
					x: width / 2,
					y: yPos,
					center: true,
					color: OSRSCanvas.COLORS.WHITE,
					font: 'Compact',
					maxWidth: width - 60,
					lineHeight: 18
				});

				// Copy the rendered canvas to our ref canvas
				if (canvasRef.current && mounted) {
					const ctx = canvasRef.current.getContext('2d');
					if (ctx) {
						ctx.drawImage(osrsCanvas.getCanvas(), 0, 0);
					}
				}

				setIsLoading(false);
			} catch (err) {
				console.error('Error rendering canvas:', err);
				if (mounted) {
					setError(err instanceof Error ? err.message : 'Failed to render canvas');
					setIsLoading(false);
				}
			}
		}

		renderCanvas();

		return () => {
			mounted = false;
		};
	}, [width, height]);

	if (error) {
		return (
			<div style={{ padding: '20px', color: 'red', fontFamily: 'sans-serif' }}>
				<h3>Error loading canvas</h3>
				<p>{error}</p>
				<small>Make sure the font files are available in /public/fonts/</small>
			</div>
		);
	}

	return (
		<div style={{ position: 'relative', display: 'inline-block' }}>
			{isLoading && (
				<div
					style={{
						position: 'absolute',
						top: 0,
						left: 0,
						right: 0,
						bottom: 0,
						display: 'flex',
						alignItems: 'center',
						justifyContent: 'center',
						background: 'rgba(0,0,0,0.7)',
						color: 'white',
						fontFamily: 'sans-serif',
						borderRadius: '4px'
					}}
				>
					Loading fonts...
				</div>
			)}
			<canvas
				ref={canvasRef}
				width={width}
				height={height}
				style={{
					border: '2px solid #8B7355',
					borderRadius: '4px',
					boxShadow: '0 4px 6px rgba(0,0,0,0.3)'
				}}
			/>
		</div>
	);
}
