export interface User {
    id: string;
    username: string;
    password: string;
    email: string;
}

export interface AuthRequest {
    username: string;
    password: string;
}