import { useState } from 'react';
import { X, UserPlus, Trash2 } from 'lucide-react';
import { useProject } from '../../context/ProjectContext';
import { useAuth } from '../../context/AuthContext';
import { PROJECT_ROLES } from '../../utils/roles';
import './MembersManager.css';

const MembersManager = ({ onClose }) => {
  const { currentProject, addMember, removeMember, isProjectOwner } = useProject();
  const { users } = useAuth();
  const [loading, setLoading] = useState(false);
  const [showAddForm, setShowAddForm] = useState(false);
  const [newMember, setNewMember] = useState({ username: '', role: 'editor' });

  const isOwner = isProjectOwner();
  
  // Usuarios disponibles para agregar (que no sean miembros ya)
  const availableUsers = users.filter(
    user => !currentProject?.members?.includes(user.username)
  );

  const handleAddMember = async (e) => {
    e.preventDefault();
    if (!newMember.username || !isOwner) return;

    setLoading(true);
    try {
      await addMember(currentProject.id, newMember.username, newMember.role);
      setNewMember({ username: '', role: 'editor' });
      setShowAddForm(false);
    } catch (error) {
      console.error('Error al agregar miembro:', error);
      alert(error.message || 'Error al agregar miembro');
    }
    setLoading(false);
  };

  const handleRemoveMember = async (username) => {
    if (!isOwner) return;
    
    if (window.confirm(`¿Remover a ${username} del proyecto?`)) {
      setLoading(true);
      try {
        await removeMember(currentProject.id, username);
      } catch (error) {
        console.error('Error al remover miembro:', error);
        alert(error.message || 'Error al remover miembro');
      }
      setLoading(false);
    }
  };

  if (!currentProject) return null;

  const getRoleName = (role) => {
    return PROJECT_ROLES[role]?.name || role;
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content members-modal" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2>Miembros del Proyecto</h2>
          <button className="btn-close" onClick={onClose}>
            <X size={24} />
          </button>
        </div>

        <div className="members-content">
          {isOwner && availableUsers.length > 0 && (
            <div className="add-member-section">
              {!showAddForm ? (
                <button
                  className="btn-show-add"
                  onClick={() => setShowAddForm(true)}
                  disabled={loading}
                >
                  <UserPlus size={18} />
                  Agregar Miembro
                </button>
              ) : (
                <form onSubmit={handleAddMember} className="add-member-form">
                  <select
                    value={newMember.username}
                    onChange={(e) => setNewMember({ ...newMember, username: e.target.value })}
                    disabled={loading}
                    required
                  >
                    <option value="">Seleccionar usuario...</option>
                    {availableUsers.map(user => (
                      <option key={user.username} value={user.username}>
                        {user.username} ({user.role || 'sin rol'})
                      </option>
                    ))}
                  </select>

                  <select
                    value={newMember.role}
                    onChange={(e) => setNewMember({ ...newMember, role: e.target.value })}
                    disabled={loading}
                  >
                    {Object.values(PROJECT_ROLES).map(role => (
                      <option key={role.id} value={role.id}>
                        {role.name}
                      </option>
                    ))}
                  </select>

                  <div className="form-actions">
                    <button type="submit" className="btn-add" disabled={loading}>
                      Agregar
                    </button>
                    <button
                      type="button"
                      className="btn-cancel-add"
                      onClick={() => {
                        setShowAddForm(false);
                        setNewMember({ username: '', role: 'editor' });
                      }}
                      disabled={loading}
                    >
                      Cancelar
                    </button>
                  </div>
                </form>
              )}
            </div>
          )}

          <div className="members-list">
            <h3>Miembros Actuales ({currentProject.members?.length || 0})</h3>
            
            {currentProject.members && currentProject.members.length > 0 ? (
              currentProject.members.map(username => {
                const role = currentProject.roles?.[username] || 'viewer';
                const isOwnerUser = username === currentProject.owner;
                
                return (
                  <div key={username} className="member-item">
                    <div className="member-info">
                      <span className="member-name">
                        {username}
                        {isOwnerUser && <span className="owner-badge">Dueño</span>}
                      </span>
                      <span className={`role-badge role-${role}`}>
                        {getRoleName(role)}
                      </span>
                    </div>
                    
                    {isOwner && !isOwnerUser && (
                      <button
                        className="btn-remove"
                        onClick={() => handleRemoveMember(username)}
                        disabled={loading}
                        title="Remover miembro"
                      >
                        <Trash2 size={16} />
                      </button>
                    )}
                  </div>
                );
              })
            ) : (
              <p className="no-members">No hay miembros en este proyecto</p>
            )}
          </div>

          {!isOwner && (
            <div className="info-message">
              Solo el dueño del proyecto o un administrador puede gestionar miembros
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default MembersManager;

