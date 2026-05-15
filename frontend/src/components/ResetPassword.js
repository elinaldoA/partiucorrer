
import React, { useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import axios from 'axios';
import toast from 'react-hot-toast';
import { FaLock, FaEye, FaEyeSlash, FaCheckCircle } from 'react-icons/fa';
const ResetPassword = () => {
    const { token } = useParams();
    const navigate = useNavigate();
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [loading, setLoading] = useState(false);
    const [submitted, setSubmitted] = useState(false);
    const handleSubmit = async (e) => {
        e.preventDefault();
        if (password.length < 6) {
            toast.error('A senha deve ter no mínimo 6 caracteres');
            return;
        }
        if (password !== confirmPassword) {
            toast.error('As senhas não coincidem');
            return;
        }
        setLoading(true);
        try {
            await axios.post(`http://localhost:5000/api/auth/reset-password/${token}`, { password });
            setSubmitted(true);
            toast.success('Senha alterada com sucesso!');
            setTimeout(() => {
                navigate('/login');
            }, 3000);
        } catch (error) {
            toast.error(error.response?.data?.error || 'Erro ao redefinir senha');
        } finally {
            setLoading(false);
        }
    };
    if (submitted) {
        return (
            <div className="min-h-screen flex items-center justify-center px-4 bg-gradient-to-br from-blue-50 to-purple-50">
                <div className="max-w-md w-full text-center animate-fadeInUp">
                    <div className="bg-white rounded-2xl shadow-xl p-8">
                        <FaCheckCircle className="text-6xl text-green-500 mx-auto mb-4" />
                        <h2 className="text-2xl font-bold text-gray-800 mb-2">Senha Alterada!</h2>
                        <p className="text-gray-600 mb-6">
                            Sua senha foi alterada com sucesso. Você será redirecionado para o login.
                        </p>
                        <div className="spinner mx-auto"></div>
                    </div>
                </div>
            </div>
        );
    }
    return (
        <div className="min-h-screen flex items-center justify-center px-4 bg-gradient-to-br from-blue-50 to-purple-50">
            <div className="max-w-md w-full animate-fadeInUp">
                <div className="text-center mb-8">
                    <div className="inline-flex p-4 bg-gradient-to-r from-blue-600 to-purple-600 rounded-2xl shadow-xl mb-4">
                        <FaLock className="text-4xl text-white" />
                    </div>
                    <h2 className="text-2xl font-bold text-gray-800">Redefinir Senha</h2>
                    <p className="text-gray-600 mt-2">
                        Digite sua nova senha abaixo.
                    </p>
                </div>
                <div className="bg-white/90 backdrop-blur-sm rounded-2xl shadow-xl p-8">
                    <form onSubmit={handleSubmit} className="space-y-6">
                        <div>
                            <label className="input-label">Nova Senha</label>
                            <div className="relative">
                                <FaLock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                                <input
                                    type={showPassword ? 'text' : 'password'}
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    className="input-field pl-10 pr-10"
                                    placeholder="••••••"
                                    required
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowPassword(!showPassword)}
                                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                                >
                                    {showPassword ? <FaEyeSlash /> : <FaEye />}
                                </button>
                            </div>
                            <p className="text-xs text-gray-500 mt-1">Mínimo de 6 caracteres</p>
                        </div>
                        <div>
                            <label className="input-label">Confirmar Nova Senha</label>
                            <div className="relative">
                                <FaLock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                                <input
                                    type={showPassword ? 'text' : 'password'}
                                    value={confirmPassword}
                                    onChange={(e) => setConfirmPassword(e.target.value)}
                                    className="input-field pl-10"
                                    placeholder="••••••"
                                    required
                                />
                            </div>
                        </div>
                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full btn-primary py-3"
                        >
                            {loading ? (
                                <div className="flex items-center justify-center gap-2">
                                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                                    Alterando...
                                </div>
                            ) : (
                                'Redefinir Senha'
                            )}
                        </button>
                        <div className="text-center">
                            <Link to="/login" className="text-blue-600 hover:text-blue-700 text-sm">
                                Voltar para o Login
                            </Link>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
};
export default ResetPassword;