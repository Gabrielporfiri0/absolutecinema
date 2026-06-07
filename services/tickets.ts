import { localStorageUtil } from "@/lib/localStorage_";
import { 
    DeleteAllTicketsSuccessResponse,
    GetAllTicketsSuccessResponse, 
    GetTicketsSuccessResponse, 
    PostTicketSuccessResponse, 
    PutTicketSuccessResponse, 
    Ticket, 
    TicketDataToBeSent 
} from "@/types/ticket";
import axios from "axios";

const NOT_FOUND_SESSION_ERROR_MESSAGE = "Sessão não encontrada. Faça login novamente!"

const getAuthHeaders = () => {
    const cookie = localStorageUtil.getItem('accessToken')
    if (!cookie) {
        throw new Error(NOT_FOUND_SESSION_ERROR_MESSAGE);
    }

    return {
        'Authorization': `Bearer ${cookie}`
    }
}

export const ticketsService = {
    getAll: async () => {
        const authorizationHeader = getAuthHeaders()
        const response = await axios.get<GetTicketsSuccessResponse>('/api/tickets/getAllTickets', {
            headers: {
                ...authorizationHeader
            },
        })

        return response
    },
    update: async (id: string, dataToBeSent: Ticket) => {
        const authorizationHeader = getAuthHeaders()
        const response = await axios.put<PutTicketSuccessResponse>(`/api/tickets/${id}`, dataToBeSent, {
            headers: {
                ...authorizationHeader
            },
        })

        return response
    },
    delete: async (id: string) => {
        const authorizationHeader = getAuthHeaders()
        const response = await axios.delete(`/api/tickets/${id}`, {
            headers: {
                ...authorizationHeader
            },
        })

        return response
    },
    getAllSeats: async () => {
        const response = await axios.get<GetAllTicketsSuccessResponse>('/api/tickets/getAllSeats')
        return response
    },
    create: async (dataToBeSent: TicketDataToBeSent) => {
        const response = await axios.post<PostTicketSuccessResponse>('/api/tickets/register', dataToBeSent)
        return response
    },
    deleteAll: async () => {
        const authorizationHeader = getAuthHeaders()
        const response = await axios.delete<DeleteAllTicketsSuccessResponse>('/api/tickets/deleteAll', {
            headers: {
                'Content-Type': 'application/json',
                ...authorizationHeader
            },
        })

        return response
    }
}