
export const translateError = (message: string): string => {
    if (!message) return 'Ocorreu um erro inesperado.';

    const lowerMessage = message.toLowerCase();

    // Supabase / Auth Errors
    if (lowerMessage.includes('invalid login credentials')) {
        return 'E-mail ou senha incorretos.';
    }
    if (lowerMessage.includes('email not confirmed')) {
        return 'Por favor, confirme seu e-mail antes de acessar.';
    }
    if (lowerMessage.includes('user already registered')) {
        return 'Este e-mail já está cadastrado.';
    }
    if (lowerMessage.includes('user not found')) {
        return 'Usuário não encontrado.';
    }
    if (lowerMessage.includes('invalid refresh token')) {
        return 'Sua sessão expirou. Por favor, faça login novamente.';
    }
    if (lowerMessage.includes('password should be at least 6 characters')) {
        return 'A senha deve ter pelo menos 6 caracteres.';
    }
    if (lowerMessage.includes('network error') || lowerMessage.includes('failed to fetch')) {
        return 'Erro de conexão. Verifique sua internet.';
    }
    if (lowerMessage.includes('jwt expired')) {
        return 'Sua sessão expirou. Por favor, faça login novamente.';
    }
    if (lowerMessage.includes('signup is disabled')) {
        return 'O cadastro de novos usuários está desativado.';
    }
    if (lowerMessage.includes('anonymous sign-ins are disabled')) {
        return 'Logins anônimos não são permitidos.';
    }
    if (lowerMessage.includes('too many requests') || lowerMessage.includes('rate limit')) {
        return 'Muitas solicitações. Tente novamente em alguns minutos.';
    }
    if (lowerMessage.includes('database error')) {
        return 'Erro no banco de dados. Tente novamente mais tarde.';
    }
    if (lowerMessage.includes('new row violates row-level security')) {
        return 'Erro de permissão: Você não tem autorização para salvar este registro ou sua sessão expirou.';
    }
    if (lowerMessage.includes('row level security') || lowerMessage.includes('permission denied')) {
        return 'Você não tem permissão para realizar esta ação.';
    }

    // Common Generic Errors
    if (lowerMessage.includes('internal server error')) {
        return 'Erro interno no servidor. Tente novamente mais tarde.';
    }
    if (lowerMessage.includes('not found')) {
        return 'Recurso não encontrado.';
    }

    // If no translation found, try to clean up the message or return it as is
    // But since the user specifically asked for Portuguese, we could return a generic message 
    // if we don't recognize the error, or just the original if it's already in PT.
    
    // Check if it's already in Portuguese (contains common PT words)
    const ptWords = ['erro', 'falha', 'sucesso', 'usuário', 'senha', 'não', 'inválido'];
    const isAlreadyPT = ptWords.some(word => lowerMessage.includes(word));
    
    if (isAlreadyPT) return message;

    return message; // Fallback to original message if no mapping found
};
