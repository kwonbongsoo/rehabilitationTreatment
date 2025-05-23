export interface User {
    id: string;
    username: string;
    email: string;
    password: string;
}

export interface UserUpdate {
    username?: string;
    email?: string;
    password?: string;
}