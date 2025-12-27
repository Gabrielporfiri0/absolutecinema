import { validateAuth } from "@/lib/auth-utils";
import { Movies } from "@/types/movies";
import { NextRequest, NextResponse } from "next/server";
import { getMoviesCollection } from "../mongodb";
import { ObjectId } from "mongodb";

export async function PUT(
    request: NextRequest,
    context: { params: Promise<{ id: string }> }
) {
    try {
        const { id } = await context.params

        if (!id) return NextResponse.json({ error: 'ID não fornecido', status: 400 })

        if (!/^[0-9a-fA-F]{24}$/.test(id)) return NextResponse.json({ error: 'ID inválido', status: 400 })

        const aValidTokenWasSent = await validateAuth(request)

        if (aValidTokenWasSent.status === 401) return NextResponse.json({ error: 'Token inválido', status: 401 })

        let data: Movies = {
            title: '',
            movie_genre: '',
            synopsis: '',
            duration: '',
            photo: '',
            createdAt: '',
            updatedAt: ''
        }

        try {
            data = await request.json()
            if (!data.title || !data.movie_genre || !data.synopsis || !data.duration || !data.photo || !data.createdAt || !data.updatedAt)
                return NextResponse.json({ error: 'Por favor, forneça todos os dados', status: 400 })
        } catch (error) {
            return NextResponse.json({ error: 'Por favor, forneça todos os dados', status: 400 })
        }

        const collection = await getMoviesCollection()

        const seeIfMovieExists = await collection.findOne({ _id: ObjectId.createFromHexString(id) })

        if (!seeIfMovieExists) return NextResponse.json({ error: 'Filme não encontrado!!', status: 404 })

        await collection.updateOne(
            { _id: ObjectId.createFromHexString(id) },
            {
                $set: {
                    title: data.title,
                    movie_genre: data.movie_genre,
                    synopsis: data.synopsis,
                    duration: data.duration,
                    photo: data.photo,
                    createdAt: data.createdAt,
                    updatedAt: new Date()
                }
            }
        )

        return NextResponse.json({ message: 'Filme atualizado com sucesso!!', status: 200 })
    } catch (error) {
        console.log('Erro ao realizar PUT de um filme: ', error)
        return NextResponse.json({ error: 'Erro interno no servidor ao atualizar filme!!', status: 500 })
    }
}

export async function DELETE(
    request: NextRequest,
    context: { params: Promise<{ id: string }> }
) {
    try {
        const { id } = await context.params

        if (!id) return NextResponse.json({ error: 'ID não fornecido', status: 400 })

        if (!/^[0-9a-fA-F]{24}$/.test(id)) return NextResponse.json({ error: 'ID inválido', status: 400 })

        const aValidTokenWasSent = await validateAuth(request)

        if (aValidTokenWasSent.status === 401) return NextResponse.json({ error: 'Token inválido', status: 401 })

        const collection = await getMoviesCollection()

        const seeIfMovieExists = await collection.findOne({ _id: ObjectId.createFromHexString(id) })

        if (!seeIfMovieExists) return NextResponse.json({ error: 'Filme não encontrado!!', status: 404 })

        await collection.deleteOne({ _id: ObjectId.createFromHexString(id) })

        return NextResponse.json({ message: 'Filme deletado com sucesso!!', status: 200 })
    } catch (error) {
        console.log('Erro ao deletar filme: ', error)
        return NextResponse.json({ error: 'Erro interno no servidor ao deletar um filme!!', status: 500 })
    }
}

export async function GET(
    request: NextRequest,
    context: { params: Promise<{ id: string }> }
) {
    try {
        const { id } = await context.params

        if (!id) return NextResponse.json({ error: 'ID não fornecido', status: 400 })

        if (!/^[0-9a-fA-F]{24}$/.test(id)) return NextResponse.json({ error: 'ID inválido', status: 400 })

        const aValidTokenWasSent = await validateAuth(request)

        if (aValidTokenWasSent.status === 401) return NextResponse.json({ error: 'Token inválido', status: 401 })

        const collection = await getMoviesCollection()

        const seeIfMovieExists = await collection.findOne({ _id: ObjectId.createFromHexString(id) })

        if (!seeIfMovieExists) return NextResponse.json({ error: 'Filme não encontrado!!', status: 404 })

        return NextResponse.json({
            message: 'Filme encontrado com sucesso!!',
            status: 200,
            movie: seeIfMovieExists
        })
    } catch (error) {
        console.log('Erro ao buscar dados de um filme em específico: ', error)
        return NextResponse.json({ error: 'Erro interno no servidor ao buscar dados específicos de um filme!!', status: 500 })
    }
}
