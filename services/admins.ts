import { localStorageUtil } from "@/lib/localStorage_";
import { AdminDataToBeSentInRegister, GetAdminsSuccessResponse, LoginAdminApiSuccessResponse, PostAdminSuccessResponse } from "@/types/admin";
import axios from "axios";

const NOT_FOUND_SESSION_ERROR_MESSAGE = "Sessão não encontrada. Faça login novamente."
const RESOURCE = process.env.NEXT_PUBLIC_APP_URL

const getAuthHeaders = () => {
    const cookie = localStorageUtil.getItem('accessToken')
    if (!cookie) {
        throw new Error(NOT_FOUND_SESSION_ERROR_MESSAGE);
    }

    return {
        'Authorization': `Bearer ${cookie}`
    }
}

export const adminsService = {
    getAll: async () => {
        const authorizationHeader = getAuthHeaders()
        const response = await axios.get<GetAdminsSuccessResponse>(`${RESOURCE}/api/admin/getAll`, {
            headers: {
                'Content-Type': 'application/json' ,
                ...authorizationHeader
            },
        })

        return response
    },
    delete: async (id: string) => {
        const authorizationHeader = getAuthHeaders()
        const response = await axios.delete(`${RESOURCE}/api/admin/${id}`, {
            headers: {
                ...authorizationHeader
            },
        })

        return response
    },
    create: async (data: AdminDataToBeSentInRegister) => {
        const authorizationHeader = getAuthHeaders()
        const response = await axios.post<PostAdminSuccessResponse>(`${RESOURCE}/api/admin/register`, data, {
            headers: {
                'Content-Type': 'application/json' ,
                ...authorizationHeader
            },
        })

        return response
    },
    login: async (data: AdminDataToBeSentInRegister) => {
        const response = await axios.post<LoginAdminApiSuccessResponse>(`${RESOURCE}/api/admin/login`, data, {
            headers: {
                'Content-Type': 'application/json' ,
            },
        })

        return response
    },
    logout: async () => {
        const authorizationHeader = getAuthHeaders()
        const response = await axios.post(`${RESOURCE}/api/admin/logout`, null, {
            headers: {
                'Content-Type': 'application/json' ,
                ...authorizationHeader
            },
        })
        return response
    }
}
