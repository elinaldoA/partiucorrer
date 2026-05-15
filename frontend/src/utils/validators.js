export const validators = {
    email(email) {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!email) return 'Email é obrigatório';
      if (!emailRegex.test(email)) return 'Email inválido';
      return null;
    },
    password(password, options = {}) {
      const { minLength = 8, requireNumbers = true, requireSpecialChars = true } = options;
      if (!password) return 'Senha é obrigatória';
      if (password.length < minLength) return `Senha deve ter no mínimo ${minLength} caracteres`;
      if (requireNumbers && !/\d/.test(password)) return 'Senha deve conter pelo menos um número';
      if (requireSpecialChars && !/[!@#$%^&*(),.?":{}|<>]/.test(password)) {
        return 'Senha deve conter pelo menos um caractere especial';
      }
      return null;
    },
    confirmPassword(password, confirmPassword) {
      if (!confirmPassword) return 'Confirmação de senha é obrigatória';
      if (password !== confirmPassword) return 'Senhas não conferem';
      return null;
    },
    name(name) {
      if (!name) return 'Nome é obrigatório';
      if (name.length < 2) return 'Nome deve ter no mínimo 2 caracteres';
      if (name.length > 100) return 'Nome deve ter no máximo 100 caracteres';
      return null;
    },
    required(value, fieldName) {
      if (!value || (typeof value === 'string' && !value.trim())) {
        return `${fieldName} é obrigatório`;
      }
      return null;
    },
  };