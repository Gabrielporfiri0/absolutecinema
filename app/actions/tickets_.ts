'use server';

import { ObjectId } from 'mongodb';
import { getTicketsCollection } from '../api/tickets/mongodb';
import { verifyToken } from '@/lib/jwt_';

export async function deleteTicket(ticketID: string, accessToken__: string) {
    try {
        const isAValidToken = await verifyToken(accessToken__);
        
        if (!isAValidToken.valid) {
            return {
                success: false,
                status: 401,
                message: 'Token inválido, faça login novamente.'
            };
        }

        if (!ObjectId.isValid(ticketID)) {
            return {
                success: false,
                status: 400,
                message: 'ID inválido'
            };
        }

        const ticketsCollection = await getTicketsCollection();

        const ticket = await ticketsCollection.findOne({
            _id: new ObjectId(ticketID)
        });

        if (!ticket) {
            return {
                success: false,
                status: 404,
                message: 'Ingresso não encontrado'
            };
        }

        const result = await ticketsCollection.deleteOne({
            _id: new ObjectId(ticketID)
        });

        if (result.deletedCount === 0) {
            return {
                success: false,
                status: 500,
                message: 'Erro ao deletar ingresso, tente novamente mais tarde'
            };
        }

        return {
            success: true,
            status: 200,
            message: 'Ingresso excluído com sucesso !!!'
        };

    } catch (error) {
        console.log('ERRO NO CATCH:', error);
        
        return {
            success: false,
            status: 500,
            message: 'Erro ao deletar ingresso, tente novamente mais tarde'
        };
    }
}