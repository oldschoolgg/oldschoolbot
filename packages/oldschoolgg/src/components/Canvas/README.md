# OSRS Canvas - Browser Edition

This folder contains browser-compatible versions of the OSRS Canvas rendering system, refactored from the original Node.js (skia-canvas) implementation.

## Files

### Core Classes

- **`CanvasSpritesheet.ts`** - Manages spritesheets for item icons and other sprites
- **`OSRSCanvas.tsx`** - Main canvas class for rendering OSRS-style interfaces
- **`canvasUtil.ts`** - Utility functions for canvas operations (clipping, outlines, etc.)
- **`fontLoader.ts`** - Font loading utility for OSRS fonts

### Example Components

- **`SimpleCanvasExample.tsx`** - Basic example showing text rendering and colors
- **`ExampleCanvasComponent.tsx`** - Advanced example with item sprites

## Key Changes from Node.js Version

### Type Changes

| Node.js (skia-canvas) | Browser |
|----------------------|---------|
| `Canvas` | `HTMLCanvasElement` |
| `Image` | `HTMLImageElement` |
| `CanvasContext` | `CanvasRenderingContext2D` |
| `canvas.png` | `canvas.toBlob()` |
| `ctx.outlineText()` | `ctx.fillText()` / `ctx.strokeText()` |

### Loading Changes

#### Fonts
- **Before**: Loaded from disk using file paths
- **Now**: Loaded via `FontFace` API from URLs

#### Spritesheets
- **Before**: Loaded from disk using `readFileSync`
- **Now**: Loaded from URLs using `fetch()` and `Image` constructor

#### Canvas Module
- **Before**: Used global `CanvasModule.Spritesheet.OSRSItems`
- **Now**: Uses `OSRSCanvas.registerSpritesheets()` to register spritesheets

## Setup

### 1. Font Files

Place your OSRS font files in `/public/fonts/`:

```
/public/fonts/
  ├── osrs-font.ttf
  ├── osrs-font-compact.otf
  ├── osrs-font-bold.ttf
  ├── small-pixel.ttf
  └── osrs-font-quill-8.ttf
```

### 2. Spritesheet Files

Place your spritesheet JSON and PNG files in `/public/sprites/`:

```
/public/sprites/
  ├── osrs-items.json
  ├── osrs-items.png
  ├── bso-items.json (optional)
  └── bso-items.png (optional)
```

The JSON format should be:
```json
{
  "2": [x, y, width, height],
  "4": [x, y, width, height],
  ...
}
```

## Usage Examples

### Simple Text Rendering

```tsx
import { SimpleCanvasExample } from '@/components/Canvas/SimpleCanvasExample';

function MyPage() {
  return <SimpleCanvasExample width={500} height={400} />;
}
```

### With Item Sprites

```tsx
import { ExampleCanvasComponent } from '@/components/Canvas/ExampleCanvasComponent';

function MyPage() {
  return (
    <ExampleCanvasComponent
      width={600}
      height={400}
      itemIds={[2, 4, 6, 8, 10]}
      title="My Bank Tab"
    />
  );
}
```

### Manual Usage

```tsx
import { useEffect, useRef } from 'react';
import { OSRSCanvas } from '@/components/Canvas/OSRSCanvas';
import { CanvasSpritesheet } from '@/components/Canvas/CanvasSpritesheet';
import { loadOSRSFonts } from '@/components/Canvas/fontLoader';

function MyComponent() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    async function render() {
      // 1. Load fonts
      await loadOSRSFonts();

      // 2. Load and register spritesheets
      const osrsItems = await CanvasSpritesheet.create(
        '/sprites/osrs-items.json',
        '/sprites/osrs-items.png'
      );
      OSRSCanvas.registerSpritesheets({ osrsItems });

      // 3. Create canvas
      const canvas = new OSRSCanvas({
        width: 400,
        height: 300,
        sprite: null
      });

      // 4. Draw
      canvas.ctx.fillStyle = '#3d3933';
      canvas.ctx.fillRect(0, 0, 400, 300);

      canvas.drawTitleText({
        text: 'My Title',
        x: 200,
        y: 40,
        center: true
      });

      await canvas.drawItemIDSprite({
        itemID: 2,
        x: 50,
        y: 100,
        quantity: 1000
      });

      // 5. Copy to DOM canvas
      if (canvasRef.current) {
        const ctx = canvasRef.current.getContext('2d')!;
        ctx.drawImage(canvas.getCanvas(), 0, 0);
      }
    }

    render();
  }, []);

  return <canvas ref={canvasRef} width={400} height={300} />;
}
```

