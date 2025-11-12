import { Users, Settings, Columns, LogOut, Home, Shield, FileText, GitBranch, Edit2, Check, X } from 'lucide-react';
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useProject } from '../../context/ProjectContext';
import { useAuth } from '../../context/AuthContext';
import { sidebarLinksService } from '../../services/firebaseService';
import { storage } from '../../utils/storage';
import BurndownChart from '../kanban/BurndownChart';
import UserManagement from '../admin/UserManagement';
import './Sidebar.css';

const Sidebar = ({ onOpenSettings, onOpenMembers, onOpenColumnManager }) => {
  const navigate = useNavigate();
  const { currentProject } = useProject();
  const { currentUser, logout } = useAuth();
  const [showUserManagement, setShowUserManagement] = useState(false);
  const [links, setLinks] = useState({ archivos: '', git: '' });
  const [editingLink, setEditingLink] = useState(null);
  const [editValue, setEditValue] = useState('');
  
  const isAdmin = currentUser?.role === 'admin';

  // Cargar links desde Firebase o localStorage
  useEffect(() => {
    if (!currentProject) return;

    const loadLinks = async () => {
      try {
        // Intentar cargar desde Firebase
        const firebaseLinks = await sidebarLinksService.getLinks(currentProject.id);
        if (firebaseLinks.archivos || firebaseLinks.git) {
          setLinks(firebaseLinks);
          // Guardar en localStorage como backup
          storage.set(`sidebarLinks_${currentProject.id}`, firebaseLinks);
        } else {
          // Fallback a localStorage
          const localLinks = storage.get(`sidebarLinks_${currentProject.id}`) || { archivos: '', git: '' };
          setLinks(localLinks);
        }
      } catch (error) {
        // Fallback a localStorage si Firebase falla
        const localLinks = storage.get(`sidebarLinks_${currentProject.id}`) || { archivos: '', git: '' };
        setLinks(localLinks);
      }
    };

    loadLinks();

    // Sincronizar en tiempo real si Firebase está disponible
    try {
      const unsubscribe = sidebarLinksService.onLinksSnapshot(currentProject.id, (updatedLinks) => {
        setLinks(updatedLinks);
        storage.set(`sidebarLinks_${currentProject.id}`, updatedLinks);
      });
      return () => unsubscribe();
    } catch (error) {
      console.error('Error al suscribirse a links:', error);
    }
  }, [currentProject]);

  const handleEditClick = (linkType, currentUrl) => {
    setEditingLink(linkType);
    setEditValue(currentUrl);
  };

  const handleSaveLink = async (linkType) => {
    const newLinks = { ...links, [linkType]: editValue };
    setLinks(newLinks);
    setEditingLink(null);
    setEditValue('');

    try {
      // Guardar en Firebase
      await sidebarLinksService.updateLinks(currentProject.id, newLinks);
      // Guardar en localStorage como backup
      storage.set(`sidebarLinks_${currentProject.id}`, newLinks);
    } catch (error) {
      // Si Firebase falla, guardar solo en localStorage
      storage.set(`sidebarLinks_${currentProject.id}`, newLinks);
      console.error('Error al guardar link en Firebase, guardado en localStorage:', error);
    }
  };

  const handleCancelEdit = () => {
    setEditingLink(null);
    setEditValue('');
  };

  const handleLinkClick = (url) => {
    if (url && url.trim()) {
      window.open(url, '_blank');
    }
  };

  const handleKeyDown = (e, linkType) => {
    if (e.key === 'Enter') {
      handleSaveLink(linkType);
    } else if (e.key === 'Escape') {
      handleCancelEdit();
    }
  };

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

        {/* Botón Archivos editable */}
        <div 
          className="sidebar-btn-wrapper"
          onMouseEnter={(e) => {
            if (!editingLink) {
              e.currentTarget.querySelector('.edit-icon')?.classList.add('visible');
            }
          }}
          onMouseLeave={(e) => {
            e.currentTarget.querySelector('.edit-icon')?.classList.remove('visible');
          }}
        >
          {editingLink === 'archivos' ? (
            <div className="sidebar-btn-edit-mode">
              <input
                type="text"
                value={editValue}
                onChange={(e) => setEditValue(e.target.value)}
                onKeyDown={(e) => handleKeyDown(e, 'archivos')}
                placeholder="URL de archivos..."
                className="sidebar-link-input"
                autoFocus
              />
              <button
                className="sidebar-btn-action"
                onClick={() => handleSaveLink('archivos')}
                title="Guardar"
              >
                <Check size={16} />
              </button>
              <button
                className="sidebar-btn-action"
                onClick={handleCancelEdit}
                title="Cancelar"
              >
                <X size={16} />
              </button>
            </div>
          ) : (
            <>
              <button 
                className="sidebar-btn"
                onClick={() => handleLinkClick(links.archivos)}
                title={links.archivos || "Archivos (clic para editar)"}
              >
                <FileText size={20} />
                <span>Archivos</span>
              </button>
              <button
                className="edit-icon"
                onClick={() => handleEditClick('archivos', links.archivos)}
                title="Editar URL"
              >
                <Edit2 size={14} />
              </button>
            </>
          )}
        </div>

        {/* Botón Git editable */}
        <div 
          className="sidebar-btn-wrapper"
          onMouseEnter={(e) => {
            if (!editingLink) {
              e.currentTarget.querySelector('.edit-icon')?.classList.add('visible');
            }
          }}
          onMouseLeave={(e) => {
            e.currentTarget.querySelector('.edit-icon')?.classList.remove('visible');
          }}
        >
          {editingLink === 'git' ? (
            <div className="sidebar-btn-edit-mode">
              <input
                type="text"
                value={editValue}
                onChange={(e) => setEditValue(e.target.value)}
                onKeyDown={(e) => handleKeyDown(e, 'git')}
                placeholder="URL de Git..."
                className="sidebar-link-input"
                autoFocus
              />
              <button
                className="sidebar-btn-action"
                onClick={() => handleSaveLink('git')}
                title="Guardar"
              >
                <Check size={16} />
              </button>
              <button
                className="sidebar-btn-action"
                onClick={handleCancelEdit}
                title="Cancelar"
              >
                <X size={16} />
              </button>
            </div>
          ) : (
            <>
              <button 
                className="sidebar-btn"
                onClick={() => handleLinkClick(links.git)}
                title={links.git || "Git (clic para editar)"}
              >
                <GitBranch size={20} />
                <span>Git</span>
              </button>
              <button
                className="edit-icon"
                onClick={() => handleEditClick('git', links.git)}
                title="Editar URL"
              >
                <Edit2 size={14} />
              </button>
            </>
          )}
        </div>
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

