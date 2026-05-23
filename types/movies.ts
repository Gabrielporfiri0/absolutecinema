import { ObjectId } from "mongodb"
import { z } from "zod"

export type GetMoviesSuccessResponse = {
    message: string
    movies__: Movies[]
}

export type PostMoviesSuccessResponse = {
    message: string
    id: string
}

export type PutMoviesSuccessResponse = {
    message: string
}

export type Movies = {
    _id: ObjectId | string,
    title: string,
    movie_genre: string,
    synopsis: string
    duration: string,
    session_date: string,
    session_time: string,
    photo: string,
    createdAt: string,
    updatedAt: string,
}

export type MovieDataToSent = {
    title: string,
    movie_genre: string,
    synopsis: string
    duration: string,
    photo: string
}

export const MovieSchema = z.object({
    title: z.string()
        .min(1, { message: 'Ao menos 1 caractere' })
        .max(50, { message: 'No máximo 50 caracteres' })
        .transform(value => value.trim())
        .refine(value => value.length > 0 , { message: 'Campo não pode ser vazio após remover espaços' }),
    movie_genre: z.string()
        .min(1, { message: 'Ao menos 1 caractere' })
        .max(30, { message: 'No máximo 30 caracteres' })
        .transform(value => value.trim())
        .refine(value => value.length > 0, { message: 'Campo não pode ser vazio após remover espaços' }),
    synopsis: z.string()
        .min(1, { message: 'Ao menos 1 caractere' })
        .max(500, { message: 'No máximo 500 caracteres' })
        .transform(value => value.trim())
        .refine(value => value.length > 0, { message: 'Campo não pode ser vazio após remover espaços' }),
    duration: z.string().min(4, { message: 'Precisa estar no formato: HH:MM' }).max(5, { message: 'Precisa estar no formato: HH:MM' }),
    session_date: z.string().min(10, { message: 'Precisa estar no formato: DD/MM/AAAA' }).max(10, { message: 'Precisa estar no formato: DD/MM/AAAA' }),
    session_time: z.string().min(4, { message: 'Precisa estar no formato: HH:MM' }).max(5, { message: 'Precisa estar no formato: HH:MM' }),
    photo: z.string().min(1, { message: 'A foto é obrigatória' }),
    
})

export type MovieFormData = z.infer<typeof MovieSchema>
