
import React from 'react';
import { ComposedChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, Scatter, Cell, ResponsiveContainer } from 'recharts';
const Heatmap = ({ data, title }) => {
  const getIntensityColor = (value) => {
    if (value >= 40) return '#EF4444';
    if (value >= 30) return '#F59E0B';
    if (value >= 20) return '#10B981';
    if (value >= 10) return '#3B82F6';
    return '#8B5CF6';
  };
  return (
    <div className="bg-white rounded-xl shadow-lg p-6">
      <h3 className="text-lg font-bold text-gray-800 mb-4">{title}</h3>
      <ResponsiveContainer width="100%" height={400}>
        <ComposedChart data={data}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="hour" />
          <YAxis dataKey="day" />
          <Tooltip />
          <Legend />
          <Scatter dataKey="intensity" fill="#8884d8">
            {data.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={getIntensityColor(entry.intensity)} />
            ))}
          </Scatter>
        </ComposedChart>
      </ResponsiveContainer>
    </div>
  );
};
export default Heatmap;