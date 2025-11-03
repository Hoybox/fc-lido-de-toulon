import React, { createContext, useState, useContext, ReactNode } from 'react';
import { User, Role } from '../types';
import useLocalStorage from './useLocalStorage';

interface UserCredentials {
    username: string;
    login_id: string;
    password_hash: string;
    role: Role;
}

const defaultUsers: UserCredentials[] = [
    { username: 'Admin', login_id: 'admin', password_hash: 'lido2025', role: Role.Admin },
    { username: 'Éditeur', login_id: 'editor', password_hash: 'lido2025', role: Role.Editor },
];

interface AuthContextType {
    user: User | null;
    login: (username: string, pass: string) => boolean;
    logout: () => void;
    changePassword: (currentUsername: string, oldPass: string, newPass: string) => { success: boolean, message: string };
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
    const [usersDB, setUsersDB] = useLocalStorage<UserCredentials[]>('fclido_users', defaultUsers);
    const [user, setUser] = useState<User | null>(null);

    const login = (loginId: string, pass: string): boolean => {
        const foundUser = usersDB.find(u => u.login_id.toLowerCase() === loginId.toLowerCase());
        if (foundUser && foundUser.password_hash === pass) {
            setUser({ username: foundUser.username, role: foundUser.role });
            return true;
        }
        return false;
    };

    const logout = () => {
        setUser(null);
    };

    const changePassword = (currentUsername: string, oldPass: string, newPass: string): { success: boolean, message: string } => {
        const userIndex = usersDB.findIndex(u => u.username === currentUsername);
        if (userIndex === -1) {
            return { success: false, message: 'Utilisateur non trouvé.' };
        }

        const userToUpdate = usersDB[userIndex];
        if (userToUpdate.password_hash !== oldPass) {
            return { success: false, message: 'Ancien mot de passe incorrect.' };
        }

        if (newPass.length < 4) {
            return { success: false, message: 'Le nouveau mot de passe doit contenir au moins 4 caractères.' };
        }

        const updatedUser = { ...userToUpdate, password_hash: newPass };
        const newUsersDB = [...usersDB];
        newUsersDB[userIndex] = updatedUser;
        setUsersDB(newUsersDB);

        return { success: true, message: 'Mot de passe mis à jour avec succès !' };
    };

    return (
        <AuthContext.Provider value={{ user, login, logout, changePassword }}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = (): AuthContextType => {
    const context = useContext(AuthContext);
    if (context === undefined) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
};