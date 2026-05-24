import { localStorageUtil } from "@/lib/localStorage_";
import { AdminDataToBeSentInRegister, GetAdminsSuccessResponse, PostAdminSuccessResponse } from "@/types/admin";
import axios from "axios";

const NOT_FOUND_SESSION_ERROR_MESSAGE = "Sessão não encontrada. Faça login novamente."

const getAuthHeaders = () => {
    const cookie = localStorageUtil.getItem('acessToken')
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
        const response = await axios.get<GetAdminsSuccessResponse>('/api/admin/getAll', {
            headers: {
                'Content-Type': 'application/json' ,
                ...authorizationHeader
            },
        })

        return response
    },
    delete: async (id: string) => {
        const authorizationHeader = getAuthHeaders()
        const response = await axios.delete(`/api/admin/${id}`, {
            headers: {
                ...authorizationHeader
            },
        })

        return response
    },
    create: async (data: AdminDataToBeSentInRegister) => {
        const authorizationHeader = getAuthHeaders()
        const response = await axios.post<PostAdminSuccessResponse>('/api/admin/register', data, {
            headers: {
                'Content-Type': 'application/json' ,
                ...authorizationHeader
            },
        })

        return response
    }
}
