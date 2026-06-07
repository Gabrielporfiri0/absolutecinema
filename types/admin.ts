import { ObjectId } from "mongodb"
import { z } from "zod"

export type LogoutAdminApiSuccessResponse = {
    success: boolean
}

export type LoginAdminApiSuccessResponse = {
    message: string,
    token: string
}

export type GetAdminsSuccessResponse = {
    message: string,
    admin__: AdminUser[]
}

export type PostAdminSuccessResponse = {
    message: string,
    id: string
}

export type AdminDataToBeSentInRegister = {
    name: string,
    password: string
}

export type Admin = {
    name: string,
    password: string,
    createdAt: string | Date,
    updatedAt: string | Date
}

export type AdminUser = {
    _id: ObjectId,
    name: string,
    password: string,
    createdAt: string,
    updatedAt: string
}

export const AdminSchema = z.object({
    name: z.string()
        .min(3, { message: 'Ao menos 3 caracteres' })
        .max(20, { message: 'No máximo 20 caracteres' })
        .transform(value => value.trim())
        .refine(value => value.length > 0, { message: 'O nome não pode ser vazio após remover espaços em branco' }),
    password: z.string()
        .min(6, { message: 'Ao menos 6 caracteres' })
        .max(20, { message: 'No máximo 20 caracteres' })
        .transform(value => value.trim())
        .refine(value => value.length > 0, { message: 'A senha não pode ser vazia após remover espaços em branco' }),
})

export type AdminFormData = z.infer<typeof AdminSchema>