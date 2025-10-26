// Mock authentication system with localStorage persistence
// Compatible with Next.js App Router and React 19
"use client";
export interface User {
  id: string;
  name: string;
  email: string;
  createdAt: string;
}

const USERS_KEY = 'checkout_app_users';
const CURRENT_USER_KEY = 'checkout_app_current_user';

// Check if we're in a browser environment
const isBrowser = typeof window !== 'undefined';

export const authService = {
  // Get all registered users
  getUsers(): User[] {
    if (!isBrowser) return [];
    
    try {
      const users = localStorage.getItem(USERS_KEY);
      return users ? JSON.parse(users) : [];
    } catch (error) {
      console.error('Error getting users from localStorage:', error);
      return [];
    }
  },

  // Save users to localStorage
  saveUsers(users: User[]) {
    if (!isBrowser) return;
    
    try {
      localStorage.setItem(USERS_KEY, JSON.stringify(users));
    } catch (error) {
      console.error('Error saving users to localStorage:', error);
    }
  },

  // Get current logged in user
  getCurrentUser(): User | null {
    if (!isBrowser) return null;
    
    try {
      const user = localStorage.getItem(CURRENT_USER_KEY);
      return user ? JSON.parse(user) : null;
    } catch (error) {
      console.error('Error getting current user from localStorage:', error);
      return null;
    }
  },

  // Check if user is authenticated
  isAuthenticated(): boolean {
    if (!isBrowser) return false;
    return !!this.getCurrentUser();
  },

  // Register new user
  register(name: string, email: string, password: string): { success: boolean; error?: string; user?: User } {
    if (!isBrowser) {
      return { success: false, error: 'LocalStorage não disponível' };
    }

    try {
      const users = this.getUsers();
      
      // Check if email already exists
      if (users.find(u => u.email === email)) {
        return { success: false, error: 'Este e-mail já está cadastrado' };
      }

      // Validate input
      if (!name.trim() || !email.trim() || !password.trim()) {
        return { success: false, error: 'Todos os campos são obrigatórios' };
      }

      if (password.length < 6) {
        return { success: false, error: 'A senha deve ter pelo menos 6 caracteres' };
      }

      // Create new user
      const newUser: User = {
        id: crypto.randomUUID(), // More secure than Math.random()
        name: name.trim(),
        email: email.trim().toLowerCase(),
        createdAt: new Date().toISOString(),
      };

      users.push(newUser);
      this.saveUsers(users);
      localStorage.setItem(CURRENT_USER_KEY, JSON.stringify(newUser));

      return { success: true, user: newUser };
    } catch (error) {
      console.error('Error during registration:', error);
      return { success: false, error: 'Erro interno do sistema' };
    }
  },

  // Login user
  login(email: string, password: string): { success: boolean; error?: string; user?: User } {
    if (!isBrowser) {
      return { success: false, error: 'LocalStorage não disponível' };
    }

    try {
      const users = this.getUsers();
      const user = users.find(u => u.email === email.toLowerCase().trim());

      if (!user) {
        return { success: false, error: 'E-mail ou senha incorretos' };
      }

      // In a real app, you would verify the password against a hashed version
      // For this mock, we're just checking if password is provided
      if (!password.trim()) {
        return { success: false, error: 'Senha é obrigatória' };
      }

      localStorage.setItem(CURRENT_USER_KEY, JSON.stringify(user));
      return { success: true, user };
    } catch (error) {
      console.error('Error during login:', error);
      return { success: false, error: 'Erro interno do sistema' };
    }
  },

  // Logout user
  logout(): void {
    if (!isBrowser) return;
    
    try {
      localStorage.removeItem(CURRENT_USER_KEY);
    } catch (error) {
      console.error('Error during logout:', error);
    }
  },

  // Update user profile
  updateProfile(userId: string, updates: Partial<User>): { success: boolean; error?: string; user?: User } {
    if (!isBrowser) {
      return { success: false, error: 'LocalStorage não disponível' };
    }

    try {
      const users = this.getUsers();
      const userIndex = users.findIndex(u => u.id === userId);
      
      if (userIndex === -1) {
        return { success: false, error: 'Usuário não encontrado' };
      }

      // Check if email is being changed and if it's already taken
      if (updates.email && updates.email !== users[userIndex].email) {
        const emailExists = users.some(u => u.email === updates.email && u.id !== userId);
        if (emailExists) {
          return { success: false, error: 'Este e-mail já está em uso' };
        }
      }

      // Update user
      users[userIndex] = { ...users[userIndex], ...updates };
      this.saveUsers(users);

      // Update current user if it's the same user
      const currentUser = this.getCurrentUser();
      if (currentUser && currentUser.id === userId) {
        localStorage.setItem(CURRENT_USER_KEY, JSON.stringify(users[userIndex]));
      }

      return { success: true, user: users[userIndex] };
    } catch (error) {
      console.error('Error updating profile:', error);
      return { success: false, error: 'Erro interno do sistema' };
    }
  },

  // Change password
  changePassword(userId: string, currentPassword: string, newPassword: string): { success: boolean; error?: string } {
    if (!isBrowser) {
      return { success: false, error: 'LocalStorage não disponível' };
    }

    try {
      const users = this.getUsers();
      const user = users.find(u => u.id === userId);
      
      if (!user) {
        return { success: false, error: 'Usuário não encontrado' };
      }

      // In a real app, you would verify the current password against a hashed version
      // For this mock, we're just checking if current password is provided
      if (!currentPassword.trim()) {
        return { success: false, error: 'Senha atual é obrigatória' };
      }

      if (newPassword.length < 6) {
        return { success: false, error: 'A nova senha deve ter pelo menos 6 caracteres' };
      }

      // In a real app, you would hash and save the new password
      // For this mock, we're just returning success

      return { success: true };
    } catch (error) {
      console.error('Error changing password:', error);
      return { success: false, error: 'Erro interno do sistema' };
    }
  },

  // Clear all data (for testing/development)
  clearAllData(): void {
    if (!isBrowser) return;
    
    try {
      localStorage.removeItem(USERS_KEY);
      localStorage.removeItem(CURRENT_USER_KEY);
    } catch (error) {
      console.error('Error clearing data:', error);
    }
  },
};