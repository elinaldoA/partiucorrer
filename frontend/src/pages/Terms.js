import React from 'react';
import { Link } from 'react-router-dom';
const Terms = () => {
  return (
    <div className="container-custom py-8">
      <h1 className="text-3xl font-bold mb-6">Termos de Uso</h1>
      <div className="card space-y-4">
        <p>Última atualização: {new Date().toLocaleDateString('pt-BR')}</p>
        <h2 className="text-xl font-semibold">1. Aceitação dos Termos</h2>
        <p>Ao usar o RunTracker, você concorda com estes termos...</p>
        <Link to="/dashboard" className="btn-primary inline-block mt-4">Voltar</Link>
      </div>
    </div>
  );
};
export default Terms;