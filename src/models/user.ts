
export enum UserType {
    STUDENT = 'student',
    INSTRUCTOR = 'instructor',
}

export interface User {
    id: string;
    name: string;
    email: string;
    password?: string;
    type: UserType;
}
