import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { GLOBAL_ROLES } from '../../utils/roles';
import './RoleSelection.css';

const RoleSelection = () => {
  const { updateUserRole, currentUser } = useAuth();
  const navigate = useNavigate();
  const [selectedRole, setSelectedRole] = useState(null);
  const [loading, setLoading] = useState(false);

  // Filtrar roles disponibles: NO permitir seleccionar ADMIN en el registro inicial
  const availableRoles = Object.values(GLOBAL_ROLES).filter(role => role.id !== 'admin');

  const handleSelectRole = async () => {
    if (!selectedRole) return;

    setLoading(true);
    try {
      await updateUserRole(selectedRole);
      // Navegar al dashboard de proyectos después de seleccionar rol
      navigate('/projects');
    } catch (error) {
      console.error('Error al seleccionar rol:', error);
      setLoading(false);
    }
  };

  return (
    <div className="role-selection-container">
      <div className="role-selection-card">
        <div className="role-selection-header">
          <h1>¡Bienvenido, {currentUser?.username}!</h1>
          <p>Selecciona tu rol en el equipo</p>
        </div>

        <div className="roles-grid">
          {availableRoles.map((role) => (
            <div
              key={role.id}
              className={`role-card ${selectedRole === role.id ? 'selected' : ''}`}
              onClick={() => setSelectedRole(role.id)}
              style={{
                '--role-color': role.color
              }}
            >
              <div className="role-icon">{role.icon}</div>
              <h3>{role.name}</h3>
              <p>{role.description}</p>
            </div>
          ))}
        </div>

        <button
          className="btn-confirm-role"
          onClick={handleSelectRole}
          disabled={!selectedRole || loading}
        >
          {loading ? 'Guardando...' : 'Confirmar Rol'}
        </button>

        <div className="role-info-note">
          <p>💡 <strong>Nota:</strong> Solo los administradores pueden promover a otros usuarios al rol de Admin</p>
        </div>
      </div>
    </div>
  );
};

export default RoleSelection;

