import React from 'react';
import { Link } from 'react-router-dom';
const Privacy = () => {
  return (
    <div className="container-custom py-8">
      <h1 className="text-3xl font-bold mb-6">Política de Privacidade</h1>
      <div className="card space-y-4">
        <p>Última atualização: {new Date().toLocaleDateString('pt-BR')}</p>
        <h2 className="text-xl font-semibold">1. Coleta de Dados</h2>
        <p>Coletamos apenas dados necessários para o funcionamento do app...</p>
        <Link to="/dashboard" className="btn-primary inline-block mt-4">Voltar</Link>
      </div>
    </div>
  );
};
export default Privacy;