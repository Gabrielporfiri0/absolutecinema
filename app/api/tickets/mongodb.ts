import { MongoClient, Db } from 'mongodb'

const uri = process.env.URIMONGOLOCAL

let client: MongoClient
let clientPromise: Promise<MongoClient>

if(!uri) throw new Error('Defina URIMONGOLOCAL no arquivo .env !!!')

export async function connectToBD(): Promise<Db> {
    if(!client){
        client = new MongoClient(uri as string)
        clientPromise = client.connect()
    }

    await clientPromise
    return client.db('Tickets')
}

export async function getTicketsCollection(){
    const db = await connectToBD()
    return db.collection('Tickets')
}
