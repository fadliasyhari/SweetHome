import jwt from 'jsonwebtoken'

export const jwToken = {
  sign(data: any) {
    return jwt.sign(data, process.env.SECRET as string, { expiresIn: '1h' });
  },

  verify(authorization: any) {
    return jwt.verify(authorization, process.env.SECRET as string);
  }
}