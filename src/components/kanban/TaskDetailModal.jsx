import { useState } from 'react';
import { X, Edit2, Clock, User, Calendar, MessageCircle, Tag } from 'lucide-react';
import { useKanban } from '../../context/KanbanContext';
import { useAuth } from '../../context/AuthContext';
import { useProject } from '../../context/ProjectContext';
import { TASK_TYPES, TASK_PRIORITIES } from '../../utils/roles';
import './TaskDetailModal.css';

const TaskDetailModal = ({ task: initialTask, onClose, onEdit }) => {
  const { addComment, deleteComment, tasks } = useKanban();
  const { currentUser } = useAuth();
  const { hasPermission } = useProject();
  const [commentText, setCommentText] = useState('');
  const [loading, setLoading] = useState(false);
  
  // Usar la tarea actualizada del context en tiempo real
  const task = tasks.find(t => t.id === initialTask.id) || initialTask;

  const canEdit = hasPermission('write');
  const taskType = TASK_TYPES[task.type] || TASK_TYPES.general;
  const taskPriority = TASK_PRIORITIES[task.priority] || TASK_PRIORITIES.medium;

  const handleAddComment = async (e) => {
    e.preventDefault();
    if (!commentText.trim()) return;

    setLoading(true);
    try {
      await addComment(task.id, commentText, currentUser.username);
      setCommentText('');
    } catch (error) {
      console.error('Error al agregar comentario:', error);
      alert('Error al agregar el comentario');
    }
    setLoading(false);
  };

  const handleDeleteComment = async (commentId) => {
    if (!window.confirm('¿Eliminar este comentario?')) return;

    try {
      await deleteComment(task.id, commentId);
    } catch (error) {
      console.error('Error al eliminar comentario:', error);
      alert('Error al eliminar el comentario');
    }
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat('es', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    }).format(date);
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content task-detail-modal" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <div className="header-left">
            <span className="task-type-icon" style={{ color: taskType.color }}>
              {taskType.icon}
            </span>
            <h2>{task.title}</h2>
          </div>
          <div className="header-actions">
            {canEdit && (
              <button className="btn-edit" onClick={onEdit} title="Editar tarea">
                <Edit2 size={20} />
              </button>
            )}
            <button className="btn-close" onClick={onClose}>
              <X size={24} />
            </button>
          </div>
        </div>

        <div className="task-detail-content">
          <div className="task-meta-section">
            <div className="meta-badges">
              <span className={`priority-badge priority-${task.priority}`}>
                {taskPriority.icon} {taskPriority.name}
              </span>
              <span className="type-badge" style={{ backgroundColor: taskType.color }}>
                {taskType.name}
              </span>
            </div>

            <div className="meta-info-grid">
              {task.hours > 0 && (
                <div className="meta-info-item">
                  <Clock size={16} />
                  <span>{task.hours} horas</span>
                </div>
              )}
              
              {task.assignedTo && (
                <div className="meta-info-item">
                  <User size={16} />
                  <span>Asignado a: {task.assignedTo}</span>
                </div>
              )}
              
              <div className="meta-info-item">
                <User size={16} />
                <span>Creado por: {task.createdBy}</span>
              </div>
              
              {task.createdAt && (
                <div className="meta-info-item">
                  <Calendar size={16} />
                  <span>Creado: {formatDate(task.createdAt.toDate ? task.createdAt.toDate() : task.createdAt)}</span>
                </div>
              )}
            </div>

            {task.tags && task.tags.length > 0 && (
              <div className="tags-section">
                <Tag size={16} />
                <div className="tags-list">
                  {task.tags.map((tag, index) => (
                    <span key={index} className="tag">{tag}</span>
                  ))}
                </div>
              </div>
            )}
          </div>

          {task.description && (
            <div className="description-section">
              <h3>Descripción</h3>
              <p>{task.description}</p>
            </div>
          )}

          <div className="comments-section">
            <h3>
              <MessageCircle size={18} />
              Comentarios ({task.comments?.length || 0})
            </h3>

            <form onSubmit={handleAddComment} className="comment-form">
              <textarea
                value={commentText}
                onChange={(e) => setCommentText(e.target.value)}
                placeholder="Escribe un comentario..."
                rows={3}
                disabled={loading}
              />
              <button
                type="submit"
                className="btn-add-comment"
                disabled={loading || !commentText.trim()}
              >
                {loading ? 'Enviando...' : 'Comentar'}
              </button>
            </form>

            <div className="comments-list">
              {task.comments && task.comments.length > 0 ? (
                task.comments.map((comment) => (
                  <div key={comment.id} className="comment-item">
                    <div className="comment-header">
                      <span className="comment-author">{comment.author}</span>
                      <span className="comment-date">{formatDate(comment.createdAt)}</span>
                    </div>
                    <p className="comment-text">{comment.text}</p>
                    {(canEdit || comment.author === currentUser?.username) && (
                      <button
                        className="btn-delete-comment"
                        onClick={() => handleDeleteComment(comment.id)}
                      >
                        Eliminar
                      </button>
                    )}
                  </div>
                ))
              ) : (
                <p className="no-comments">No hay comentarios aún</p>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TaskDetailModal;

