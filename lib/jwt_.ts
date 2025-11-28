import jwt from 'jsonwebtoken';

const jwt_secret_ = process.env.JWT_SECRET || ''

if(!jwt_secret_) throw new Error('Defina JWT_SECRET no arquivo .env')

export function generateToken(payload: string | object){
    return jwt.sign(
        payload,
        jwt_secret_,
        { expiresIn: '1h' }
    )
}

export function verifyToken(token__: string){
    try{
        const decoded = jwt.verify(token__, jwt_secret_)
        return {
            valid: true,
            expired: false,
            decoded
        }
    }catch(error){
        return {
            valid: false,
        }
    }
}
