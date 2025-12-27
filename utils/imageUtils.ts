
export async function isAnimatedWebp(file: File): Promise<boolean> {
  const buffer = await file.arrayBuffer();
  const bytes = new Uint8Array(buffer);
  const header = new TextDecoder().decode(bytes);
  return header.includes("ANIM");
}

export async function validateImage(file: File, maxSizeMB = 10): Promise<string | null> {
  const MAX_FILE_SIZE = maxSizeMB * 1024 * 1024;

  if (!file.type.startsWith("image/")) {
    return "Envie apenas arquivos de imagem.";
  }

  if (file.size > MAX_FILE_SIZE) {
    return `A imagem deve ter no máximo ${maxSizeMB}MB.`;
  }

  if (file.type === "image/gif") {
    return "GIF animado não é permitido.";
  }

  if (file.type === "image/webp" && await isAnimatedWebp(file)) {
    return "Imagens WebP animadas não são permitidas.";
  }

  return null; 
}