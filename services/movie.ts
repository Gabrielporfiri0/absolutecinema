import { localStorageUtil } from "@/lib/localStorage_";
import { MovieDataToSent } from "@/types/movies";
import axios from "axios";

export const NOT_FOUND_SESSION_ERROR_MESSAGE = "Sessão não encontrada. Faça login novamente."

const getAuthHeaders = () => {
    const cookie = localStorageUtil.getItem('acessToken')
    if (!cookie) {
        throw new Error(NOT_FOUND_SESSION_ERROR_MESSAGE);
    }

    return {
        'Authorization': `Bearer ${cookie}`
    }
}

export const movieService = {
    create: async (data: MovieDataToSent, token: string) => {
        const authorizationHeader = getAuthHeaders()
        // // const formData = new FormData();
        // const dataToBeSent = {
        //     title: data.title
        // }
        // formData.append('title', data.title);
        // formData.append('movie_genre', data.movie_genre);
        // formData.append('synopsis', data.synopsis);
        // formData.append('duration', data.duration);
        // formData.append('photo', data.photo);

        const response = await axios.post('/api/movies', data, {
            headers: {
                'Content-Type': 'application/json' ,
                ...authorizationHeader
            },
        })

        return response.data
    }
}