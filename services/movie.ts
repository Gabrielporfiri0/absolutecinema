import { localStorageUtil } from "@/lib/localStorage_";
import { MovieDataToSent, MovieFormData, Movies } from "@/types/movies";
import axios from "axios";
import { ObjectId } from "mongodb";

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
    create: async (data: MovieFormData) => {
        const authorizationHeader = getAuthHeaders()
        // const formData = new FormData();

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

        return response
    },

    get: async () => {
        const authorizationHeader = getAuthHeaders()
        const response = await axios.get('/api/movies', {
            headers: {
                ...authorizationHeader
            },
        })
        return response
    },

    update: async (id: string, data: MovieFormData, created_at: string, updated_at: string) => {
        const authorizationHeader = getAuthHeaders()
        const payload: Movies = {
            _id: '',
            title: data.title,
            movie_genre: data.movie_genre,
            synopsis: data.synopsis,
            duration: data.duration,
            photo: data.photo,
            createdAt: created_at,
            updatedAt: updated_at
        }

        // const formData = new FormData();

        // formData.append('_id', id);
        // formData.append('title', data.title);
        // formData.append('movie_genre', data.movie_genre);
        // formData.append('synopsis', data.synopsis);
        // formData.append('duration', data.duration);
        // formData.append('created_at', created_at);
        // formData.append('updated_at', updated_at);
        
        // if (data.photo instanceof File) {
        //     formData.append('photo', data.photo);
        // }

        const response = await axios.put(`/api/movies/${id}`, payload, {
            headers: {
                'Content-Type': 'application/json',
                ...authorizationHeader
            },
        })
        return response
    }
}