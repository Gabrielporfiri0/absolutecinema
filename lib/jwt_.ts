import { SignJWT, jwtVerify } from 'jose'

const jwt_secret_ = process.env.JWT_SECRET || ''

if(!jwt_secret_) throw new Error('Defina JWT_SECRET no arquivo .env')

const secretKey = new TextEncoder().encode(jwt_secret_);

export async function generateToken(payload: any){
    return await new SignJWT(payload)
        .setProtectedHeader({ alg: 'HS256' })
        .setIssuedAt()
        .setExpirationTime('1h')
        .sign(secretKey);
}

export async function verifyToken(token__: string){
    try {
        const { payload } = await jwtVerify(token__, secretKey);
        return {
            valid: true,
            expired: false,
            decoded: payload
        };
    } catch (error: any) {
        console.error('Erro na verificação do token:', error.message);
        return {
            valid: false,
            expired: error.code === 'ERR_JWT_EXPIRED',
            error: error.message
        };
    }
}
