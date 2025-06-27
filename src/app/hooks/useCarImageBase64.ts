import {useEffect, useState} from "react";

export function useCarImageBase64(
    marca: string,
    modello: string,
    anno?: number,
    cilindrata?: number
): { imgBase64: string | null; imgError: boolean } {
    const [imgBase64, setImgBase64] = useState<string | null>(null);
    const [imgError, setImgError] = useState(false);

    useEffect(() => {
        let isMounted = true;

        async function getOrFetchCarImageBase64() {
            const query = new URLSearchParams({marca, modello});
            if (anno) query.append("anno", anno.toString());
            const resDb = await fetch(`/api/autoFoto?${query.toString()}`);
            if (resDb.ok) {
                const {base64} = await resDb.json();
                if (base64) {
                    if (isMounted) {
                        if (base64.startsWith("data:image/gif")) {
                            setImgBase64(null);
                            setImgError(true);
                        } else {
                            setImgBase64(base64);
                        }
                    }
                    return;
                }
            }

            const searchTerm = [marca, modello, anno, cilindrata ? `${cilindrata}cc` : "", "png"]
                .filter(Boolean)
                .join(" ");
            const apiUrl = `https://www.carimagery.com/api.asmx/GetImageUrl?searchTerm=${encodeURIComponent(searchTerm)}`;
            const res = await fetch(apiUrl);
            const text = await res.text();
            const match = text.match(/<string[^>]*>(.*?)<\/string>/);
            if (match && match[1] && match[1].startsWith("http") && !match[1].includes("noimage")) {
                const imgRes = await fetch(match[1]);
                const blob = await imgRes.blob();
                const base64 = await new Promise<string>((resolve, reject) => {
                    const reader = new FileReader();
                    reader.onloadend = () => resolve(reader.result as string);
                    reader.onerror = reject;
                    reader.readAsDataURL(blob);
                });
                await fetch("/api/autoFoto", {
                    method: "POST",
                    headers: {"Content-Type": "application/json"},
                    body: JSON.stringify({marca, modello, anno: anno ?? null, base64}),
                });
                if (isMounted) {
                    if (base64.startsWith("data:image/gif")) {
                        setImgBase64(null);
                        setImgError(true);
                    } else {
                        setImgBase64(base64);
                    }
                }
                return;
            }
            if (isMounted) setImgError(true);
        }

        setImgBase64(null);
        setImgError(false);
        getOrFetchCarImageBase64();

        return () => {
            isMounted = false;
        };
    }, [marca, modello, anno, cilindrata]);

    return {imgBase64, imgError};
}