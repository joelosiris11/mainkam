import { useState, useEffect } from 'react';
import { X } from 'lucide-react';
import { useKanban } from '../../context/KanbanContext';
import { useAuth } from '../../context/AuthContext';
import { useProject } from '../../context/ProjectContext';
import { TASK_TYPES, TASK_PRIORITIES } from '../../utils/roles';
import './TaskModal.css';

const TaskModal = ({ task, initialColumn, onClose }) => {
  const { addTask, updateTask, deleteTask, columns } = useKanban();
  const { currentUser, users } = useAuth();
  const { currentProject } = useProject();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const canDelete = () => {
    if (!currentUser) return false;
    // Solo administradores globales pueden eliminar
    return currentUser.role === 'admin';
  };
  
  const [formData, setFormData] = useState({
    title: task?.title || '',
    description: task?.description || '',
    status: task?.status || initialColumn || columns[0]?.id || '',
    priority: task?.priority || 'medium',
    type: task?.type || 'general',
    hours: task?.hours || 0,
    assignedTo: task?.assignedTo || '',
    tags: task?.tags || [],
    createdBy: task?.createdBy || currentUser?.username
  });

  const [tagInput, setTagInput] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!formData.title.trim()) {
      setError('El título es requerido');
      return;
    }

    setLoading(true);
    try {
      if (task) {
        await updateTask(task.id, formData);
      } else {
        await addTask(formData);
      }
      onClose();
    } catch (err) {
      setError(err.message || 'Error al guardar la tarea');
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!task) return;
    
    if (!canDelete()) {
      alert('Solo los administradores pueden eliminar tareas');
      return;
    }
    
    if (window.confirm('¿Estás seguro de eliminar esta tarea?')) {
      setLoading(true);
      try {
        await deleteTask(task.id);
        onClose();
      } catch (err) {
        setError(err.message || 'Error al eliminar la tarea');
        setLoading(false);
      }
    }
  };

  const handleAddTag = (e) => {
    e.preventDefault();
    const tag = tagInput.trim();
    if (tag && !formData.tags.includes(tag)) {
      setFormData({ ...formData, tags: [...formData.tags, tag] });
      setTagInput('');
    }
  };

  const handleRemoveTag = (tagToRemove) => {
    setFormData({
      ...formData,
      tags: formData.tags.filter(tag => tag !== tagToRemove)
    });
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content task-modal" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2>{task ? 'Editar Tarea' : 'Nueva Tarea'}</h2>
          <button className="btn-close" onClick={onClose}>
            <X size={24} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="task-form">
          <div className="form-row">
            <div className="form-group">
              <label>Título *</label>
              <input
                type="text"
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                placeholder="Título de la tarea"
                disabled={loading}
                autoFocus
              />
            </div>
          </div>

          <div className="form-group">
            <label>Descripción</label>
            <textarea
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              placeholder="Describe la tarea..."
              rows={3}
              disabled={loading}
            />
          </div>

          <div className="form-row">
            <div className="form-group">
              <label>Columna</label>
              <select
                value={formData.status}
                onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                disabled={loading}
              >
                {columns.map(col => (
                  <option key={col.id} value={col.id}>{col.title}</option>
                ))}
              </select>
            </div>

            <div className="form-group">
              <label>Tipo</label>
              <select
                value={formData.type}
                onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                disabled={loading}
              >
                {Object.values(TASK_TYPES).map(type => (
                  <option key={type.id} value={type.id}>
                    {type.icon} {type.name}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="form-row">
            <div className="form-group">
              <label>Prioridad</label>
              <select
                value={formData.priority}
                onChange={(e) => setFormData({ ...formData, priority: e.target.value })}
                disabled={loading}
              >
                {Object.values(TASK_PRIORITIES).map(priority => (
                  <option key={priority.id} value={priority.id}>
                    {priority.icon} {priority.name}
                  </option>
                ))}
              </select>
            </div>

            <div className="form-group">
              <label>Horas Estimadas</label>
              <input
                type="number"
                min="0"
                value={formData.hours}
                onChange={(e) => setFormData({ ...formData, hours: parseInt(e.target.value) || 0 })}
                disabled={loading}
              />
            </div>
          </div>

          <div className="form-group">
            <label>Asignar a</label>
            <select
              value={formData.assignedTo}
              onChange={(e) => setFormData({ ...formData, assignedTo: e.target.value })}
              disabled={loading}
            >
              <option value="">Sin asignar</option>
              {users.map(user => (
                <option key={user.username} value={user.username}>
                  {user.username}
                </option>
              ))}
            </select>
          </div>

          <div className="form-group">
            <label>Etiquetas</label>
            <div className="tags-input-container">
              <div className="tags-list">
                {formData.tags.map((tag, index) => (
                  <span key={index} className="tag">
                    {tag}
                    <button
                      type="button"
                      onClick={() => handleRemoveTag(tag)}
                      disabled={loading}
                    >
                      ×
                    </button>
                  </span>
                ))}
              </div>
              <div className="tag-input-row">
                <input
                  type="text"
                  value={tagInput}
                  onChange={(e) => setTagInput(e.target.value)}
                  placeholder="Agregar etiqueta"
                  disabled={loading}
                  onKeyPress={(e) => {
                    if (e.key === 'Enter') {
                      handleAddTag(e);
                    }
                  }}
                />
                <button
                  type="button"
                  className="btn-add-tag"
                  onClick={handleAddTag}
                  disabled={loading}
                >
                  Agregar
                </button>
              </div>
            </div>
          </div>

          {error && (
            <div className="error-message">{error}</div>
          )}

          <div className="modal-actions">
            {task && canDelete() && (
              <button
                type="button"
                className="btn-delete"
                onClick={handleDelete}
                disabled={loading}
              >
                Eliminar
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
              <button
                type="submit"
                className="btn-submit"
                disabled={loading}
              >
                {loading ? 'Guardando...' : task ? 'Guardar' : 'Crear Tarea'}
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};

export default TaskModal;

