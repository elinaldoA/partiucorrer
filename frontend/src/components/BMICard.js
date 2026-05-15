
import React, { useState, useEffect } from 'react';
import { FaWeight, FaRulerVertical, FaChartLine, FaEdit, FaSave, FaTimes } from 'react-icons/fa';
import axios from 'axios';
import toast from 'react-hot-toast';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
const BMICard = () => {
    const [bmiData, setBmiData] = useState(null);
    const [editing, setEditing] = useState(false);
    const [weight, setWeight] = useState('');
    const [height, setHeight] = useState('');
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    useEffect(() => {
        fetchBMIData();
    }, []);
    const fetchBMIData = async () => {
        try {
            const token = localStorage.getItem('token');
            const response = await axios.get('http://localhost:5000/api/users/bmi-history', {
                headers: { Authorization: `Bearer ${token}` }
            });
            setBmiData(response.data);
            if (response.data?.weight) setWeight(response.data.weight);
            if (response.data?.height) setHeight(response.data.height);
        } catch (error) {
            console.error('Error fetching BMI:', error);
        } finally {
            setLoading(false);
        }
    };
    const saveMeasurements = async () => {
        if (!weight || !height) {
            toast.error('Preencha peso e altura');
            return;
        }
        setSaving(true);
        try {
            const token = localStorage.getItem('token');
            const response = await axios.put(
                'http://localhost:5000/api/users/body-measurements',
                { 
                    weight: parseFloat(weight), 
                    height: parseFloat(height) 
                },
                { headers: { Authorization: `Bearer ${token}` } }
            );
            setBmiData(prev => ({ 
                ...prev, 
                ...response.data,
                weight: response.data.weight,
                height: response.data.height
            }));
            setEditing(false);
            toast.success('Medidas atualizadas!');
            fetchBMIData(); 
        } catch (error) {
            toast.error('Erro ao salvar medidas');
        } finally {
            setSaving(false);
        }
    };
    const getBMIColor = (bmi) => {
        if (!bmi) return 'text-gray-400';
        if (bmi < 18.5) return 'text-blue-500';
        if (bmi < 25) return 'text-green-500';
        if (bmi < 30) return 'text-yellow-500';
        if (bmi < 35) return 'text-orange-500';
        return 'text-red-500';
    };
    const getBMIBgColor = (bmi) => {
        if (!bmi) return 'bg-gray-50';
        if (bmi < 18.5) return 'bg-blue-50 dark:bg-blue-900/20';
        if (bmi < 25) return 'bg-green-50 dark:bg-green-900/20';
        if (bmi < 30) return 'bg-yellow-50 dark:bg-yellow-900/20';
        if (bmi < 35) return 'bg-orange-50 dark:bg-orange-900/20';
        return 'bg-red-50 dark:bg-red-900/20';
    };
    const getBMIClassification = (bmi) => {
        if (!bmi) return '';
        if (bmi < 18.5) return 'Abaixo do peso';
        if (bmi < 25) return 'Peso normal';
        if (bmi < 30) return 'Sobrepeso';
        if (bmi < 35) return 'Obesidade grau I';
        if (bmi < 40) return 'Obesidade grau II';
        return 'Obesidade grau III';
    };
    if (loading) {
        return (
            <div className="card animate-pulse">
                <div className="h-24 bg-gray-200 dark:bg-gray-700 rounded-lg"></div>
            </div>
        );
    }
    const hasData = bmiData?.weight && bmiData?.height;
    const bmi = bmiData?.bmi;
    const historyData = bmiData?.history || [];
    const calorieStats = bmiData?.calorie_stats;
    return (
        <div className={`card ${getBMIBgColor(bmi)} transition-colors duration-300`}>
            {}
            <div className="flex justify-between items-center mb-4">
                <h3 className="font-bold text-gray-800 dark:text-white flex items-center gap-2">
                    <FaWeight className="text-blue-500" />
                    Composição Corporal
                </h3>
                <button
                    onClick={() => setEditing(!editing)}
                    className="text-blue-500 hover:text-blue-600 p-1 rounded-lg hover:bg-white/50"
                >
                    {editing ? <FaTimes /> : <FaEdit />}
                </button>
            </div>
            {editing ? (
                <div className="space-y-3">
                    <div>
                        <label className="text-xs text-gray-500 dark:text-gray-400">Peso (kg)</label>
                        <input
                            type="number"
                            step="0.1"
                            min="30"
                            max="300"
                            value={weight}
                            onChange={(e) => setWeight(e.target.value)}
                            className="input-field"
                            placeholder="Ex: 70.5"
                        />
                    </div>
                    <div>
                        <label className="text-xs text-gray-500 dark:text-gray-400">Altura (m)</label>
                        <input
                            type="number"
                            step="0.01"
                            min="1.00"
                            max="2.50"
                            value={height}
                            onChange={(e) => setHeight(e.target.value)}
                            className="input-field"
                            placeholder="Ex: 1.75"
                        />
                    </div>
                    <div className="flex gap-2">
                        <button 
                            onClick={saveMeasurements} 
                            disabled={saving}
                            className="btn-primary flex-1 text-sm py-2 flex items-center justify-center gap-2"
                        >
                            {saving ? 'Salvando...' : <><FaSave /> Salvar</>}
                        </button>
                        <button 
                            onClick={() => setEditing(false)} 
                            className="btn-secondary flex-1 text-sm py-2"
                        >
                            Cancelar
                        </button>
                    </div>
                </div>
            ) : !hasData ? (
                <div className="text-center py-6">
                    <FaRulerVertical className="text-4xl text-gray-400 mx-auto mb-2" />
                    <p className="text-gray-500 text-sm">Registre seu peso e altura</p>
                    <p className="text-gray-400 text-xs mt-1">Para receber recomendações personalizadas</p>
                    <button
                        onClick={() => setEditing(true)}
                        className="text-blue-500 text-sm mt-2 hover:underline"
                    >
                        Registrar agora
                    </button>
                </div>
            ) : (
                <div className="space-y-4">
                    {}
                    <div className="text-center bg-white dark:bg-gray-800 rounded-xl p-4">
                        <span className={`text-4xl font-bold ${getBMIColor(bmi)}`}>
                            {bmi}
                        </span>
                        <p className="text-sm text-gray-500 mt-1">IMC Atual</p>
                        <span className={`inline-block mt-2 px-3 py-1 rounded-full text-sm font-semibold ${getBMIColor(bmi)} bg-white dark:bg-gray-700`}>
                            {getBMIClassification(bmi)}
                        </span>
                    </div>
                    {}
                    <div className="grid grid-cols-2 gap-3">
                        <div className="bg-white dark:bg-gray-800 rounded-lg p-3 text-center">
                            <FaWeight className="mx-auto text-blue-500 mb-1" />
                            <p className="font-bold text-gray-800 dark:text-white">{bmiData.weight} kg</p>
                            <p className="text-xs text-gray-500">Peso</p>
                        </div>
                        <div className="bg-white dark:bg-gray-800 rounded-lg p-3 text-center">
                            <FaRulerVertical className="mx-auto text-purple-500 mb-1" />
                            <p className="font-bold text-gray-800 dark:text-white">{bmiData.height} m</p>
                            <p className="text-xs text-gray-500">Altura</p>
                        </div>
                    </div>
                    {}
                    {calorieStats && (
                        <div className="bg-white dark:bg-gray-800 rounded-lg p-3">
                            <p className="text-xs text-gray-500 mb-2">🔥 Calorias (últimos 30 dias)</p>
                            <div className="grid grid-cols-2 gap-2 text-center">
                                <div>
                                    <p className="font-bold text-orange-500">{calorieStats.total_calories}</p>
                                    <p className="text-xs text-gray-400">Total kcal</p>
                                </div>
                                <div>
                                    <p className="font-bold text-orange-500">{calorieStats.avg_calories_per_run}</p>
                                    <p className="text-xs text-gray-400">Média/corrida</p>
                                </div>
                            </div>
                        </div>
                    )}
                    {}
                    {historyData.length > 1 && (
                        <div className="bg-white dark:bg-gray-800 rounded-lg p-3">
                            <h4 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">Evolução do IMC</h4>
                            <ResponsiveContainer width="100%" height={120}>
                                <LineChart data={historyData.reverse().map(h => ({
                                    date: new Date(h.recorded_at).toLocaleDateString('pt-BR', { month: 'short', day: 'numeric' }),
                                    bmi: h.bmi
                                }))}>
                                    <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
                                    <XAxis dataKey="date" tick={{ fontSize: 10 }} />
                                    <YAxis domain={['auto', 'auto']} tick={{ fontSize: 10 }} />
                                    <Tooltip />
                                    <Line 
                                        type="monotone" 
                                        dataKey="bmi" 
                                        stroke={bmi < 25 ? '#10B981' : '#F59E0B'} 
                                        strokeWidth={2}
                                        dot={{ r: 3 }}
                                    />
                                </LineChart>
                            </ResponsiveContainer>
                        </div>
                    )}
                    {}
                    {bmiData?.recommendations && (
                        <div className="bg-white dark:bg-gray-800 rounded-lg p-3">
                            <p className="text-xs font-semibold text-gray-700 dark:text-gray-300 mb-2">💡 Recomendações:</p>
                            <ul className="space-y-1">
                                {bmiData.recommendations.map((rec, idx) => (
                                    <li key={idx} className="text-xs text-gray-600 dark:text-gray-400 flex items-start gap-2">
                                        <span className="text-blue-500 mt-0.5">•</span>
                                        {rec}
                                    </li>
                                ))}
                            </ul>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
};
export default BMICard;