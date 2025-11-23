
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
