import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { ProjectProvider } from './context/ProjectContext';
import Login from './components/auth/Login';
import RoleSelection from './components/auth/RoleSelection';
import ProtectedRoute from './components/auth/ProtectedRoute';
import ProjectsDashboard from './components/projects/ProjectsDashboard';
import ProjectView from './components/kanban/ProjectView';
import './App.css';

function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <ProjectProvider>
          <Routes>
            <Route path="/login" element={<Login />} />
            
            <Route 
              path="/role-select" 
              element={
                <ProtectedRoute>
                  <RoleSelection />
                </ProtectedRoute>
              } 
            />
            
            <Route 
              path="/projects" 
              element={
                <ProtectedRoute requireRole>
                  <ProjectsDashboard />
                </ProtectedRoute>
              } 
            />
            
            <Route 
              path="/projects/:projectId" 
              element={
                <ProtectedRoute requireRole>
                  <ProjectView />
                </ProtectedRoute>
              } 
            />
            
            <Route path="/" element={<Navigate to="/projects" replace />} />
            <Route path="*" element={<Navigate to="/projects" replace />} />
          </Routes>
        </ProjectProvider>
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;

