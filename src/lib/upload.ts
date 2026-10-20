export async function uploadFileToR2(
    file: File | Blob,
    folder: string = 'properties',
    customFileName?: string
): Promise<string> {
    const formData = new FormData();
    if (customFileName && file instanceof Blob && !(file instanceof File)) {
        formData.append('file', file, customFileName);
    } else {
        formData.append('file', file);
    }
    formData.append('folder', folder);

    const res = await fetch('/api/upload', {
        method: 'POST',
        body: formData,
    });

    const data = await res.json();

    if (!res.ok || !data.success || !data.url) {
        throw new Error(data.error || 'Erro ao realizar upload no Cloudflare R2');
    }

    return data.url;
}
