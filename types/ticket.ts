import { ObjectId } from "mongodb";

export type Ticket = {
    name: string,
    cpf: string,
    seat: string,
    createdAt: string | Date,
    updatedAt: string | Date
}

export type TicketDataToBeSent = {
    name: string,
    cpf: string,
    seat: string
}

export type TicketApi = {
    _id: ObjectId,
    name: string,
    cpf: string,
    seat: number,
    createdAt: string,
    updatedAt: string
}
