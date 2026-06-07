import bcrypt from "bcryptjs"
import { MongoClient, Db } from "mongodb"

const uri = process.env.URIMONGOLOCAL
const DEFAULT_USER_PASSWORD = process.env.DEFAULT_USER_PASSWORD

let client: MongoClient
let clientPromise: Promise<MongoClient>

if(!uri) throw Error('Defina URIMONGOLOCAL no arquivo .env !!!')
if(!DEFAULT_USER_PASSWORD) throw Error('Defina DEFAULT_USER_PASSWORD no arquivo .env !!!')

export async function connectToBD(): Promise<Db>{
    if(!client){
        client = new MongoClient(uri as string)
        clientPromise = client.connect()
    }

    await clientPromise

    const db = client.db("Admins")

    await createDefaultAdmin(db)

    return db
}

export async function getAdminsCollection(){
    const db = await connectToBD()
    return db.collection('Admins')
}

async function createDefaultAdmin(db: Db) {
    const collection = db.collection("Admins")

    const adminExists = await collection.findOne({
        name: "Administrador"
    })

    if (!adminExists) {
        const hashedPassword = await bcrypt.hash(DEFAULT_USER_PASSWORD as string, 10)
    
        await collection.insertOne({
            name: "Administrador",
            password: hashedPassword,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString()
        })
    }
}