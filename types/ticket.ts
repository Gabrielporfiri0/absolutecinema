import { ObjectId } from "mongodb";
import { z } from "zod"

export type Ticket = {
    name: string,
    email: string,
    seat: string,
    phone: string,
    createdAt: string | Date,
    updatedAt: string | Date
}

export type TicketDataToBeSent = {
    name: string,
    email: string,
    seat: string,
    phone: string
}

export type TicketApi = {
    _id: ObjectId,
    name: string,
    email: string,
    seat: number,
    phone: string,
    createdAt: string,
    updatedAt: string
}

export type GetTicketsSuccessResponse = {
    message: string,
    tickets__: TicketApi[]
}

export type PutTicketSuccessResponse = {
    message: string,
}

export type GetAllTicketsSuccessResponse = {
    message: string,
    seats__: number[]
}

export type PostTicketSuccessResponse = {
    message: string,
    id: string
}

export type DeleteAllTicketsSuccessResponse = {
    message: string,
    ticketsDeleted: number
}

export const ReservationSchema = z.object({
    name: z.string({ message: 'Nome é obrigatório' })
        .min(1, { message: 'Ao menos 1 caractere' })
        .max(50, { message: 'No máximo 50 caracteres' })
        .transform(value => value.trim())
        .refine(value => value.length > 0 , { message: 'Campo não pode ser vazio após remover espaços em branco' }),
    email: z.email({ message: 'Email inválido' })
        .max(100, { message: 'No máximo 100 caracteres' })
        .transform(value => value.trim()),
    seat: z.number({ message: 'Assento inválido - (1-122)' })
        .min(1, { message: 'Assento inválido - (1-122)' })
        .max(122, { message: 'Assento inválido - (1-122)' }),
    phone: z.string({ message: 'Telefone é obrigatório' })
      .transform((val) => val.replace(/\D/g, ""))
      .refine((val) => val.length === 10 || val.length === 11, {
        message: "Telefone inválido",
      }),
})

export type ReservationFormData = z.infer<typeof ReservationSchema>