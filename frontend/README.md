# 🏃 RunTrack - Sistema Completo de Corridas de Rua

## 📋 Sobre o Projeto

RunTrack é uma aplicação web completa para corredores que permite registrar corridas, participar de competições, criar grupos, acompanhar estatísticas de desempenho, receber recomendações personalizadas por IA, prevenir lesões e muito mais.

## ✅ Funcionalidades Completas (100% Desenvolvidas)

### 🏃 Core de Corrida
- ✅ **Rastreamento GPS em tempo real** - Distância, tempo, pace e rota com alta precisão
- ✅ **Mapa interativo** - Visualização do percurso
- ✅ **Salvamento offline** - Corridas salvas localmente quando sem internet
- ✅ **Sincronização automática** - Dados sincronizados automaticamente quando online
- ✅ **Histórico completo** - Filtros por período e busca por título
- ✅ **Exportação GPX** - Formato compatível com Strava, Garmin, etc.
- ✅ **Exportação em massa** - Baixe múltiplas corridas de uma vez
- ✅ **Persistência de corrida** - Corridas pausadas são salvas e recuperadas ao recarregar

### 🏆 Social e Competição
- ✅ **Grupos de corrida** - Crie e participe de grupos públicos ou privados
- ✅ **Chat em tempo real** - WebSocket para comunicação instantânea
- ✅ **Competições** - Crie desafios com metas de distância
- ✅ **Desafios entre amigos** - Tipos: distância, corridas, ritmo, sequência
- ✅ **Ranking global** - Rankings por distância, número de corridas e melhor ritmo
- ✅ **Períodos** - Semana, mês e geral
- ✅ **Convites para grupos** - Código de 6 caracteres para grupos privados

### 📈 Análise e Performance
- ✅ **Dashboard intuitivo** - Estatísticas em tempo real
- ✅ **Gráficos semanais/mensais** - Visualização de progresso
- ✅ **Analisador de Performance** - Evolução do ritmo, previsões para provas
- ✅ **Mapa de calor** - Atividade por hora/dia/mês
- ✅ **Recordes pessoais** - Monitoramento de melhores marcas
- ✅ **Conquistas automáticas** - Badges por marcos alcançados

### 🧠 Inteligência Artificial
- ✅ **Plano de treino personalizado** - Gerado com base no seu histórico
- ✅ **Metas pessoais** - Defina objetivos de distância, corridas ou ritmo
- ✅ **Prevenção de lesões** - Análise de risco com regra dos 10%
- ✅ **Alertas automáticos** - Notificações quando risco alto é detectado
- ✅ **Recomendação de equipamentos** - Sugestões baseadas no seu perfil
- ✅ **Áudio Coach** - Feedback por voz a cada quilômetro

### 🎥 Educação e Treinamento
- ✅ **Vídeos de aquecimento** - Exercícios preparatórios
- ✅ **Vídeos de fortalecimento** - Core, pernas, mobilidade
- ✅ **Player otimizado para mobile** - Tela cheia e responsivo
- ✅ **Categorias** - Aquecimento, fortalecimento, alongamento, core, mobilidade

### 👤 Usuário e Personalização
- ✅ **Perfil completo** - Upload de avatar com editor de imagem integrado
- ✅ **Recorte e zoom** - Editor de imagem para ajustar o avatar
- ✅ **Tema escuro** - Alternância com persistência
- ✅ **Internacionalização** - Português e Inglês
- ✅ **Notificações push** - Alertas de conquistas e desafios
- ✅ **Recuperação de senha** - Recuperação por email

### 📱 Experiência Mobile
- ✅ **PWA instalável** - Funciona como aplicativo nativo
- ✅ **Modo offline** - Use sem internet
- ✅ **Design responsivo** - Adaptado para todos os tamanhos de tela

### 🔔 Notificações
- ✅ **Notificações em tempo real** - Alertas via WebSocket
- ✅ **Notificações push** - Mesmo com o app fechado
- ✅ **Badge de não lidas** - Indicador visual de pendências

### 📤 Exportação de Dados
- ✅ **GPX individual** - Exporte qualquer corrida
- ✅ **GPX em massa** - Selecione múltiplas corridas e exporte
- ✅ **Formato compatível** - Strava, Garmin, MapMyRun, outros

## 🛠️ Tecnologias Utilizadas

