import { useState } from 'react';
import { X, Trash2 } from 'lucide-react';
import { useProject } from '../../context/ProjectContext';
import { useNavigate } from 'react-router-dom';
import './ProjectSettings.css';

const PROJECT_COLORS = [
  '#6366f1', '#8b5cf6', '#ec4899', '#ef4444', 
  '#f59e0b', '#10b981', '#06b6d4', '#64748b'
];

const PROJECT_ICONS = [
  '📋', '💼', '🚀', '⚡', '🎯', '💡', '🔥', '⭐',
  '🎨', '💻', '📊', '🔧', '📱', '🌟', '🎉', '✨'
];

const ProjectSettings = ({ onClose }) => {
  const { currentProject, updateProject, archiveProject, isProjectOwner } = useProject();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: currentProject?.name || '',
    description: currentProject?.description || '',
    color: currentProject?.color || PROJECT_COLORS[0],
    icon: currentProject?.icon || PROJECT_ICONS[0]
  });

  const isOwner = isProjectOwner();

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!isOwner) return;

    setLoading(true);
    try {
      await updateProject(currentProject.id, formData);
      onClose();
    } catch (error) {
      console.error('Error al actualizar proyecto:', error);
      alert('Error al actualizar el proyecto');
    }
    setLoading(false);
  };

  const handleArchive = async () => {
    if (!isOwner) return;
    
    if (window.confirm('¿Archivar este proyecto? Podrás restaurarlo después.')) {
      setLoading(true);
      try {
        await archiveProject(currentProject.id);
        navigate('/projects');
      } catch (error) {
        console.error('Error al archivar proyecto:', error);
        alert('Error al archivar el proyecto');
      }
      setLoading(false);
    }
  };

  if (!currentProject) return null;

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content project-settings-modal" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2>Configuración del Proyecto</h2>
          <button className="btn-close" onClick={onClose}>
            <X size={24} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="settings-form">
          <div className="form-group">
            <label>Nombre del Proyecto</label>
            <input
              type="text"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              disabled={!isOwner || loading}
              required
            />
          </div>

          <div className="form-group">
            <label>Descripción</label>
            <textarea
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              rows={3}
              disabled={!isOwner || loading}
            />
          </div>

          <div className="form-group">
            <label>Icono</label>
            <div className="icon-picker">
              {PROJECT_ICONS.map((icon) => (
                <button
                  key={icon}
                  type="button"
                  className={`icon-option ${formData.icon === icon ? 'selected' : ''}`}
                  onClick={() => isOwner && setFormData({ ...formData, icon })}
                  disabled={!isOwner || loading}
                >
                  {icon}
                </button>
              ))}
            </div>
          </div>

          <div className="form-group">
            <label>Color</label>
            <div className="color-picker">
              {PROJECT_COLORS.map((color) => (
                <button
                  key={color}
                  type="button"
                  className={`color-option ${formData.color === color ? 'selected' : ''}`}
                  style={{ backgroundColor: color }}
                  onClick={() => isOwner && setFormData({ ...formData, color })}
                  disabled={!isOwner || loading}
                />
              ))}
            </div>
          </div>

          <div className="project-info">
            <p><strong>Dueño:</strong> {currentProject.owner}</p>
            <p><strong>Miembros:</strong> {currentProject.members?.length || 0}</p>
            <p><strong>Creado:</strong> {new Date(currentProject.createdAt?.toDate?.() || currentProject.createdAt).toLocaleDateString()}</p>
          </div>

          {!isOwner && (
            <div className="warning-message">
              Solo el dueño del proyecto o un administrador puede modificar la configuración
            </div>
          )}

          <div className="modal-actions">
            {isOwner && (
              <button
                type="button"
                className="btn-archive"
                onClick={handleArchive}
                disabled={loading}
              >
                <Trash2 size={16} />
                Archivar Proyecto
              </button>
            )}
            <div className="actions-right">
              <button
                type="button"
                className="btn-cancel"
                onClick={onClose}
                disabled={loading}
              >
                Cancelar
              </button>
              {isOwner && (
                <button
                  type="submit"
                  className="btn-submit"
                  disabled={loading}
                >
                  {loading ? 'Guardando...' : 'Guardar Cambios'}
                </button>
              )}
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ProjectSettings;

