'use server';

import { getAdminsCollection } from '../api/admin/mongodb';
import bcrypt from 'bcryptjs';
import { generateToken } from '@/lib/jwt_';
import { cookies } from 'next/headers';

export async function loginUser(user_name_: string, password__: string) {
    try {
        if (!user_name_ || !password__) {
            return {
                success: false,
                status: 400,
                message: 'Por favor, forneça todos os dados'
            };
        }

        const adminsCollection = await getAdminsCollection()

        const adminExists = await adminsCollection.findOne({ name: user_name_ });

        if (!adminExists) {
            return {
                success: false,
                status: 404,
                message: 'Usuário não encontrado'
            };
        }

        const isValidPassword = await bcrypt.compare(password__, adminExists.password)
        
        if (!isValidPassword) {
            return {
                success: false,
                status: 401,
                message: 'Credenciais inválidas'
            };
        }

        const token_ = await generateToken({ userId: String(adminExists._id), userName: adminExists.name, role: 'admin' });

        (await cookies()).set({
            name: 'accessToken',
            value: token_,
            httpOnly: true,
            secure: true,
            sameSite: 'strict',
            maxAge: 3600,
            path: '/',
        })

        return {
            success: true,
            status: 200,
            message: 'Login realizado com sucesso',
            token: token_
        };

    } catch (error) {
        console.log('ERRO NO CATCH:', error);
        
        return {
            success: false,
            status: 500,
            message: 'Erro ao fazer login de admin, tente novamente mais tarde'
        };
    }
}