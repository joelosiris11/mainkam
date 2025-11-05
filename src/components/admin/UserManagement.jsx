import { useState, useEffect } from 'react';
import { X, Shield, Users as UsersIcon } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { usersService } from '../../services/firebaseService';
import { GLOBAL_ROLES } from '../../utils/roles';
import './UserManagement.css';

const UserManagement = ({ onClose }) => {
  const { currentUser } = useAuth();
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(null);

  useEffect(() => {
    loadUsers();
  }, []);

  const loadUsers = async () => {
    setLoading(true);
    try {
      const allUsers = await usersService.getAll();
      setUsers(allUsers.sort((a, b) => a.username.localeCompare(b.username)));
    } catch (error) {
      console.error('Error al cargar usuarios:', error);
    }
    setLoading(false);
  };

  const handleChangeRole = async (username, newRole) => {
    if (username === currentUser.username) {
      alert('No puedes cambiar tu propio rol');
      return;
    }

    if (!confirm(`¿Cambiar el rol de ${username} a ${GLOBAL_ROLES[newRole].name}?`)) {
      return;
    }

    setUpdating(username);
    try {
      await usersService.update(username, { role: newRole });
      await loadUsers();
    } catch (error) {
      console.error('Error al cambiar rol:', error);
      alert('Error al cambiar el rol');
    }
    setUpdating(null);
  };

  const isCurrentUserAdmin = currentUser?.role === 'admin';

  if (!isCurrentUserAdmin) {
    return (
      <div className="modal-overlay" onClick={onClose}>
        <div className="modal-content user-management-modal" onClick={(e) => e.stopPropagation()}>
          <div className="modal-header">
            <h2>⛔ Acceso Denegado</h2>
            <button className="btn-close" onClick={onClose}>
              <X size={20} />
            </button>
          </div>
          <p className="access-denied">Solo los administradores pueden acceder a la gestión de usuarios.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content user-management-modal" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2><UsersIcon size={24} /> Gestión de Usuarios</h2>
          <button className="btn-close" onClick={onClose} disabled={loading}>
            <X size={20} />
          </button>
        </div>

        {loading ? (
          <div className="loading-users">
            <div className="spinner"></div>
            <p>Cargando usuarios...</p>
          </div>
        ) : (
          <div className="users-list">
            <div className="users-header">
              <p>Total de usuarios: <strong>{users.length}</strong></p>
              <p className="admin-note">
                <Shield size={16} /> Como administrador, puedes promover usuarios a cualquier rol
              </p>
            </div>

            <div className="users-table">
              <div className="table-header">
                <div className="col-user">Usuario</div>
                <div className="col-role">Rol Actual</div>
                <div className="col-actions">Acciones</div>
              </div>

              {users.map(user => (
                <div key={user.username} className="user-row">
                  <div className="col-user">
                    <div className="user-avatar">
                      {user.username[0].toUpperCase()}
                    </div>
                    <div className="user-info">
                      <span className="username">{user.username}</span>
                      {user.username === currentUser.username && (
                        <span className="badge-you">Tú</span>
                      )}
                    </div>
                  </div>

                  <div className="col-role">
                    <span 
                      className="role-badge" 
                      style={{ 
                        backgroundColor: user.role ? GLOBAL_ROLES[user.role]?.color + '20' : '#e2e8f0',
                        color: user.role ? GLOBAL_ROLES[user.role]?.color : '#64748b'
                      }}
                    >
                      {user.role ? GLOBAL_ROLES[user.role]?.name : 'Sin rol'}
                    </span>
                  </div>

                  <div className="col-actions">
                    {user.username !== currentUser.username && (
                      <select
                        value={user.role || ''}
                        onChange={(e) => handleChangeRole(user.username, e.target.value)}
                        disabled={updating === user.username}
                        className="role-select"
                      >
                        <option value="">Sin rol</option>
                        {Object.values(GLOBAL_ROLES).map(role => (
                          <option key={role.id} value={role.id}>
                            {role.name}
                          </option>
                        ))}
                      </select>
                    )}
                    {user.username === currentUser.username && (
                      <span className="text-muted">—</span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default UserManagement;

