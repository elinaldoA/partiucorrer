
import React, { useState, useRef } from 'react';
import axios from 'axios';
import toast from 'react-hot-toast';
import { FaCamera, FaTrash, FaSpinner, FaUser, FaTimes } from 'react-icons/fa';
import AvatarEditor from 'react-avatar-editor';
const AvatarUpload = ({ user, setUser, currentAvatar }) => {
    const [uploading, setUploading] = useState(false);
    const [showEditor, setShowEditor] = useState(false);
    const [showConfirmDelete, setShowConfirmDelete] = useState(false);
    const [selectedFile, setSelectedFile] = useState(null);
    const [scale, setScale] = useState(1);
    const editorRef = useRef(null);
    const handleFileSelect = (e) => {
        const file = e.target.files[0];
        if (file) {
            const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp'];
            if (!allowedTypes.includes(file.type)) {
                toast.error('Formato não suportado. Use JPG, PNG, GIF ou WEBP');
                return;
            }
            if (file.size > 5 * 1024 * 1024) {
                toast.error('Imagem muito grande. Máximo 5MB');
                return;
            }
            setSelectedFile(file);
            setShowEditor(true);
        }
    };
    const handleSaveAvatar = async () => {
        if (!editorRef.current) return;
        setUploading(true);
        try {
            const canvas = editorRef.current.getImageScaledToCanvas();
            const blob = await new Promise(resolve => canvas.toBlob(resolve, 'image/png'));
            const formData = new FormData();
            formData.append('avatar', blob, 'avatar.png');
            const token = localStorage.getItem('token');
            const response = await axios.post('http://localhost:5000/api/users/avatar', formData, {
                headers: { 
                    Authorization: `Bearer ${token}`,
                    'Content-Type': 'multipart/form-data'
                }
            });
            const updatedUser = { ...user, avatar_url: response.data.avatarUrl };
            localStorage.setItem('user', JSON.stringify(updatedUser));
            setUser(updatedUser);
            toast.success('Avatar atualizado!');
            setShowEditor(false);
            setSelectedFile(null);
            setScale(1);
        } catch (error) {
            console.error('Upload error:', error);
            toast.error(error.response?.data?.error || 'Erro ao fazer upload');
        } finally {
            setUploading(false);
        }
    };
    const handleRemoveAvatar = async () => {
        setUploading(true);
        try {
            const token = localStorage.getItem('token');
            await axios.delete('http://localhost:5000/api/users/avatar', {
                headers: { Authorization: `Bearer ${token}` }
            });
            const updatedUser = { ...user, avatar_url: null };
            localStorage.setItem('user', JSON.stringify(updatedUser));
            setUser(updatedUser);
            toast.success('Avatar removido!');
            setShowConfirmDelete(false);
        } catch (error) {
            console.error('Remove error:', error);
            toast.error('Erro ao remover avatar');
        } finally {
            setUploading(false);
        }
    };
    const getAvatarUrl = () => {
        if (currentAvatar && currentAvatar !== 'null' && currentAvatar !== 'undefined') {
            return `http://localhost:5000${currentAvatar}`;
        }
        return null;
    };
    return (
        <div className="relative">
            <div className="relative inline-block group">
                {getAvatarUrl() ? (
                    <img
                        src={getAvatarUrl()}
                        alt={user?.name}
                        className="w-32 h-32 rounded-full object-cover shadow-xl border-4 border-white dark:border-gray-700"
                        onError={(e) => {
                            e.target.style.display = 'none';
                            e.target.parentElement.innerHTML = `
                                <div class="w-32 h-32 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-5xl text-white shadow-xl">
                                    ${user?.name?.charAt(0).toUpperCase()}
                                </div>
                            `;
                        }}
                    />
                ) : (
                    <div className="w-32 h-32 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-5xl text-white shadow-xl">
                        {user?.name?.charAt(0).toUpperCase()}
                    </div>
                )}
                <div className="absolute inset-0 bg-black/50 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer">
                    <label className="cursor-pointer w-full h-full flex items-center justify-center">
                        <FaCamera className="text-white text-2xl" />
                        <input
                            type="file"
                            accept="image/*"
                            onChange={handleFileSelect}
                            className="hidden"
                        />
                    </label>
                </div>
                {getAvatarUrl() && (
                    <button
                        onClick={() => setShowConfirmDelete(true)}
                        className="absolute -bottom-2 -right-2 bg-red-500 text-white p-2 rounded-full hover:bg-red-600 transition-colors shadow-lg"
                        title="Remover avatar"
                    >
                        <FaTrash size={12} />
                    </button>
                )}
            </div>

            {showConfirmDelete && (
                <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 animate-fadeInUp">
                    <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 max-w-sm w-full">
                        <div className="text-center">
                            <div className="w-16 h-16 bg-red-100 dark:bg-red-900/30 rounded-full flex items-center justify-center mx-auto mb-4">
                                <FaTrash className="text-red-500 text-2xl" />
                            </div>
                            <h3 className="text-xl font-bold text-gray-800 dark:text-white mb-2">
                                Remover Avatar?
                            </h3>
                            <p className="text-gray-500 dark:text-gray-400 mb-6">
                                Tem certeza que deseja remover seu avatar? Isso não pode ser desfeito.
                            </p>
                            <div className="flex gap-3">
                                <button
                                    onClick={handleRemoveAvatar}
                                    disabled={uploading}
                                    className="flex-1 bg-red-500 text-white py-2 rounded-lg hover:bg-red-600 transition-colors"
                                >
                                    {uploading ? <FaSpinner className="animate-spin mx-auto" /> : 'Remover'}
                                </button>
                                <button
                                    onClick={() => setShowConfirmDelete(false)}
                                    className="flex-1 bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 py-2 rounded-lg hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors"
                                >
                                    Cancelar
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
            {}
            {showEditor && selectedFile && (
                <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 animate-fadeInUp">
                    <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 max-w-md w-full">
                        <div className="flex justify-between items-center mb-4">
                            <h3 className="text-xl font-bold text-gray-800 dark:text-white">
                                Editar Avatar
                            </h3>
                            <button
                                onClick={() => {
                                    setShowEditor(false);
                                    setSelectedFile(null);
                                    setScale(1);
                                }}
                                className="text-gray-400 hover:text-gray-600"
                            >
                                <FaTimes />
                            </button>
                        </div>
                        <div className="flex justify-center mb-4">
                            <AvatarEditor
                                ref={editorRef}
                                image={selectedFile}
                                width={250}
                                height={250}
                                border={50}
                                borderRadius={125}
                                color={[0, 0, 0, 0.6]}
                                scale={scale}
                                rotate={0}
                            />
                        </div>
                        <div className="mb-4">
                            <label className="text-sm text-gray-600 dark:text-gray-400 block mb-2">
                                Zoom: {Math.round(scale * 100)}%
                            </label>
                            <input
                                type="range"
                                min="1"
                                max="3"
                                step="0.01"
                                value={scale}
                                onChange={(e) => setScale(parseFloat(e.target.value))}
                                className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer dark:bg-gray-700"
                            />
                        </div>
                        <div className="flex gap-3">
                            <button
                                onClick={handleSaveAvatar}
                                disabled={uploading}
                                className="flex-1 btn-primary py-2"
                            >
                                {uploading ? <FaSpinner className="animate-spin mx-auto" /> : 'Salvar'}
                            </button>
                            <button
                                onClick={() => {
                                    setShowEditor(false);
                                    setSelectedFile(null);
                                    setScale(1);
                                }}
                                className="flex-1 btn-secondary py-2"
                            >
                                Cancelar
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};
export default AvatarUpload;