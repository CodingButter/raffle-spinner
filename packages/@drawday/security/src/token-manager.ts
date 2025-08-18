import { SignJWT, jwtVerify } from 'jose';
import type { JWTPayload } from 'jose';

interface TokenPayload extends JWTPayload {
  userId: string;
  email: string;
  role?: string;
}

/**
 * Secure token management with JWT
 * Uses HttpOnly cookies for browser storage
 */
export class TokenManager {
  private secret: Uint8Array;
  
  constructor(secretKey: string) {
    if (!secretKey || secretKey.length < 32) {
      throw new Error('Secret key must be at least 32 characters');
    }
    this.secret = new TextEncoder().encode(secretKey);
  }
  
  /**
   * Create a signed JWT token
   */
  async createToken(
    payload: Omit<TokenPayload, 'iat' | 'exp' | 'jti'>,
    expiresIn: string = '15m'
  ): Promise<string> {
    const token = await new SignJWT(payload)
      .setProtectedHeader({ alg: 'HS256' })
      .setIssuedAt()
      .setExpirationTime(expiresIn)
      .setJti(crypto.randomUUID())
      .sign(this.secret);
    
    return token;
  }
  
  /**
   * Verify and decode a JWT token
   */
  async verifyToken(token: string): Promise<TokenPayload | null> {
    try {
      const { payload } = await jwtVerify(token, this.secret);
      return payload as TokenPayload;
    } catch (error) {
      console.error('Token verification failed:', error);
      return null;
    }
  }
  
  /**
   * Create HttpOnly cookie options for tokens
   */
  getCookieOptions(maxAge: number = 900) { // 15 minutes default
    return {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict' as const,
      maxAge,
      path: '/',
    };
  }
  
  /**
   * Generate refresh token with longer expiry
   */
  async createRefreshToken(
    payload: Omit<TokenPayload, 'iat' | 'exp' | 'jti'>
  ): Promise<string> {
    return this.createToken(payload, '7d');
  }
}