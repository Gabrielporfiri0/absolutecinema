import { localStorageUtil } from "@/lib/localStorage_";
import { 
    GetMoviesSuccessResponse, 
    MovieFormData, 
    Movies, 
    PostMoviesSuccessResponse, 
    PutMoviesSuccessResponse 
} from "@/types/movies";
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
    create: async (data: MovieFormData) => {
        const authorizationHeader = getAuthHeaders()
        const response = await axios.post<PostMoviesSuccessResponse>('/api/movies', data, {
            headers: {
                'Content-Type': 'application/json' ,
                ...authorizationHeader
            },
        })

        return response
    },

    get: async () => {
        const response = await axios.get<GetMoviesSuccessResponse>('/api/movies')
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
            session_date: data.session_date,
            session_time: data.session_time,
            photo: data.photo,
            createdAt: created_at,
            updatedAt: updated_at
        }

        const response = await axios.put<PutMoviesSuccessResponse>(`/api/movies/${id}`, payload, {
            headers: {
                'Content-Type': 'application/json',
                ...authorizationHeader
            },
        })
        return response
    }
}