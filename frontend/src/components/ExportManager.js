
import React, { useState, useEffect } from 'react';
import axios from 'axios';
import toast from 'react-hot-toast';
import { FaDownload, FaSpinner, FaCheckCircle, FaTimesCircle } from 'react-icons/fa';
import { useLanguage } from '../contexts/LanguageContext';
const ExportManager = ({ onClose }) => {
    const { t } = useLanguage();
    const [runs, setRuns] = useState([]);
    const [loading, setLoading] = useState(true);
    const [exporting, setExporting] = useState(false);
    const [selectedRuns, setSelectedRuns] = useState([]);
    const [exportProgress, setExportProgress] = useState({});
    useEffect(() => {
        fetchRuns();
    }, []);
    const fetchRuns = async () => {
        try {
            const token = localStorage.getItem('token');
            const response = await axios.get('http://localhost:5000/api/runs/history', {
                headers: { Authorization: `Bearer ${token}` }
            });
            setRuns(response.data);
        } catch (error) {
            toast.error('Erro ao carregar corridas');
        } finally {
            setLoading(false);
        }
    };
    const toggleSelectRun = (runId) => {
        setSelectedRuns(prev => 
            prev.includes(runId) 
                ? prev.filter(id => id !== runId)
                : [...prev, runId]
        );
    };
    const selectAll = () => {
        if (selectedRuns.length === runs.length) {
            setSelectedRuns([]);
        } else {
            setSelectedRuns(runs.map(r => r.id));
        }
    };
    const exportSelected = async () => {
        if (selectedRuns.length === 0) {
            toast.error('Selecione pelo menos uma corrida');
            return;
        }
        setExporting(true);
        for (const runId of selectedRuns) {
            try {
                const run = runs.find(r => r.id === runId);
                const token = localStorage.getItem('token');
                const response = await axios.get(`http://localhost:5000/api/runs/${runId}/export-gpx`, {
                    headers: { Authorization: `Bearer ${token}` },
                    responseType: 'blob'
                });
                const url = window.URL.createObjectURL(new Blob([response.data]));
                const link = document.createElement('a');
                link.href = url;
                link.setAttribute('download', `corrida_${runId}_${new Date(run.start_time).toISOString().split('T')[0]}.gpx`);
                document.body.appendChild(link);
                link.click();
                link.remove();
                window.URL.revokeObjectURL(url);
                setExportProgress(prev => ({ ...prev, [runId]: 'success' }));
                await new Promise(resolve => setTimeout(resolve, 500));
            } catch (error) {
                setExportProgress(prev => ({ ...prev, [runId]: 'error' }));
            }
        }
        setExporting(false);
        toast.success(`${selectedRuns.length} corridas exportadas!`);
    };
    if (loading) {
        return (
            <div className="flex justify-center items-center h-64">
                <div className="spinner"></div>
            </div>
        );
    }
    return (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
            <div className="bg-white dark:bg-gray-800 rounded-2xl max-w-2xl w-full max-h-[80vh] overflow-hidden flex flex-col">
                {}
                <div className="p-6 border-b dark:border-gray-700 flex justify-between items-center">
                    <h2 className="text-2xl font-bold text-gray-800 dark:text-white">
                        Exportar Corridas para GPX
                    </h2>
                    <button onClick={onClose} className="text-gray-400 hover:text-gray-600">✕</button>
                </div>
                {}
                <div className="flex-1 overflow-y-auto p-6">
                    <div className="mb-4 flex justify-between items-center">
                        <div className="flex items-center gap-2">
                            <input
                                type="checkbox"
                                checked={selectedRuns.length === runs.length && runs.length > 0}
                                onChange={selectAll}
                                className="w-4 h-4"
                            />
                            <span className="text-sm text-gray-600 dark:text-gray-400">
                                Selecionar todos ({runs.length})
                            </span>
                        </div>
                        <button
                            onClick={exportSelected}
                            disabled={exporting || selectedRuns.length === 0}
                            className="btn-primary text-sm py-2 px-4 flex items-center gap-2"
                        >
                            {exporting ? <FaSpinner className="animate-spin" /> : <FaDownload />}
                            Exportar {selectedRuns.length} corrida(s)
                        </button>
                    </div>
                    <div className="space-y-2 max-h-96 overflow-y-auto">
                        {runs.map(run => (
                            <div
                                key={run.id}
                                className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-600 transition-colors"
                            >
                                <div className="flex items-center gap-3 flex-1">
                                    <input
                                        type="checkbox"
                                        checked={selectedRuns.includes(run.id)}
                                        onChange={() => toggleSelectRun(run.id)}
                                        className="w-4 h-4"
                                    />
                                    <div className="flex-1">
                                        <p className="font-semibold text-gray-800 dark:text-white">
                                            {run.title || `Corrida ${new Date(run.start_time).toLocaleDateString()}`}
                                        </p>
                                        <p className="text-xs text-gray-500 dark:text-gray-400">
                                            {new Date(run.start_time).toLocaleString()} • {run.distance}km • {run.pace}/km
                                        </p>
                                    </div>
                                    {exportProgress[run.id] === 'success' && (
                                        <FaCheckCircle className="text-green-500" />
                                    )}
                                    {exportProgress[run.id] === 'error' && (
                                        <FaTimesCircle className="text-red-500" />
                                    )}
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
};
export default ExportManager;