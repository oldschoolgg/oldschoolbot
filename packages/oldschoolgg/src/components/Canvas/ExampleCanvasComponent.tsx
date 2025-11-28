import { useEffect, useRef, useState } from 'react';

import spriteSheetData from '../BankImage/items-spritesheet.json?url';
import spriteSheetImage from '../BankImage/items-spritesheet.png?url';
import { CanvasSpritesheet } from './CanvasSpritesheet';
import { OSRSCanvas } from './OSRSCanvas';

interface ExampleCanvasComponentProps {
	width?: number;
	height?: number;
	itemIds?: number[];
	title?: string;
}

export function ExampleCanvasComponent({
	width = 400,
	height = 300,
	itemIds = [2, 4, 6], // Example item IDs
	title = 'Example Canvas'
}: ExampleCanvasComponentProps) {
	const canvasRef = useRef<HTMLCanvasElement>(null);
	const [isLoading, setIsLoading] = useState(true);
	const [error, setError] = useState<string | null>(null);

	useEffect(() => {
		let mounted = true;

		async function loadSpritesheets() {
			try {
				const osrsItems = await CanvasSpritesheet.create(spriteSheetData, spriteSheetImage);

				// Optionally load BSO items spritesheet
				// const bsoItems = await CanvasSpritesheet.create(
				// 	'/sprites/bso-items.json',
				// 	'/sprites/bso-items.png'
				// );

				// Register spritesheets with OSRSCanvas
				OSRSCanvas.registerSpritesheets({
					osrsItems
					// bsoItems
				});
			} catch (err) {
				console.error('Failed to load spritesheets:', err);
				throw new Error('Failed to load spritesheets');
			}
		}

		async function renderCanvas() {
			try {
				// Load spritesheets
				await loadSpritesheets();

				if (!mounted) return;

				// Create OSRSCanvas instance
				const osrsCanvas = new OSRSCanvas({
					width,
					height,
					sprite: null // You can pass a sprite here for border/background
				});

				// Draw background
				osrsCanvas.ctx.fillStyle = '#3d3933';
				osrsCanvas.ctx.fillRect(0, 0, width, height);

				// Draw title
				osrsCanvas.drawTitleText({
					text: title,
					x: width / 2,
					y: 30,
					center: true
				});

				// Draw some descriptive text
				osrsCanvas.drawText({
					text: 'Items displayed below:',
					x: width / 2,
					y: 60,
					center: true,
					color: OSRSCanvas.COLORS.WHITE
				});

				// Draw items in a row
				const itemSpacing = 50;
				const startX = (width - itemIds.length * itemSpacing) / 2;
				const startY = 100;

				for (let i = 0; i < itemIds.length; i++) {
					try {
						await osrsCanvas.drawItemIDSprite({
							itemID: itemIds[i],
							x: startX + i * itemSpacing,
							y: startY,
							quantity: (i + 1) * 100 // Example quantities
						});
					} catch (err) {
						console.warn(`Failed to draw item ${itemIds[i]}:`, err);
					}
				}

				// Draw some additional text with different colors
				osrsCanvas.drawText({
					text: 'Green text example',
					x: width / 2,
					y: 200,
					center: true,
					color: OSRSCanvas.COLORS.GREEN,
					font: 'Compact'
				});

				osrsCanvas.drawText({
					text: 'Orange text example',
					x: width / 2,
					y: 220,
					center: true,
					color: OSRSCanvas.COLORS.ORANGE,
					font: 'Bold'
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
	}, [width, height, itemIds, title]);

	if (error) {
		return (
			<div style={{ padding: '20px', color: 'red' }}>
				<h3>Error loading canvas</h3>
				<p>{error}</p>
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
						background: 'rgba(0,0,0,0.5)',
						color: 'white'
					}}
				>
					Loading...
				</div>
			)}
			<canvas ref={canvasRef} width={width} height={height} style={{ border: '1px solid #ccc' }} />
		</div>
	);
}
