import React from 'react';

export function useImage(url: string) {
	const [image, setImage] = React.useState<HTMLImageElement | null>(null);

	React.useEffect(() => {
		if (!url) return;
		const img = document.createElement('img');

		function onload() {
			setImage(img);
		}

		img.addEventListener('load', onload);
		img.src = url;

		return function cleanup() {
			img.removeEventListener('load', onload);
			setImage(null);
		};
	}, [url]);

	return [image];
}
