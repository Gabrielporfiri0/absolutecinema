import { localStorageUtil } from "@/lib/localStorage_";
import axios from "axios";

export const NOT_FOUND_SESSION_ERROR_MESSAGE = "Sessão não encontrada. Faça login novamente."

const getAuthHeaders = () => {
    const cookie = localStorageUtil.getItem('accessToken')
    if (!cookie) {
        throw new Error(NOT_FOUND_SESSION_ERROR_MESSAGE);
    }

    return cookie
}

export const fileUploadService = {
  uploadImage: async (file: File): Promise<string> => {
    const authorizationHeader = getAuthHeaders()
    const sig = await axios.post("/api/fileUpload", {}, { 
      headers: { 
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${authorizationHeader}`
      } 
    });

    const { timestamp, signature, apiKey, cloudName, folder } = sig.data;

    const formData = new FormData();
    formData.append("file", file);
    formData.append("api_key", apiKey);
    formData.append("timestamp", timestamp);
    formData.append("signature", signature);
    formData.append("folder", folder);

    const upload = await axios.post(
      `https://api.cloudinary.com/v1_1/${cloudName}/image/upload`,
      formData
    );

    const imageUrl: string = upload.data.secure_url;

    const optimizedUrl = imageUrl.replace("/upload/", "/upload/f_auto,q_auto/");

    return optimizedUrl;
  },
  deleteImage: async (imageUrl: string) => {
    const authorizationHeader = getAuthHeaders()

    const response = await axios.delete("/api/fileUpload", {
      data: { imageUrl },
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${authorizationHeader}`
      }
    });

    return response
  }
};