### Frontend
- **React.js 18** - Biblioteca principal
- **Tailwind CSS** - Estilização e responsividade
- **Axios** - Requisições HTTP
- **React Router DOM** - Navegação
- **Socket.io Client** - Comunicação em tempo real
- **Chart.js / Recharts** - Gráficos e visualizações
- **React Leaflet** - Mapas interativos
- **React Player** - Player de vídeos
- **LocalForage** - Armazenamento offline
- **html2canvas** - Geração de imagens
- **i18next** - Internacionalização
- **PWA** - Service Worker e Manifest

### Backend
- **Node.js** - Runtime JavaScript
- **Express.js** - Framework web
- **MySQL** - Banco de dados relacional
- **JWT** - Autenticação
- **Bcryptjs** - Criptografia de senhas
- **Socket.io** - WebSockets
- **Web Push** - Notificações push
- **Multer** - Upload de arquivos

## 🗄️ Estrutura do Banco de Dados

- ✅ `users` - Usuários do sistema
- ✅ `runs` - Registros de corridas
- ✅ `competitions` - Competições criadas
- ✅ `competition_participants` - Participantes
- ✅ `groups` - Grupos de corredores
- ✅ `group_members` - Membros dos grupos
- ✅ `group_messages` - Mensagens dos grupos
- ✅ `achievements` - Conquistas disponíveis
- ✅ `user_achievements` - Conquistas desbloqueadas
- ✅ `personal_goals` - Metas pessoais
- ✅ `goal_progress` - Progresso das metas
- ✅ `ai_training_plans` - Planos de treino
- ✅ `ai_training_workouts` - Treinos dos planos
- ✅ `injury_risk_analysis` - Análises de risco
- ✅ `injury_history` - Histórico de lesões
- ✅ `injury_alerts` - Alertas de lesão
- ✅ `equipment` - Catálogo de equipamentos
- ✅ `equipment_recommendations` - Recomendações
- ✅ `push_subscriptions` - Assinaturas push
- ✅ `workout_videos` - Vídeos de treino

## 📁 Estrutura do Projeto

```
runtrack/
├── backend/
│   ├── server.js              # Servidor principal
│   ├── uploads/               # Arquivos de avatar
│   └── package.json           
├── frontend/
│   ├── public/
│   │   ├── manifest.json      # PWA manifest
│   │   └── sw.js              # Service Worker
│   ├── src/
│   │   ├── components/        # Componentes React
│   │   ├── contexts/          # Contextos (tema, idioma, socket)
│   │   ├── services/          # Serviços (offline, áudio)
│   │   ├── locales/           # Traduções (PT/EN)
│   │   ├── App.js             
│   │   ├── index.js           
│   │   └── index.css          
│   └── package.json           
└── database.sql               
```

## 🔌 WebSockets e Notificações

- ✅ **achievement** - Nova conquista desbloqueada
- ✅ **competition** - Atualizações de competição
- ✅ **group** - Novos membros ou mensagens
- ✅ **chat** - Mensagens em grupos
- ✅ **injury_alert** - Alerta de lesão
- ✅ **challenge** - Desafios entre amigos

## 📱 PWA - Progressive Web App

- ✅ Manifest.json configurado
- ✅ Service Worker para cache
- ✅ Instalação via navegador
- ✅ Funcionalidade offline
- ✅ Splash screen personalizada

## 🔒 Segurança

- ✅ JWT com expiração
- ✅ Bcrypt para hash de senhas
- ✅ Validação rigorosa de entrada
- ✅ Prevenção contra SQL injection
- ✅ CORS configurado
- ✅ Rate limiting
- ✅ Upload seguro

## 🎨 Design System

- ✅ Cores consistentes (Azul, Roxo, Verde, Vermelho, Amarelo)
- ✅ Animações (Fade, Slide, Scale, Pulse, Float)
- ✅ Design responsivo
- ✅ Tema claro/escuro

## 🚀 Status do Projeto

| Área | Status |
|------|--------|
| Frontend | ✅ 100% Concluído |
| Backend | ✅ 100% Concluído |
| Banco de Dados | ✅ 100% Concluído |
| PWA | ✅ 100% Concluído |
| Documentação | ✅ 100% Concluído |

## 📝 Scripts Disponíveis

- `npm start` - Inicia o servidor de desenvolvimento
- `npm run build` - Gera build de produção
- `npm test` - Executa testes
- `npm run dev` - Inicia backend com hot-reload

## 📄 Licença

MIT License

---