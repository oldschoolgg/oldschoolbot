# Quick Start Guide

## 1. Install Required Assets

### Fonts
Download and place OSRS fonts in `/public/fonts/`:
- `osrs-font-compact.otf`
- `osrs-font-bold.ttf`
- `small-pixel.ttf`

### Spritesheets (for item rendering)
Place in `/public/sprites/`:
- `osrs-items.json`
- `osrs-items.png`

## 2. Basic Example (No Items)

```tsx
import { SimpleCanvasExample } from '@/components/Canvas';

export default function MyPage() {
  return (
    <div>
      <h1>My OSRS Canvas</h1>
      <SimpleCanvasExample width={500} height={400} />
    </div>
  );
}
```

## 3. Example with Items

```tsx
import { ExampleCanvasComponent } from '@/components/Canvas';

export default function MyPage() {
  return (
    <ExampleCanvasComponent
      width={600}
      height={400}
      itemIds={[995, 2, 4, 6]} // Coins, cannonball, etc.
      title="My Items"
    />
  );
}
```

## 4. Custom Canvas Rendering

```tsx
import { useState, useEffect, useRef } from 'react';
import { OSRSCanvas, loadOSRSFonts } from '@/components/Canvas';

export default function CustomCanvas() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function render() {
      // Load fonts
      await loadOSRSFonts();

      // Create canvas
      const canvas = new OSRSCanvas({ width: 400, height: 300 });

      // Draw background
      canvas.ctx.fillStyle = '#3d3933';
      canvas.ctx.fillRect(0, 0, 400, 300);

      // Draw text
      canvas.drawTitleText({
        text: 'Hello OSRS!',
        x: 200,
        y: 150,
        center: true
      });

      // Copy to DOM
      const ctx = canvasRef.current?.getContext('2d');
      if (ctx) {
        ctx.drawImage(canvas.getCanvas(), 0, 0);
      }

      setLoading(false);
    }

    render();
  }, []);

  if (loading) return <div>Loading...</div>;

  return <canvas ref={canvasRef} width={400} height={300} />;
}
```

## 5. Download Canvas as Image

```tsx
import { OSRSCanvas, loadOSRSFonts } from '@/components/Canvas';

async function generateAndDownload() {
  await loadOSRSFonts();

  const canvas = new OSRSCanvas({ width: 400, height: 300 });

  // ... draw your content ...

  // Convert to blob and download
  const blob = await canvas.toBuffer();
  const url = URL.createObjectURL(blob);

  const a = document.createElement('a');
  a.href = url;
  a.download = 'canvas.png';
  a.click();

  URL.revokeObjectURL(url);
}
```

## Common Issues

### Fonts not loading
- Check that font files are in `/public/fonts/`
- Check browser console for 404 errors
- Make sure fonts are in the correct format (.ttf, .otf)

### Items not showing
- Ensure spritesheets are registered: `OSRSCanvas.registerSpritesheets({ osrsItems })`
- Check that JSON file has correct format: `{ "itemId": [x, y, w, h], ... }`
- Verify sprite PNG file is accessible

### Canvas is blurry
- Don't scale the canvas with CSS, use the width/height props
- OSRSCanvas automatically disables image smoothing for pixel-perfect rendering

## Next Steps

- Read the full [README.md](./README.md) for complete API documentation
- Check out the example components for inspiration
- Customize colors using `OSRSCanvas.COLORS`
