import { UserType } from '@/models/user';
import NextAuth, { type DefaultSession } from 'next-auth';
import { JWT } from 'next-auth/jwt';

// Este arquivo informa ao TypeScript como é a "forma" dos nossos objetos customizados
// de Sessão e JWT, adicionando as propriedades que incluímos nas callbacks.

declare module 'next-auth' {
    /**
     * Retornado pela `auth`, `useSession`, `getSession` e recebido como prop
     * para o `SessionProvider`.
     */
    interface Session {
        user: {
            /** O ID do usuário. */
            id: string;
            /** O tipo do usuário (aluno ou instrutor). */
            type: UserType;
            // Mantém as propriedades padrão (name, email, image)
        } & DefaultSession['user'];
    }

    /**
     * O objeto de usuário que passamos para a callback `authorize`.
     */
    interface User {
        type: UserType;
    }
}

declare module 'next-auth/jwt' {
    /** Retornado pela callback `jwt` e recebido pela callback `session`. */
    interface JWT {
        /** O ID do usuário. */
        id: string;
        /** O tipo do usuário. */
        type: UserType;
    }
}
