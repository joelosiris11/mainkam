import { useState, useEffect } from 'react';
import { useProject } from '../../context/ProjectContext';
import { useNavigate } from 'react-router-dom';
import { Plus, Search, Grid, List, LogOut, Shield } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { projectsService } from '../../services/firebaseService';
import ProjectCard from './ProjectCard';
import CreateProjectModal from './CreateProjectModal';
import AdminPanel from '../admin/AdminPanel';
import './ProjectsDashboard.css';

const ProjectsDashboard = () => {
  const { projects, loading, createProject } = useProject();
  const { currentUser, logout } = useAuth();
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showAdminPanel, setShowAdminPanel] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeTab, setActiveTab] = useState('all');
  const [viewMode, setViewMode] = useState('grid');
  const [allSystemProjects, setAllSystemProjects] = useState([]);
  const [loadingAll, setLoadingAll] = useState(false);
  const navigate = useNavigate();

  const isAdmin = currentUser?.role === 'admin';

  // Si es admin, cargar TODOS los proyectos del sistema
  useEffect(() => {
    if (isAdmin) {
      loadAllProjects();
    }
  }, [isAdmin]);

  const loadAllProjects = async () => {
    setLoadingAll(true);
    try {
      const allProjects = await projectsService.getAll();
      setAllSystemProjects(allProjects.filter(p => !p.isArchived));
    } catch (error) {
      console.error('Error al cargar todos los proyectos:', error);
    }
    setLoadingAll(false);
  };

  const handleCreateProject = async (projectData) => {
    try {
      const newProject = await createProject(projectData);
      setShowCreateModal(false);
      navigate(`/projects/${newProject.id}`);
    } catch (error) {
      console.error('Error al crear proyecto:', error);
      alert('Error al crear el proyecto');
    }
  };

  const handleSelectProject = (projectId) => {
    navigate(`/projects/${projectId}`);
  };

  const filteredProjects = () => {
    let list;
    
    // Si es admin, usar TODOS los proyectos del sistema
    if (isAdmin && activeTab === 'all') {
      list = allSystemProjects;
    } else {
      // Si no es admin o está en otras tabs, usar sus proyectos
      list = activeTab === 'owned' 
        ? projects.owned 
        : activeTab === 'shared' 
        ? projects.shared 
        : projects.all;
    }

    if (searchQuery) {
      list = list.filter(p => 
        p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        p.description?.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    return list;
  };

  return (
    <div className="projects-dashboard">
      <header className="dashboard-header">
        <div className="header-left">
          <div className="logo">📋</div>
          <div>
            <h1>Mis Proyectos</h1>
            <p>Gestiona todos tus proyectos Kanban</p>
          </div>
        </div>

        <div className="header-right">
          {isAdmin && (
            <button 
              className="btn-admin-panel"
              onClick={() => setShowAdminPanel(true)}
              title="Panel de Administración"
            >
              <Shield size={20} />
              Admin
            </button>
          )}
          <div className="user-info">
            <span className="user-name">{currentUser?.username}</span>
            <button className="btn-logout" onClick={logout} title="Cerrar sesión">
              <LogOut size={18} />
            </button>
          </div>
        </div>
      </header>

      <div className="dashboard-controls">
        <div className="search-box">
          <Search size={20} />
          <input
            type="text"
            placeholder="Buscar proyectos..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>

        <div className="controls-right">
          <div className="view-controls">
            <button
              className={viewMode === 'grid' ? 'active' : ''}
              onClick={() => setViewMode('grid')}
              title="Vista de cuadrícula"
            >
              <Grid size={20} />
            </button>
            <button
              className={viewMode === 'list' ? 'active' : ''}
              onClick={() => setViewMode('list')}
              title="Vista de lista"
            >
              <List size={20} />
            </button>
          </div>

          <button 
            className="btn-create-project"
            onClick={() => setShowCreateModal(true)}
          >
            <Plus size={20} />
            Crear Proyecto
          </button>
        </div>
      </div>

      <div className="dashboard-tabs">
        <button
          className={activeTab === 'all' ? 'active' : ''}
          onClick={() => setActiveTab('all')}
        >
          {isAdmin ? `Todos (${allSystemProjects.length})` : `Todos (${projects.all.length})`}
        </button>
        <button
          className={activeTab === 'owned' ? 'active' : ''}
          onClick={() => setActiveTab('owned')}
        >
          Mis Proyectos ({projects.owned.length})
        </button>
        <button
          className={activeTab === 'shared' ? 'active' : ''}
          onClick={() => setActiveTab('shared')}
        >
          Compartidos ({projects.shared.length})
        </button>
      </div>

      <div className={`projects-grid ${viewMode}`}>
        {(loading || (isAdmin && loadingAll)) ? (
          <div className="loading-state">
            <div className="spinner"></div>
            <p>Cargando proyectos...</p>
          </div>
        ) : filteredProjects().length === 0 ? (
          <div className="empty-state">
            <div className="empty-icon">📁</div>
            <h3>No se encontraron proyectos</h3>
            <p>
              {searchQuery 
                ? 'Intenta con otro término de búsqueda'
                : 'Comienza creando tu primer proyecto'}
            </p>
            {!searchQuery && (
              <button 
                className="btn-create-first"
                onClick={() => setShowCreateModal(true)}
              >
                <Plus size={20} />
                Crear Primer Proyecto
              </button>
            )}
          </div>
        ) : (
          filteredProjects().map(project => (
            <ProjectCard
              key={project.id}
              project={project}
              onClick={() => handleSelectProject(project.id)}
            />
          ))
        )}
      </div>

      {showCreateModal && (
        <CreateProjectModal
          onClose={() => setShowCreateModal(false)}
          onCreate={handleCreateProject}
        />
      )}

      {showAdminPanel && (
        <div className="modal-overlay" onClick={() => setShowAdminPanel(false)}>
          <div className="admin-panel-wrapper" onClick={(e) => e.stopPropagation()}>
            <AdminPanel onClose={() => setShowAdminPanel(false)} />
          </div>
        </div>
      )}
    </div>
  );
};

export default ProjectsDashboard;

