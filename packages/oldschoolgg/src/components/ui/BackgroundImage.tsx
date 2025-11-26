import { useEffect, useState } from 'react';

export interface BackgroundImageProps {
	placeholderBackground?: string;
	base64Placeholder?: string;
	placeholderImageUrl?: string;
	imageUrl?: string;
	className?: string;
	style?: React.CSSProperties;
	children?: React.ReactNode;
	backgroundColor?: string;
	size?: 'cover' | 'contain' | string;
}

const videoExtensions = ['mp4', 'webm', 'ogg', 'mov'];

const isVideoUrl = (url: string): boolean => {
	return Boolean(url) && videoExtensions.some(_ext => url.includes(`.${_ext}`));
};

export const BackgroundImage: React.FC<BackgroundImageProps> = ({
	placeholderBackground = 'bg-gray-200',
	base64Placeholder = '',
	placeholderImageUrl = '',
	imageUrl = '',
	className = '',
	style = {},
	children,
	size = 'cover',
	backgroundColor,
	...rest
}) => {
	const [currentImage, setCurrentImage] = useState('');
	const [isVideo, setIsVideo] = useState(false);
	useEffect(() => {
		setIsVideo(isVideoUrl(imageUrl));

		if (base64Placeholder) {
			setCurrentImage(`url(${base64Placeholder})`);
		} else if (placeholderImageUrl) {
			setCurrentImage(`url(${placeholderImageUrl})`);
		}

		if (imageUrl && !isVideo) {
			const img = new Image();
			img.src = imageUrl;
			img.onload = () => setCurrentImage(`url(${imageUrl})`);
		}
	}, [imageUrl, base64Placeholder, placeholderImageUrl, isVideo]);

	if (placeholderBackground && !currentImage) {
		backgroundColor = placeholderBackground;
	}

	return (
		<div
			className={`-z-50 relative overflow-hidden ${!isVideo ? 'bg-center bg-no-repeat' : ''} ${placeholderBackground} ${className}`}
			style={{
				backgroundImage: !isVideo ? currentImage : 'none',
				backgroundColor: placeholderBackground,
				backgroundSize: size,
				...style
			}}
			{...rest}
		>
			{isVideo && imageUrl && (
				<video
					src={imageUrl}
					className="absolute top-1/2 left-1/2 w-full h-full object-cover -translate-x-1/2 -translate-y-1/2 z-0"
					autoPlay
					loop
					playsInline
					style={
						placeholderImageUrl
							? {
									backgroundImage: `url(${placeholderImageUrl})`,
									backgroundSize: 'cover',
									backgroundPosition: 'center',
									backgroundRepeat: 'no-repeat',
									backgroundColor: placeholderBackground
								}
							: {}
					}
				/>
			)}
			{children && <div className="relative z-[1]">{children}</div>}
		</div>
	);
};
