import { z } from "zod"

export type Movies = {
    title: string,
    movie_genre: string,
    synopsis: string
    duration: string,
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
        .max(30, { message: 'No máximo 30 caracteres' })
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
    photo: z.instanceof(File, { message: 'O arquivo não é uma instância de file.' })
        .refine(
            (value) => {
                if (value instanceof File) {
                    const allowedTypes = ["image/jpeg", "image/png"];
                    const isAllowedType = allowedTypes.includes(value.type);
                    const isUnderLimit = value.size <= 10 * 1024 * 1024;
                    return isAllowedType && isUnderLimit;
                }
                return true;
            },
            {
                message: "Envie uma imagem válida (PNG/JPG, até 10MB)",
            }
        ),
})

export type MovieFormData = z.infer<typeof MovieSchema>
