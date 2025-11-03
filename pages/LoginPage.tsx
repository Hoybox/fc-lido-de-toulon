import React, { useState } from 'react';
import { useAuth } from '../hooks/useAuth';
import Logo from '../components/Logo';
import { EyeIcon, EyeSlashIcon } from '../components/icons/Icons';

const ForgotPasswordModal: React.FC<{ onClose: () => void }> = ({ onClose }) => {
    const [loginId, setLoginId] = useState('');
    const [message, setMessage] = useState('');
    const [isSending, setIsSending] = useState(false);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!loginId) {
            setMessage("Veuillez entrer votre identifiant.");
            return;
        }
        setIsSending(true);
        setMessage("Envoi en cours...");
        
        // Simule une requête réseau
        setTimeout(() => {
            setIsSending(false);
            setMessage("Si un compte correspondant à cet identifiant existe, les instructions pour réinitialiser le mot de passe ont été envoyées.");
        }, 2000);
    };

    return (
        <div className="modal-overlay fixed inset-0 bg-black/70 flex items-center justify-center backdrop-blur-sm z-50" onClick={onClose}>
            <div className="bg-gray-800 rounded-lg shadow-xl p-8 max-w-md w-full border border-rose-500" onClick={e => e.stopPropagation()}>
                <h2 className="text-2xl font-bold mb-6 text-white">Mot de passe oublié</h2>
                <p className="text-gray-400 mb-4 text-sm">Entrez votre identifiant pour recevoir les instructions de réinitialisation.</p>
                <form onSubmit={handleSubmit} className="space-y-4">
                     <div>
                        <label htmlFor="loginId_reset" className="block text-sm font-medium text-gray-300">Identifiant</label>
                        <input
                            type="text"
                            id="loginId_reset"
                            value={loginId}
                            onChange={(e) => setLoginId(e.target.value)}
                            className="mt-1 block w-full bg-gray-700 border border-gray-600 rounded-md shadow-sm py-2 px-3 text-white focus:outline-none focus:ring-rose-500 focus:border-rose-500"
                            required
                        />
                     </div>
                    {message && <p className={`text-sm ${isSending ? 'text-yellow-400' : 'text-green-400'}`}>{message}</p>}
                     <div className="flex justify-end gap-4 pt-4">
                        <button type="button" onClick={onClose} className="px-4 py-2 rounded bg-gray-600 hover:bg-gray-500" disabled={isSending}>Annuler</button>
                        <button type="submit" className="px-4 py-2 rounded bg-rose-600 hover:bg-rose-700 disabled:bg-gray-500" disabled={isSending}>
                            {isSending ? 'Envoi...' : 'Envoyer'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};


const LoginPage: React.FC = () => {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [isPasswordVisible, setIsPasswordVisible] = useState(false);
    const [isForgotPasswordOpen, setIsForgotPasswordOpen] = useState(false);
    const { login } = useAuth();

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        const success = login(username, password);
        if (!success) {
            setError('Identifiant ou mot de passe incorrect.');
        }
    };

    return (
        <>
        {isForgotPasswordOpen && <ForgotPasswordModal onClose={() => setIsForgotPasswordOpen(false)} />}
        <div className="min-h-screen flex items-center justify-center bg-gray-900">
            <div className="max-w-md w-full bg-gray-800 p-8 rounded-lg shadow-2xl shadow-rose-500/20 border border-gray-700">
                <div className="text-center mb-8">
                    <Logo className="w-24 h-24 mx-auto mb-4 rounded-2xl" />
                    <h1 className="text-3xl font-bold text-white">FC LIDO de Toulon</h1>
                    <p className="text-gray-400">Portail de gestion</p>
                </div>
                <form onSubmit={handleSubmit} className="space-y-6">
                    <div>
                        <label htmlFor="username" className="block text-sm font-medium text-gray-300">Identifiant</label>
                        <input
                            type="text"
                            id="username"
                            value={username}
                            onChange={(e) => setUsername(e.target.value)}
                            className="mt-1 block w-full bg-gray-700 border border-gray-600 rounded-md shadow-sm py-2 px-3 text-white focus:outline-none focus:ring-rose-500 focus:border-rose-500"
                            required
                        />
                    </div>
                    <div>
                        <label htmlFor="password" className="block text-sm font-medium text-gray-300">Mot de passe</label>
                        <div className="relative mt-1">
                            <input
                                type={isPasswordVisible ? 'text' : 'password'}
                                id="password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                className="block w-full bg-gray-700 border border-gray-600 rounded-md shadow-sm py-2 px-3 text-white focus:outline-none focus:ring-rose-500 focus:border-rose-500 pr-10"
                                required
                            />
                            <button
                                type="button"
                                onClick={() => setIsPasswordVisible(!isPasswordVisible)}
                                className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-white"
                                aria-label={isPasswordVisible ? "Cacher le mot de passe" : "Afficher le mot de passe"}
                            >
                                {isPasswordVisible ? <EyeSlashIcon /> : <EyeIcon />}
                            </button>
                        </div>
                        <div className="text-right mt-2">
                             <button
                                type="button"
                                onClick={() => setIsForgotPasswordOpen(true)}
                                className="text-sm text-rose-400 hover:text-rose-300"
                            >
                                Mot de passe oublié ?
                            </button>
                        </div>
                    </div>
                    {error && <p className="text-sm text-red-500">{error}</p>}
                    <div>
                        <button
                            type="submit"
                            className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-rose-600 hover:bg-rose-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-gray-800 focus:ring-rose-500 transition-transform transform hover:scale-105"
                        >
                            Connexion
                        </button>
                    </div>
                </form>
            </div>
        </div>
        </>
    );
};

export default LoginPage;