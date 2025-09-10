export interface SpritePosition {
	x: number;
	y: number;
	width: number;
	height: number;
}

export interface GenerateOptions {
	images: string | string[];
	layout?: 'binpack' | 'grid';
	canvas?: 'skia' | 'node';
	format?: 'png' | 'jpeg' | 'webp';
	quality?: number;
	padding?: number;
	powerOfTwo?: boolean;
	columns?: number;
}

export type ImageData = {
	id: string;
	buffer: Buffer;
	width: number;
	height: number;
};

export type LayoutResult = {
	positions: Record<string, SpritePosition>;
	width: number;
	height: number;
};

export type ImageGroup = Record<string, ImageData>;

export type GenerateResult = {
	imageBuffer: Buffer;
} & LayoutResult;
