
import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import toast from 'react-hot-toast';
import { FaEnvelope, FaArrowLeft, FaCheckCircle } from 'react-icons/fa';
const ForgotPassword = () => {
    const [email, setEmail] = useState('');
    const [loading, setLoading] = useState(false);
    const [submitted, setSubmitted] = useState(false);
    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!email) {
            toast.error('Digite seu e-mail');
            return;
        }
        setLoading(true);
        try {
            await axios.post('http://localhost:5000/api/auth/forgot-password', { email });
            setSubmitted(true);
            toast.success('Instruções enviadas! Verifique seu e-mail.');
        } catch (error) {
            toast.error('Erro ao processar solicitação');
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
                        <h2 className="text-2xl font-bold text-gray-800 mb-2">E-mail Enviado!</h2>
                        <p className="text-gray-600 mb-6">
                            Enviamos um link de recuperação para <strong>{email}</strong>.
                            Verifique sua caixa de entrada e spam.
                        </p>
                        <Link to="/login" className="btn-primary inline-block">
                            Voltar para o Login
                        </Link>
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
                        <FaEnvelope className="text-4xl text-white" />
                    </div>
                    <h2 className="text-2xl font-bold text-gray-800">Esqueceu a senha?</h2>
                    <p className="text-gray-600 mt-2">
                        Digite seu e-mail e enviaremos um link para redefinir sua senha.
                    </p>
                </div>
                <div className="bg-white/90 backdrop-blur-sm rounded-2xl shadow-xl p-8">
                    <form onSubmit={handleSubmit} className="space-y-6">
                        <div>
                            <label className="input-label">E-mail</label>
                            <div className="relative">
                                <FaEnvelope className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                                <input
                                    type="email"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    className="input-field pl-10"
                                    placeholder="seu@email.com"
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
                                    Enviando...
                                </div>
                            ) : (
                                'Enviar Link de Recuperação'
                            )}
                        </button>
                        <div className="text-center">
                            <Link to="/login" className="text-blue-600 hover:text-blue-700 text-sm flex items-center justify-center gap-1">
                                <FaArrowLeft className="text-xs" />
                                Voltar para o Login
                            </Link>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
};
export default ForgotPassword;