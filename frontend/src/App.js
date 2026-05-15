
import React, { Suspense, lazy } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, useLocation, Link } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { LanguageProvider } from './contexts/LanguageContext';
import { SocketProvider } from './contexts/SocketContext';
import { ThemeProvider } from './contexts/ThemeContext';
import ErrorBoundary from './components/ErrorBoundary';
import ProtectedRoute from './components/ProtectedRoute';
import NotificationToast from './components/NotificationToast';
import PWAInstallPrompt from './components/PWAInstallPrompt';

const Login = lazy(() => import('./components/Login'));
const Register = lazy(() => import('./components/Register'));
const Dashboard = lazy(() => import('./components/Dashboard'));
const RunTracker = lazy(() => import('./components/RunTracker'));
const Competitions = lazy(() => import('./components/Competitions'));
const Groups = lazy(() => import('./components/Groups'));
const Navigation = lazy(() => import('./components/Navigation'));
const History = lazy(() => import('./components/History'));
const Profile = lazy(() => import('./components/Profile'));
const ForgotPassword = lazy(() => import('./components/ForgotPassword'));
const ResetPassword = lazy(() => import('./components/ResetPassword'));
const Plans = lazy(() => import('./components/Plans'));
const NotFound = lazy(() => import('./pages/NotFound'));

const PageLoader = () => (
  <div className="flex flex-col justify-center items-center h-screen bg-[#F9FAFB] dark:bg-gray-900">
    <div className="relative">
      <div className="w-16 h-16 border-4 border-blue-100 border-t-blue-600 rounded-full animate-spin"></div>
      <div className="absolute inset-0 flex items-center justify-center">
        <span className="text-2xl animate-pulse">🏃</span>
      </div>
    </div>
    <p className="mt-6 text-gray-600 dark:text-gray-400 animate-pulse font-medium">
      Carregando...
    </p>
    <div className="flex space-x-1 mt-2">
      <div className="w-2 h-2 bg-blue-600 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
      <div className="w-2 h-2 bg-blue-600 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
      <div className="w-2 h-2 bg-blue-600 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
    </div>
  </div>
);

const PublicRoute = ({ children }) => {
  return (
    <div className="min-h-screen bg-[#F9FAFB] dark:bg-gray-900">
      {children}
    </div>
  );
};

const AnimatedRoutes = () => {
  const location = useLocation();
  const { isAuthenticated } = useAuth();

  return (
    <Suspense fallback={<PageLoader />}>
      <div className="animate-fadeIn">
        <Routes location={location}>
          {}
          <Route 
            path="/login" 
            element={
              isAuthenticated ? (
                <Navigate to="/dashboard" replace />
              ) : (
                <PublicRoute>
                  <Login />
                </PublicRoute>
              )
            } 
          />

          <Route 
            path="/register" 
            element={
              isAuthenticated ? (
                <Navigate to="/dashboard" replace />
              ) : (
                <PublicRoute>
                  <Register />
                </PublicRoute>
              )
            } 
          />

          <Route 
            path="/forgot-password" 
            element={
              <PublicRoute>
                <ForgotPassword />
              </PublicRoute>
            } 
          />

          <Route 
            path="/reset-password/:token" 
            element={
              <PublicRoute>
                <ResetPassword />
              </PublicRoute>
            } 
          />

          {}
          <Route 
            path="/dashboard" 
            element={
              <ProtectedRoute>
                <Dashboard />
              </ProtectedRoute>
            } 
          />

          <Route 
            path="/run" 
            element={
              <ProtectedRoute>
                <RunTracker />
              </ProtectedRoute>
            } 
          />

          <Route 
            path="/competitions" 
            element={
              <ProtectedRoute>
                <Competitions />
              </ProtectedRoute>
            } 
          />

          <Route 
            path="/groups" 
            element={
              <ProtectedRoute>
                <Groups />
              </ProtectedRoute>
            } 
          />

          <Route 
            path="/history" 
            element={
              <ProtectedRoute>
                <History />
              </ProtectedRoute>
            } 
          />

          <Route 
            path="/profile" 
            element={
              <ProtectedRoute>
                <Profile />
              </ProtectedRoute>
            } 
          />

          <Route 
            path="/plans" 
            element={
              <ProtectedRoute>
                <Plans />
              </ProtectedRoute>
            } 
          />

          {}
          <Route 
            path="/" 
            element={
              <Navigate to={isAuthenticated ? "/dashboard" : "/login"} replace />
            } 
          />

          {}
          <Route 
            path="*" 
            element={<NotFound />} 
          />
        </Routes>
      </div>
    </Suspense>
  );
};

function AppContent() {
  const { isAuthenticated, loading } = useAuth();

  if (loading) {
    return <PageLoader />;
  }

  return (
    <Router>
      <div className="min-h-screen bg-[#F9FAFB] dark:bg-gray-900 transition-colors duration-300">
        {}
        <Toaster 
          position="top-right"
          reverseOrder={false}
          gutter={8}
          toastOptions={{
            duration: 4000,
            style: {
              background: '#363636',
              color: '#fff',
              padding: '16px',
              borderRadius: '12px',
              fontSize: '14px',
              boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)',
            },
            success: {
              duration: 3000,
              iconTheme: {
                primary: '#10B981',
                secondary: '#fff',
              },
              style: {
                background: '#065F46',
                border: '1px solid #10B981',
              },
            },
            error: {
              duration: 4000,
              iconTheme: {
                primary: '#EF4444',
                secondary: '#fff',
              },
              style: {
                background: '#991B1B',
                border: '1px solid #EF4444',
              },
            },
            loading: {
              duration: Infinity,
              style: {
                background: '#1E3A8A',
                border: '1px solid #3B82F6',
              },
            },
          }}
        />

        {}
        <NotificationToast />

        {}
        <PWAInstallPrompt />

        {}
        {isAuthenticated && (
          <Suspense fallback={
            <div className="h-16 bg-white/90 dark:bg-gray-800/90 backdrop-blur-sm shadow-lg animate-pulse"></div>
          }>
            <Navigation />
          </Suspense>
        )}

        {}
        <main className={`${isAuthenticated ? 'pt-20 pb-28' : ''} min-h-screen relative z-10`}>
          <ErrorBoundary>
            <AnimatedRoutes />
          </ErrorBoundary>
        </main>

        {}
        {isAuthenticated && (
          <footer className="py-4 text-center text-xs text-gray-500 dark:text-gray-400 border-t border-gray-200 dark:border-gray-700 bg-white/50 dark:bg-gray-800/50 backdrop-blur-sm">
            <div className="container-custom">
              <p>© {new Date().getFullYear()} PartiuCorrer - Todos os direitos reservados</p>
              <div className="flex justify-center gap-4 mt-1">
                <Link to="/terms" className="hover:text-blue-600 transition-colors">Termos de Uso</Link>
                <Link to="/privacy" className="hover:text-blue-600 transition-colors">Privacidade</Link>
                <a 
                  href="mailto:contato@partiucorrer.com.br" 
                  className="hover:text-blue-600 transition-colors"
                >
                  Contato
                </a>
              </div>
            </div>
          </footer>
        )}
      </div>
    </Router>
  );
}

function App() {
  return (
    <ErrorBoundary>
      <ThemeProvider>
        <LanguageProvider>
          <AuthProvider>
            <SocketProvider>
              <AppContent />
            </SocketProvider>
          </AuthProvider>
        </LanguageProvider>
      </ThemeProvider>
    </ErrorBoundary>
  );
}

export default App;