# 🏃‍♂️ PartiuCorrer - Sistema Completo de Corridas

**PartiuCorrer** é uma aplicação Full-Stack moderna, focada em entregar uma experiência "Mobile-First" premium para corredores. O sistema vai muito além de um simples rastreador GPS, oferecendo planos de assinatura, rede social integrada, treinador virtual com Inteligência Artificial, e um ambiente totalmente gamificado.

---

## ✨ Principais Funcionalidades

### 📱 Experiência Mobile-First Premium
- **Design Clean e Minimalista:** Interface inspirada em aplicativos nativos de iOS e Android.
- **Navegação Inteligente:** Bottom Navigation Bar e Top App Bar com suporte a áreas seguras (safe-areas).
- **Modo Escuro (Dark Mode):** Suporte nativo com cores ajustadas para conforto visual.
- **Feedback Tátil:** Integração com Haptics para vibração suave em interações de botões.

### 💳 Sistema de Assinaturas Dinâmico (Tiers)
A plataforma possui um sistema inteligente de distribuição de recursos (Lógica de 25% / 50% / 100%):
- **Grátis (25%):** Acesso básico para iniciar a jornada, com limite de 30 dias de histórico, participação em até 2 grupos e 3 metas ativas.
- **Premium (50%):** Acesso a estatísticas avançadas, exportação GPX, áudio coach, sem limites de grupos/metas e sem anúncios.
- **Elite (100%):** Pacote profissional com acesso total: **AI Coach Personalizado**, Prevenção de Lesões, análise preditiva de performance e acesso irrestrito a todos os vídeos de treino.

### 🏆 Gamificação e Social
- **Conquistas:** Sistema automático de destravamento de medalhas com base em distância e número de corridas.
- **Ranking / Leaderboard:** Compita em tempo real com outros corredores.
- **Grupos & Chat:** Crie equipes, participe de grupos fechados com códigos de convite e converse em tempo real (via WebSockets).
- **Desafios:** Provoque um amigo para um desafio 1x1.

---

## 🛠️ Tecnologias Utilizadas

### Frontend
- **React.js** com Hooks e Context API
- **React Router Dom** para rotas e proteção dinâmica
- **Tailwind CSS** (Design System Customizado, Sem frameworks de componentes pesados)
- **Chart.js** para gráficos detalhados de ritmo e progresso
- **Leaflet** para Mapas interativos da rota
- **PWA Ready** (Service Workers, Manifest, Suporte a instalação offline)

### Backend
- **Node.js** com **Express.js**
- **MySQL 8.0** com biblioteca `mysql2/promise`
- **Socket.io** para comunicação bidirecional em tempo real (Chat e Notificações)
- **Web-Push** para notificações nativas push
- **Jest & Supertest** para Testes Unitários de API
- **Mercado Pago API** para pagamentos

---

## 🔒 Segurança de Nível Corporativo

O backend foi construído visando robustez e tolerância zero a falhas:
- **Helmet:** Blindagem total de cabeçalhos HTTP, mitigação de XSS e Clickjacking.
- **Express Rate Limit:** Bloqueio anti-DDoS e scraping. Rotas normais possuem limite flexível, enquanto `/api/auth` restringe para 20 tentativas a cada 15min (proteção contra Brute-Force e Credential Stuffing).
- **CORS Estrito:** API aceita requisições apenas da URL de frontend configurada.
- **Payload Limit:** Limite de 1MB por requisição JSON contra Memory Overload.
- **Prevenção contra SQL Injection:** Uso 100% de Prepared Statements via `pool.execute`.
- **JWT & Bcrypt:** Tokens assinados expiráveis e senhas criptografadas com alto custo computacional.

---

## 🚀 Como Executar o Projeto

### Pré-requisitos
- Node.js (v18+)
- MySQL (v8+)

### 1. Banco de Dados
No seu servidor MySQL (ou XAMPP):
1. Crie o banco de dados e importe o arquivo.
2. Você pode simplesmente copiar e rodar todo o conteúdo do arquivo `backend/database.sql` na sua IDE SQL. Isso criará o banco `partiucorrer`, tabelas e os dados mockados de exemplo.

### 2. Configurando o Backend
```bash
cd backend
npm install
```
Edite o arquivo `backend/.env` com as suas credenciais do banco:
```env
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=sua_senha
DB_NAME=partiucorrer
```
Para iniciar o servidor local de desenvolvimento (porta 5000):
```bash
npm run dev
```

### 3. Configurando o Frontend
Abra um novo terminal:
```bash
cd frontend
npm install
npm start
```
A aplicação abrirá em `http://localhost:3000`.

---

## 🧪 Testes Unitários

O backend possui cobertura de testes para a API. Para executar a suíte de testes:

```bash
cd backend
npm test
```
*(O Jest isolará a conexão com o banco e validará rotas públicas, limites de segurança de endpoints fechados, validadores HTTP, etc.)*

---
© Todos os direitos reservados - Equipe PartiuCorrer.