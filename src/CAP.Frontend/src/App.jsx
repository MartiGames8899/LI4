import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Login from './pages/Login';
import Layout from './components/Layout';
import DashboardTreinador from './pages/DashboardTreinador';
import DashboardEncarregado from './pages/DashboardEncarregado';
import DashboardSecretaria from './pages/DashboardSecretaria';

// PrivateRoute simples para forçar login
const PrivateRoute = ({ children, allowedRoles }) => {
  const token = localStorage.getItem('cap_jwt_token');
  const role = localStorage.getItem('cap_user_role');
  
  if (!token) return <Navigate to="/login" replace />;
  if (allowedRoles && !allowedRoles.includes(role)) return <Navigate to="/login" replace />; // Sem permissão
  
  return children;
};

export default function App() {
  return (
    <Router>
      <Routes>
        <Route path="/login" element={<Login />} />
        
        {/* Rotas Autenticadas com Layout partilhado */}
        <Route path="/" element={<PrivateRoute><Layout /></PrivateRoute>}>
          <Route index element={<Navigate to="/dashboard/treinador" replace />} />
          <Route 
            path="dashboard/treinador" 
            element={<PrivateRoute allowedRoles={['Treinador']}><DashboardTreinador /></PrivateRoute>} 
          />
          <Route 
            path="dashboard/encarregado" 
            element={<PrivateRoute allowedRoles={['Encarregado']}><DashboardEncarregado /></PrivateRoute>} 
          />
          <Route 
            path="dashboard/secretaria" 
            element={<PrivateRoute allowedRoles={['Secretaria']}><DashboardSecretaria /></PrivateRoute>} 
          />
        </Route>
      </Routes>
    </Router>
  );
}
