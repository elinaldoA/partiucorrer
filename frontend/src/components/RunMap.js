
import React, { useState, useEffect, useCallback } from 'react';
import { MapContainer, TileLayer, Polyline, Marker, Popup, useMap } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import axios from 'axios';
import { FaMapMarkedAlt, FaMountain, FaHeartbeat, FaChartLine } from 'react-icons/fa';
import { useLanguage } from '../contexts/LanguageContext';
import toast from 'react-hot-toast';
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});
const RunMap = ({ runId, onClose }) => {
  const { t } = useLanguage();
  const [run, setRun] = useState(null);
  const [loading, setLoading] = useState(true);
  const [elevationData, setElevationData] = useState([]);
  const [showElevation, setShowElevation] = useState(false);
  useEffect(() => {
    fetchRunData();
  }, [runId]);
  const fetchRunData = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get(`http://localhost:5000/api/runs/${runId}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setRun(response.data);
      if (response.data.route_data) {
        parseElevationData(response.data.route_data);
      }
    } catch (error) {
      toast.error('Erro ao carregar dados da corrida');
    } finally {
      setLoading(false);
    }
  };
  const parseElevationData = (routeData) => {
    if (routeData.elevations) {
      setElevationData(routeData.elevations);
    }
  };
  const getBounds = () => {
    if (run?.route_data?.coordinates) {
      const coords = run.route_data.coordinates;
      const lats = coords.map(c => c[0]);
      const lngs = coords.map(c => c[1]);
      return [[Math.min(...lats), Math.min(...lngs)], [Math.max(...lats), Math.max(...lngs)]];
    }
    return null;
  };
  const FitBounds = () => {
    const map = useMap();
    const bounds = getBounds();
    useEffect(() => {
      if (bounds) {
        map.fitBounds(bounds);
      }
    }, [map]);
    return null;
  };
  if (loading) {
    return (
      <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50">
        <div className="bg-white rounded-2xl p-8">
          <div className="spinner mx-auto mb-4"></div>
          <p className="text-gray-600">Carregando mapa...</p>
        </div>
      </div>
    );
  }
  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl w-full max-w-6xl max-h-[90vh] overflow-hidden flex flex-col">
        {}
        <div className="p-6 border-b flex justify-between items-center bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-t-2xl">
          <div>
            <h2 className="text-2xl font-bold">{run?.title || 'Percurso da Corrida'}</h2>
            <p className="text-blue-100 text-sm">
              {new Date(run?.start_time).toLocaleDateString('pt-BR')} • 
              {run?.distance} km • Ritmo {run?.pace}/km
            </p>
          </div>
          <button onClick={onClose} className="text-white/80 hover:text-white text-2xl">
            ✕
          </button>
        </div>
        {}
        <div className="flex-1 overflow-y-auto p-6">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {}
            <div className="lg:col-span-2 h-96 lg:h-[500px] rounded-xl overflow-hidden">
              {run?.route_data?.coordinates ? (
                <MapContainer
                  style={{ height: '100%', width: '100%' }}
                  center={run.route_data.coordinates[0]}
                  zoom={13}
                >
                  <TileLayer
                    url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                    attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OSM</a>'
                  />
                  <Polyline
                    positions={run.route_data.coordinates}
                    color="#3B82F6"
                    weight={4}
                    opacity={0.8}
                  />
                  <Marker position={run.route_data.coordinates[0]}>
                    <Popup>Início</Popup>
                  </Marker>
                  <Marker position={run.route_data.coordinates[run.route_data.coordinates.length - 1]}>
                    <Popup>Chegada</Popup>
                  </Marker>
                  <FitBounds />
                </MapContainer>
              ) : (
                <div className="h-full flex items-center justify-center bg-gray-100 rounded-xl">
                  <div className="text-center">
                    <FaMapMarkedAlt className="text-6xl text-gray-400 mx-auto mb-4" />
                    <p className="text-gray-500">Dados de rota não disponíveis</p>
                  </div>
                </div>
              )}
            </div>
            {}
            <div className="space-y-4">
              <div className="card">
                <h3 className="font-bold text-gray-800 mb-3 flex items-center gap-2">
                  <FaChartLine className="text-blue-600" />
                  Estatísticas da Rota
                </h3>
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Distância:</span>
                    <span className="font-semibold">{run?.distance} km</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Duração:</span>
                    <span className="font-semibold">{Math.floor(run?.duration / 60)} min</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Ritmo médio:</span>
                    <span className="font-semibold">{run?.pace}/km</span>
                  </div>
                  {run?.elevation_gain > 0 && (
                    <>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Ganho elevacional:</span>
                        <span className="font-semibold text-orange-600">{run?.elevation_gain} m</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Perda elevacional:</span>
                        <span className="font-semibold text-green-600">{run?.elevation_loss || 0} m</span>
                      </div>
                    </>
                  )}
                  {run?.avg_heart_rate && (
                    <div className="flex justify-between">
                      <span className="text-gray-600">Frequência cardíaca:</span>
                      <span className="font-semibold text-red-600">{run?.avg_heart_rate} bpm</span>
                    </div>
                  )}
                </div>
              </div>
              {}
              {run?.splits_data && run.splits_data.length > 0 && (
                <div className="card">
                  <h3 className="font-bold text-gray-800 mb-3">Splits por KM</h3>
                  <div className="max-h-48 overflow-y-auto space-y-1">
                    {run.splits_data.map((split, idx) => (
                      <div key={idx} className="flex justify-between text-sm p-2 hover:bg-gray-50 rounded">
                        <span className="text-gray-600">KM {idx + 1}</span>
                        <span className="font-mono">{split.time}</span>
                        <span className="text-xs text-gray-500">{split.pace}/km</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
export default RunMap;