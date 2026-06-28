import { jwtDecode } from 'jwt-decode';

interface DecodedToken {
  user_id?: string;
  sub?: string;
  id?: string;
  [key: string]: any;
}

export const getUserIdFromToken = (token: string | null): string | null => {
  if (!token) return null;
  
  try {
    const decoded = jwtDecode<DecodedToken>(token);
    return decoded.user_id || decoded.sub || decoded.id || null;
  } catch (error) {
    console.error('Ошибка декодирования токена:', error);
    return null;
  }
};