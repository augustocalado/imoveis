type ImageLoaderProps = {
    src: string;
    width: number;
    quality?: number;
};

export default function imageLoader({ src, width, quality }: ImageLoaderProps) {
    const q = quality || 70;
    return `/api/img?url=${encodeURIComponent(src)}&w=${width}&q=${q}`;
}
