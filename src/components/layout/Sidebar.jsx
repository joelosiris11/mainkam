import { Users, Settings, Columns, LogOut, Home, Shield } from 'lucide-react';
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useProject } from '../../context/ProjectContext';
import { useAuth } from '../../context/AuthContext';
import BurndownChart from '../kanban/BurndownChart';
import UserManagement from '../admin/UserManagement';
import './Sidebar.css';

const Sidebar = ({ onOpenSettings, onOpenMembers, onOpenColumnManager }) => {
  const navigate = useNavigate();
  const { currentProject } = useProject();
  const { currentUser, logout } = useAuth();
  const [showUserManagement, setShowUserManagement] = useState(false);
  
  const isAdmin = currentUser?.role === 'admin';

  return (
    <aside className="sidebar">
      <div className="sidebar-header">
        <div className="sidebar-logo">
          <span className="logo-icon">{currentProject?.icon || '📋'}</span>
          <div className="logo-text">
            <h2>{currentProject?.name || 'MainKan'}</h2>
            <span className="project-owner">por {currentProject?.owner}</span>
          </div>
        </div>
      </div>

      <nav className="sidebar-nav">
        <button 
          className="sidebar-btn"
          onClick={() => navigate('/projects')}
          title="Volver a proyectos"
        >
          <Home size={20} />
          <span>Proyectos</span>
        </button>

        {isAdmin && (
          <button 
            className="sidebar-btn admin-btn"
            onClick={() => setShowUserManagement(true)}
            title="Gestionar usuarios (Solo Admin)"
          >
            <Shield size={20} />
            <span>Usuarios</span>
          </button>
        )}

        <button 
          className="sidebar-btn"
          onClick={onOpenMembers}
          title="Gestionar miembros"
        >
          <Users size={20} />
          <span>Miembros</span>
          <span className="badge">{currentProject?.members?.length || 0}</span>
        </button>

        <button 
          className="sidebar-btn"
          onClick={onOpenColumnManager}
          title="Gestionar columnas"
        >
          <Columns size={20} />
          <span>Columnas</span>
        </button>

        <button 
          className="sidebar-btn"
          onClick={onOpenSettings}
          title="Configuración"
        >
          <Settings size={20} />
          <span>Configuración</span>
        </button>
      </nav>

      <div className="sidebar-chart">
        <BurndownChart compact />
      </div>

      <div className="sidebar-footer">
        <div className="sidebar-user">
          <div className="user-avatar">
            {currentUser?.username?.[0]?.toUpperCase() || 'U'}
          </div>
          <div className="user-info">
            <span className="user-name">{currentUser?.username}</span>
            <span className="user-role">{currentUser?.role || 'usuario'}</span>
          </div>
        </div>
        <button 
          className="btn-logout-sidebar"
          onClick={logout}
          title="Cerrar sesión"
        >
          <LogOut size={18} />
        </button>
      </div>

      {showUserManagement && (
        <UserManagement onClose={() => setShowUserManagement(false)} />
      )}
    </aside>
  );
};

export default Sidebar;

