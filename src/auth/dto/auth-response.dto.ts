export class AuthResponseDto {
  accessToken: string;
  refreshToken: string;
  user: {
    id: string;
    email: string;
    phone: string | null;
    firstName: string | null;
    lastName: string | null;
    role: string;
  };
}
