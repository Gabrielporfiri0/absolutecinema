
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
