import { validateAuth } from "@/lib/auth-utils";
import { v2 as cloudinary } from "cloudinary";
import { NextRequest, NextResponse } from "next/server";

cloudinary.config({
    cloud_name: process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME,
    api_key: process.env.NEXT_PUBLIC_CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_SECRET_KEY,
    secure: true
});

function extractPublicId(url: string): string | null {
    if (!url) return null;

    const parts = url.split("/");
    const file = parts.pop();
    const folder = parts.pop();

    if (!file || !folder) return null;

    return `${folder}/${file.split(".")[0]}`;
}

export async function POST(request: NextRequest) {
    try{
        console.log('POST, upload image: ', request)
        const aValidTokenWasSent = await validateAuth(request)
    
        if (aValidTokenWasSent.status === 401) return NextResponse.json({ error: 'Token inválido', status: 401 })
    
        const timestamp = Math.floor(Date.now() / 1000);
    
        const signature = cloudinary.utils.api_sign_request(
            { timestamp, folder: "movies" },
            process.env.CLOUDINARY_SECRET_KEY!
        );
    
        return NextResponse.json({
            message: 'ok',
            status: 201,
            timestamp,
            signature,
            apiKey: process.env.NEXT_PUBLIC_CLOUDINARY_API_KEY,
            cloudName: process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME,
            folder: "movies"
        });
    } catch(error){
        return NextResponse.json({
            error: 'Erro interno no servidor ao realizar POST para upload de imagem',
            status: 500
        })
    }
}

export async function DELETE(request: NextRequest) {
    try {
        const aValidTokenWasSent = await validateAuth(request)

        if (aValidTokenWasSent.status === 401) return NextResponse.json({ error: 'Token inválido', status: 401 })

        const { imageUrl } = await request.json();

        if (!imageUrl)
            return NextResponse.json({ error: "URL não enviada" }, { status: 400 });

        const publicId = extractPublicId(imageUrl);

        if (!publicId)
            return NextResponse.json({ error: "public_id inválido" }, { status: 400 });

        await cloudinary.uploader.destroy(publicId);

        return NextResponse.json({ message: 'ok', status: 204 });

    } catch (err) {
        return NextResponse.json(
            { error: "Erro ao interno no servidor ao realizar DELETE de imagem" },
            { status: 500 }
        );
    }
}