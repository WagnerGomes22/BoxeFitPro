import NextAuth from 'next-auth';
import Credentials from 'next-auth/providers/credentials';
import type { User } from '@/models/user';
import { UserType } from '@/models/user';

const users: User[] = [
    { id: '1', name: 'Aluno Teste', email: 'aluno@test.com', password: '123', type: UserType.STUDENT },
    { id: '2', name: 'Instrutor Teste', email: 'instrutor@test.com', password: '123', type: UserType.INSTRUCTOR },
];

export const { handlers, signIn, signOut, auth } = NextAuth({
    providers: [
        Credentials({
            name: 'Credentials',
            credentials: {
                email: { label: 'Email', type: 'email', placeholder: 'seu@email.com' },
                password: { label: 'Password', type: 'password' },
            },
            async authorize(credentials) {
                const user = users.find(u => u.email === credentials.email);

             
                if (user && user.password === credentials.password) {
                    const { password, ...userWithoutPassword } = user;
                    return userWithoutPassword;
                }

                return null;
            },
        }),
    ],
    callbacks: {
        jwt({ token, user }) {
            if (user) {
                token.id = user.id!;
                token.type = (user as User).type;
            }
            return token;
        },
        session({ session, token }) {
            session.user.id = token.id as string;
            session.user.type = token.type as UserType;
            return session;
        },
    },
    pages: {
        signIn: '/login',
    },
});