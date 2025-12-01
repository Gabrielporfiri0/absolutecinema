import { ObjectId } from "mongodb"

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
