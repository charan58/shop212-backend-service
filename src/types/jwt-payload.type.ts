export interface JwtPayload {
  sub: number; // User ID
  email: string;
  fullName: string;
}