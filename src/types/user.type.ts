export interface User{
  id: number;
  fullName: string;
  email: string;
  phoneNumber: string;
  password: string;
  accessToken: string;
  refreshToken?: string;
};