import { useState, useEffect } from 'react';
import { Shield, Trash2, Users, FolderPlus, UserX, AlertTriangle, RefreshCw, X } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { usersService, projectsService } from '../../services/firebaseService';
import './AdminPanel.css';

const AdminPanel = ({ onClose }) => {
  const { currentUser } = useAuth();
  const [users, setUsers] = useState([]);
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('users'); // users, projects, members
  const [selectedUser, setSelectedUser] = useState(null);
  const [selectedProject, setSelectedProject] = useState(null);
  const [showConfirmDelete, setShowConfirmDelete] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState(null);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    try {
      const [allUsers, allProjects] = await Promise.all([
        usersService.getAll(),
        projectsService.getAll()
      ]);
      setUsers(allUsers.sort((a, b) => a.username.localeCompare(b.username)));
      setProjects(allProjects.sort((a, b) => (b.createdAt?.seconds || 0) - (a.createdAt?.seconds || 0)));
    } catch (error) {
      console.error('Error al cargar datos:', error);
    }
    setLoading(false);
  };

  const handleDeleteUser = async (username) => {
    if (username === currentUser.username) {
      alert('❌ No puedes eliminarte a ti mismo');
      return;
    }

    setDeleteTarget({ type: 'user', username });
    setShowConfirmDelete(true);
  };

  const handleDeleteProject = async (projectId, projectName) => {
    setDeleteTarget({ type: 'project', projectId, projectName });
    setShowConfirmDelete(true);
  };

  const handleRemoveUserFromProject = async (projectId, username) => {
    try {
      await projectsService.removeMember(projectId, username);
      await loadData();
      alert(`✅ Usuario ${username} eliminado del proyecto`);
    } catch (error) {
      console.error('Error al remover usuario:', error);
      alert('❌ Error al remover usuario del proyecto');
    }
  };

  const handleAddUserToProject = async () => {
    if (!selectedUser || !selectedProject) {
      alert('⚠️ Selecciona un usuario y un proyecto');
      return;
    }

    try {
      await projectsService.addMember(selectedProject, selectedUser, 'editor');
      await loadData();
      alert(`✅ Usuario ${selectedUser} agregado al proyecto`);
      setSelectedUser(null);
      setSelectedProject(null);
    } catch (error) {
      console.error('Error al agregar usuario:', error);
      alert('❌ Error al agregar usuario al proyecto');
    }
  };

  const confirmDelete = async () => {
    if (!deleteTarget) return;

    try {
      if (deleteTarget.type === 'user') {
        // Eliminar usuario de todos los proyectos primero
        const userProjects = projects.filter(p => 
          p.members?.includes(deleteTarget.username) || p.owner === deleteTarget.username
        );
        
        for (const project of userProjects) {
          if (project.owner === deleteTarget.username) {
            // Si es owner, eliminar el proyecto completo
            await projectsService.delete(project.id);
          } else {
            // Si es miembro, solo removerlo
            await projectsService.removeMember(project.id, deleteTarget.username);
          }
        }
        
        // Eliminar el usuario
        await usersService.delete(deleteTarget.username);
        alert(`✅ Usuario ${deleteTarget.username} eliminado completamente`);
      } else if (deleteTarget.type === 'project') {
        await projectsService.delete(deleteTarget.projectId);
        alert(`✅ Proyecto "${deleteTarget.projectName}" eliminado`);
      }

      await loadData();
      setShowConfirmDelete(false);
      setDeleteTarget(null);
    } catch (error) {
      console.error('Error al eliminar:', error);
      alert('❌ Error al eliminar. Intenta de nuevo.');
    }
  };

  if (loading) {
    return (
      <div className="admin-panel">
        <div className="admin-panel-header">
          <Shield size={24} />
          <h2>Panel de Administración</h2>
        </div>
        <div className="loading-admin">
          <div className="spinner"></div>
          <p>Cargando datos...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="admin-panel">
      <div className="admin-panel-header">
        <div className="header-left">
          <Shield size={24} />
          <div>
            <h2>Panel de Administración</h2>
            <p>Gestión completa del sistema</p>
          </div>
        </div>
        <div className="header-actions">
          <button className="btn-refresh" onClick={loadData} title="Actualizar datos">
            <RefreshCw size={18} />
          </button>
          <button className="btn-close-panel" onClick={onClose} title="Cerrar panel">
            <X size={20} />
          </button>
        </div>
      </div>

      <div className="admin-tabs">
        <button 
          className={`tab-btn ${activeTab === 'users' ? 'active' : ''}`}
          onClick={() => setActiveTab('users')}
        >
          <Users size={18} />
          Usuarios ({users.length})
        </button>
        <button 
          className={`tab-btn ${activeTab === 'projects' ? 'active' : ''}`}
          onClick={() => setActiveTab('projects')}
        >
          <FolderPlus size={18} />
          Proyectos ({projects.length})
        </button>
        <button 
          className={`tab-btn ${activeTab === 'members' ? 'active' : ''}`}
          onClick={() => setActiveTab('members')}
        >
          <UserX size={18} />
          Gestión de Miembros
        </button>
      </div>

      {/* TAB: USUARIOS */}
      {activeTab === 'users' && (
        <div className="admin-content">
          <div className="admin-table users-table-extended">
            <div className="table-header">
              <div>Usuario</div>
              <div>Rol</div>
              <div>Proyectos</div>
              <div>Acciones</div>
            </div>
            {users.map(user => {
              const userProjects = projects.filter(p => 
                p.owner === user.username || p.members?.includes(user.username)
              );

              return (
                <div key={user.username} className="table-row">
                  <div className="cell-user">
                    <div className="user-avatar-small">
                      {user.username[0].toUpperCase()}
                    </div>
                    <span>{user.username}</span>
                    {user.username === currentUser.username && (
                      <span className="badge-you-small">Tú</span>
                    )}
                  </div>
                  <div>
                    <span className="role-badge-small">{user.role || 'Sin rol'}</span>
                  </div>
                  <div className="cell-projects">
                    {userProjects.length === 0 ? (
                      <span className="no-projects">Sin proyectos</span>
                    ) : (
                      <div className="projects-list">
                        {userProjects.map(project => (
                          <span key={project.id} className="project-tag">
                            <span className="project-tag-icon">{project.icon}</span>
                            <span className="project-tag-name">{project.name}</span>
                            {project.owner === user.username && (
                              <span className="project-tag-owner">👑</span>
                            )}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>
                  <div>
                    {user.username !== currentUser.username && (
                      <button 
                        className="btn-delete-small"
                        onClick={() => handleDeleteUser(user.username)}
                        title="Eliminar usuario"
                      >
                        <Trash2 size={16} />
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* TAB: PROYECTOS */}
      {activeTab === 'projects' && (
        <div className="admin-content">
          <div className="admin-table">
            <div className="table-header">
              <div>Proyecto</div>
              <div>Owner</div>
              <div>Miembros</div>
              <div>Tareas</div>
              <div>Acciones</div>
            </div>
            {projects.map(project => (
              <div key={project.id} className="table-row">
                <div className="cell-project">
                  <span className="project-icon-small">{project.icon}</span>
                  <span>{project.name}</span>
                </div>
                <div>{project.owner}</div>
                <div>{project.members?.length || 0}</div>
                <div>—</div>
                <div>
                  <button 
                    className="btn-delete-small"
                    onClick={() => handleDeleteProject(project.id, project.name)}
                    title="Eliminar proyecto"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB: GESTIÓN DE MIEMBROS */}
      {activeTab === 'members' && (
        <div className="admin-content">
          <div className="members-management">
            <div className="add-member-section">
              <h3>Agregar Usuario a Proyecto</h3>
              <div className="add-member-form">
                <select 
                  value={selectedUser || ''}
                  onChange={(e) => setSelectedUser(e.target.value)}
                  className="select-input"
                >
                  <option value="">Seleccionar Usuario</option>
                  {users.map(user => (
                    <option key={user.username} value={user.username}>
                      {user.username} ({user.role || 'sin rol'})
                    </option>
                  ))}
                </select>

                <select 
                  value={selectedProject || ''}
                  onChange={(e) => setSelectedProject(e.target.value)}
                  className="select-input"
                >
                  <option value="">Seleccionar Proyecto</option>
                  {projects.map(project => (
                    <option key={project.id} value={project.id}>
                      {project.icon} {project.name}
                    </option>
                  ))}
                </select>

                <button 
                  className="btn-add-member"
                  onClick={handleAddUserToProject}
                  disabled={!selectedUser || !selectedProject}
                >
                  <FolderPlus size={18} />
                  Agregar
                </button>
              </div>
            </div>

            <div className="members-by-project">
              <h3>Miembros por Proyecto</h3>
              {projects.map(project => (
                <div key={project.id} className="project-members-card">
                  <div className="project-members-header">
                    <span className="project-icon-small">{project.icon}</span>
                    <strong>{project.name}</strong>
                    <span className="member-count">({project.members?.length || 0} miembros)</span>
                  </div>
                  <div className="members-list">
                    {project.members?.map(username => (
                      <div key={username} className="member-item">
                        <span>{username}</span>
                        {username !== project.owner && (
                          <button 
                            className="btn-remove-member"
                            onClick={() => handleRemoveUserFromProject(project.id, username)}
                            title="Remover del proyecto"
                          >
                            <UserX size={14} />
                          </button>
                        )}
                        {username === project.owner && (
                          <span className="badge-owner">Owner</span>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* MODAL DE CONFIRMACIÓN */}
      {showConfirmDelete && deleteTarget && (
        <div className="modal-overlay" onClick={() => setShowConfirmDelete(false)}>
          <div className="confirm-modal" onClick={(e) => e.stopPropagation()}>
            <div className="confirm-header">
              <AlertTriangle size={48} color="#ef4444" />
              <h3>⚠️ Confirmar Eliminación</h3>
            </div>
            <div className="confirm-body">
              {deleteTarget.type === 'user' ? (
                <>
                  <p>¿Estás seguro de eliminar al usuario <strong>{deleteTarget.username}</strong>?</p>
                  <p className="warning-text">
                    Esto eliminará al usuario de todos los proyectos y eliminará los proyectos donde sea owner.
                  </p>
                </>
              ) : (
                <>
                  <p>¿Estás seguro de eliminar el proyecto <strong>"{deleteTarget.projectName}"</strong>?</p>
                  <p className="warning-text">
                    Esto eliminará todas las tareas, columnas y datos del proyecto. Esta acción no se puede deshacer.
                  </p>
                </>
              )}
            </div>
            <div className="confirm-actions">
              <button className="btn-cancel" onClick={() => setShowConfirmDelete(false)}>
                Cancelar
              </button>
              <button className="btn-confirm-delete" onClick={confirmDelete}>
                <Trash2 size={16} />
                Eliminar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminPanel;

