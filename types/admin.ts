import { ObjectId } from "mongodb"

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
