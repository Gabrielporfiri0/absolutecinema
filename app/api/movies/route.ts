import { MovieDataToSent } from "@/types/movies"
import { NextRequest, NextResponse } from "next/server"
import { getMoviesCollection } from "./mongodb"
import { validateAuth } from "@/lib/auth-utils"

export async function POST(request: NextRequest) {
    try {
        let data: MovieDataToSent = {
            title: '',
            movie_genre: '',
            synopsis: '',
            duration: '',
            photo: ''
        }

        try {
            data = await request.json()
            if (!data.title || !data.movie_genre || !data.synopsis || !data.duration || !data.photo) return NextResponse.json({ error: 'Por favor, forneça todos os dados', status: 400 })
        } catch (error) {
            return NextResponse.json({ error: 'Por favor, forneça todos os dados', status: 400 })
        }

        const aValidTokenWasSent = await validateAuth(request)

        if (aValidTokenWasSent.status === 401) return NextResponse.json({ error: 'Token inválido', status: 401 })

        const collection = await getMoviesCollection()

        const thereIsOneMovieAlreadyRegistered = await collection.find().toArray()

        if (thereIsOneMovieAlreadyRegistered.length > 0) return NextResponse.json({ error: 'Já existe um filme cadastrado!!', status: 400 })

        const response = await collection.insertOne({
            title: data.title,
            movie_genre: data.movie_genre,
            synopsis: data.synopsis,
            duration: data.duration,
            photo: data.photo,
            createdAt: new Date(),
            updatedAt: new Date()
        })

        return NextResponse.json({ message: "Filme cadastrado com sucesso!", id: response.insertedId, status: 201 })
    } catch (error) {
        console.log('Erro ao realizar POST do filme: ', error)
        return NextResponse.json({ error: 'Erro interno no servidor ao adicionar filme!!', status: 500 })
    }
}

export async function GET(request: NextRequest) {
    try {
        const aValidTokenWasSent = await validateAuth(request)

        if (aValidTokenWasSent.status === 401) return NextResponse.json({ error: 'Token inválido', status: 401 })

        const collection = await getMoviesCollection()
        const movies = await collection.find().toArray()
        return NextResponse.json({ message: 'Filmes encontrados com sucesso', status: 200, movies__: movies })
    } catch (error) {
        console.log('Erro ao realizar GET dos filmes: ', error)
        return NextResponse.json({ error: 'Erro interno no servidor ao buscar filmes!!', status: 500 })
    }
}