## API Reference

### OSRSCanvas

#### Constructor
```typescript
new OSRSCanvas({
  width: number,
  height: number,
  sprite?: IBgSprite | null
})
```

#### Static Methods

- `OSRSCanvas.registerSpritesheets({ osrsItems?, bsoItems? })` - Register spritesheets for item rendering
- `OSRSCanvas.getItemImage({ itemID })` - Get an image for an item ID
- `OSRSCanvas.drawBorder(ctx, sprite, titleLine?)` - Draw OSRS-style border

#### Instance Methods

- `drawText({ text, x, y, color?, font?, center?, maxWidth?, lineHeight? })` - Draw text
- `drawTitleText({ text, x, y, center? })` - Draw orange title text
- `drawItemIDSprite({ itemID, x, y, outline?, quantity?, textColor?, glow? })` - Draw an item sprite
- `drawSquare(x, y, w, h, color?)` - Draw filled rectangle
- `drawHollowSquare(x, y, w, h, color?)` - Draw rectangle outline
- `drawBackgroundPattern(sprite?)` - Draw repeating background
- `drawBorder(sprite?, titleLine?)` - Draw border
- `measureText(text, font?)` - Measure text dimensions
- `measureTextWidth(text, font?)` - Get text width
- `getCanvas()` - Get the underlying HTMLCanvasElement
- `toBuffer()` - Convert to Blob for download/upload

### CanvasSpritesheet

#### Static Methods

- `CanvasSpritesheet.create(jsonUrl, imageUrl)` - Load spritesheet from URLs

#### Instance Methods

- `has(spriteId)` - Check if sprite exists
- `getData(spriteId)` - Get sprite coordinates
- `getImage()` - Get the spritesheet image
- `drawSprite(ctx, spriteId, dx, dy, options?)` - Draw a sprite
- `getSprite(spriteId)` - Extract sprite as separate canvas
- `getAllSpriteIds()` - Get all sprite IDs

### Font Loader

- `loadOSRSFonts(fonts?)` - Load OSRS fonts (idempotent)
- `areFontsLoaded()` - Check if fonts are loaded
- `resetFontLoadingState()` - Reset loading state (for testing)

## Colors

Available via `OSRSCanvas.COLORS`:

- `ORANGE` - `#FF981F`
- `WHITE` - `#FFFFFF`
- `RED` - `#FF0000`
- `DARK_RED` - `#8F0000`
- `GREEN` - `#00FF00`
- `DARK_GREEN` - `#005F00`
- `YELLOW` - `#FFFF00`
- `PURPLE` - `#AC7FFF`
- `MAGENTA` - `#ff00f2`
- `LIGHT_CHOCOLATE` - `#494034`

## Fonts

Available via `OSRSCanvas.Fonts`:

- `Compact` - `16px OSRSFontCompact`
- `Bold` - `16px RuneScape Bold 12`
- `TinyPixel` - `10px Smallest Pixel-7`

## Notes

- All image/font loading is async and should be awaited
- Font loading is idempotent - calling `loadOSRSFonts()` multiple times is safe
- Spritesheets must be registered before calling `drawItemIDSprite()`
- The canvas uses `imageSmoothingEnabled = false` for pixel-perfect rendering
- Use `toBuffer()` to convert the canvas to a Blob for downloads or uploads
