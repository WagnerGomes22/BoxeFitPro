'use server';

import { prisma } from '@/lib/prisma';
import { randomBytes, createHash } from 'crypto';
import bcrypt from 'bcryptjs';

// Função auxiliar para gerar hash do token (SHA-256)
const hashToken = (token: string) => {
  return createHash('sha256').update(token).digest('hex');
};

export async function sendPasswordResetEmail(email: string) {
  try {
    // Busca usuário pelo e-mail
    const user = await prisma.user.findUnique({
      where: { email },
    });

    if (!user) {
      // Retornamos sucesso para evitar enumeração de e-mails
      // "Se o e-mail existir, um link de recuperação foi enviado."
      return { success: 'Se o e-mail estiver cadastrado, enviamos um link para redefinir sua senha.' };
    }

    // 1. Gerar token aleatório seguro (32 bytes hex)
    const resetToken = randomBytes(32).toString('hex');
    
    // 2. Criar hash do token para armazenar no banco
    const tokenHash = hashToken(resetToken);
    
    // 3. Definir expiração (1 hora)
    const expires = new Date(new Date().getTime() + 3600 * 1000); // 1 hora a partir de agora

    // 4. Verificar se já existe um token válido para este e-mail e invalidar
    const existingToken = await prisma.passwordResetToken.findFirst({
      where: { email }
    });

    if (existingToken) {
      await prisma.passwordResetToken.delete({
        where: { id: existingToken.id }
      });
    }

    // 5. Salvar o hash no banco
    await prisma.passwordResetToken.create({
      data: {
        email,
        tokenHash,
        expires,
      },
    });

    // 6. Construir link de recuperação com o token ORIGINAL (não o hash)
    const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';
    const resetLink = `${baseUrl}/auth/redefinir-senha?token=${resetToken}`;

    // 7. Simulação de envio de e-mail (MOCK)
    console.log('=================================================================');
    console.log('📧 [MOCK EMAIL SERVICE] - RESET PASSWORD REQUEST');
    console.log(`To: ${email}`);
    console.log(`Link: ${resetLink}`);
    console.log('=================================================================');

    // Integração futura com Resend:
    // await resend.emails.send({ ... })

    return { success: 'Se o e-mail estiver cadastrado, enviamos um link para redefinir sua senha.' };
  } catch (error) {
    console.error('Erro ao processar solicitação de recuperação de senha:', error);
    return { error: 'Ocorreu um erro interno. Tente novamente mais tarde.' };
  }
}

export async function resetPassword(token: string, newPassword: string) {
  try {
    if (!token || !newPassword) {
      return { error: 'Token e nova senha são obrigatórios.' };
    }

    // 1. Gerar hash do token recebido para buscar no banco
    const tokenHash = hashToken(token);

    // 2. Buscar token no banco pelo hash
    const existingToken = await prisma.passwordResetToken.findUnique({
      where: { tokenHash },
    });

    if (!existingToken) {
      return { error: 'Token inválido ou expirado.' };
    }

    // 3. Verificar expiração
    const hasExpired = new Date() > existingToken.expires;

    if (hasExpired) {
      // Limpar token expirado
      await prisma.passwordResetToken.delete({
        where: { id: existingToken.id },
      });
      return { error: 'Este link expirou. Solicite uma nova recuperação de senha.' };
    }

    // 4. Buscar usuário associado ao token
    const existingUser = await prisma.user.findUnique({
      where: { email: existingToken.email },
    });

    if (!existingUser) {
      return { error: 'Usuário não encontrado.' };
    }

    // 5. Hash da nova senha
    const hashedPassword = await bcrypt.hash(newPassword, 10);

    // 6. Transação: Atualizar senha e remover token usado
    // Usamos transação para garantir consistência
    await prisma.$transaction([
      prisma.user.update({
        where: { id: existingUser.id },
        data: { password: hashedPassword },
      }),
      prisma.passwordResetToken.delete({
        where: { id: existingToken.id },
      }),
    ]);

    return { success: 'Sua senha foi redefinida com sucesso! Você já pode fazer login.' };
  } catch (error) {
    console.error('Erro ao redefinir senha:', error);
    return { error: 'Ocorreu um erro ao tentar redefinir a senha.' };
  }
}
