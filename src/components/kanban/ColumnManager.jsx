import { useState, useEffect } from 'react';
import { DragDropContext, Droppable, Draggable } from '@hello-pangea/dnd';
import { X, Plus, GripVertical, Trash2 } from 'lucide-react';
import { useKanban } from '../../context/KanbanContext';
import { useProject } from '../../context/ProjectContext';
import './ColumnManager.css';

const ColumnManager = ({ onClose }) => {
  const { columns, addColumn, updateColumn, deleteColumn } = useKanban();
  const { hasPermission } = useProject();
  const [loading, setLoading] = useState(false);
  const [showAddForm, setShowAddForm] = useState(false);
  const [localColumns, setLocalColumns] = useState([...columns]);
  const [newColumn, setNewColumn] = useState({
    id: '',
    title: '',
    color: '#6366f1'
  });

  const canEdit = hasPermission('write');

  // Actualizar localColumns cuando cambien las columns del context
  useEffect(() => {
    setLocalColumns([...columns]);
  }, [columns]);

  const PRESET_COLORS = [
    '#6366f1', '#8b5cf6', '#ec4899', '#ef4444',
    '#f59e0b', '#10b981', '#06b6d4', '#64748b'
  ];

  const handleAddColumn = async (e) => {
    e.preventDefault();
    if (!newColumn.title.trim() || !canEdit) return;

    setLoading(true);
    try {
      const columnId = newColumn.title.toLowerCase().replace(/\s+/g, '-');
      await addColumn({
        id: columnId,
        title: newColumn.title,
        color: newColumn.color,
        order: columns.length
      });
      setNewColumn({ id: '', title: '', color: '#6366f1' });
      setShowAddForm(false);
    } catch (error) {
      console.error('Error al crear columna:', error);
      alert('Error al crear la columna');
    }
    setLoading(false);
  };

  const handleDeleteColumn = async (columnId) => {
    if (!canEdit) return;
    
    if (window.confirm('¿Eliminar esta columna? Solo puedes eliminar columnas vacías.')) {
      setLoading(true);
      try {
        await deleteColumn(columnId);
      } catch (error) {
        console.error('Error al eliminar columna:', error);
        alert(error.message || 'Error al eliminar la columna');
      }
      setLoading(false);
    }
  };

  const handleUpdateColor = async (columnId, newColor) => {
    if (!canEdit) return;
    
    setLoading(true);
    try {
      await updateColumn(columnId, { color: newColor });
    } catch (error) {
      console.error('Error al actualizar columna:', error);
    }
    setLoading(false);
  };

  const handleDragEnd = async (result) => {
    if (!result.destination || !canEdit) return;

    const items = Array.from(localColumns);
    const [reorderedItem] = items.splice(result.source.index, 1);
    items.splice(result.destination.index, 0, reorderedItem);

    // Actualizar el orden localmente primero
    setLocalColumns(items);

    // Actualizar en Firebase
    setLoading(true);
    try {
      // Actualizar el order de cada columna
      for (let i = 0; i < items.length; i++) {
        await updateColumn(items[i].id, { order: i });
      }
    } catch (error) {
      console.error('Error al reordenar columnas:', error);
      // Revertir si hay error
      setLocalColumns([...columns]);
    }
    setLoading(false);
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content column-manager-modal" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2>Gestión de Columnas</h2>
          <button className="btn-close" onClick={onClose}>
            <X size={24} />
          </button>
        </div>

        <div className="column-manager-content">
          {canEdit && (
            <div className="add-column-section">
              {!showAddForm ? (
                <button
                  className="btn-show-add"
                  onClick={() => setShowAddForm(true)}
                  disabled={loading}
                >
                  <Plus size={18} />
                  Agregar Columna
                </button>
              ) : (
                <form onSubmit={handleAddColumn} className="add-column-form">
                  <input
                    type="text"
                    value={newColumn.title}
                    onChange={(e) => setNewColumn({ ...newColumn, title: e.target.value })}
                    placeholder="Nombre de la columna"
                    disabled={loading}
                    autoFocus
                    required
                  />

                  <div className="color-picker-inline">
                    {PRESET_COLORS.map(color => (
                      <button
                        key={color}
                        type="button"
                        className={`color-option ${newColumn.color === color ? 'selected' : ''}`}
                        style={{ backgroundColor: color }}
                        onClick={() => setNewColumn({ ...newColumn, color })}
                        disabled={loading}
                      />
                    ))}
                  </div>

                  <div className="form-actions">
                    <button type="submit" className="btn-add" disabled={loading}>
                      Crear
                    </button>
                    <button
                      type="button"
                      className="btn-cancel-add"
                      onClick={() => {
                        setShowAddForm(false);
                        setNewColumn({ id: '', title: '', color: '#6366f1' });
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

          <div className="columns-list">
            <h3>Columnas del Proyecto ({localColumns.length})</h3>
            <p className="drag-hint">
              {canEdit ? '🖱️ Arrastra las columnas para reordenarlas' : 'Vista de solo lectura'}
            </p>
            
            <DragDropContext onDragEnd={handleDragEnd}>
              <Droppable droppableId="columns-list" isDropDisabled={!canEdit}>
                {(provided) => (
                  <div
                    ref={provided.innerRef}
                    {...provided.droppableProps}
                    className="columns-droppable"
                  >
                    {localColumns.map((column, index) => (
                      <Draggable
                        key={column.id}
                        draggableId={column.id}
                        index={index}
                        isDragDisabled={!canEdit || loading}
                      >
                        {(provided, snapshot) => (
                          <div
                            ref={provided.innerRef}
                            {...provided.draggableProps}
                            className={`column-item ${snapshot.isDragging ? 'dragging' : ''}`}
                          >
                            <div className="column-item-left">
                              <div {...provided.dragHandleProps}>
                                <GripVertical size={20} className="grip-icon" />
                              </div>
                              <div
                                className="column-color-preview"
                                style={{ backgroundColor: column.color }}
                              />
                              <span className="column-name">{column.title}</span>
                            </div>

                            <div className="column-item-right">
                              {canEdit && (
                                <>
                                  <div className="color-picker-mini">
                                    {PRESET_COLORS.map(color => (
                                      <button
                                        key={color}
                                        className="color-mini"
                                        style={{ backgroundColor: color }}
                                        onClick={() => handleUpdateColor(column.id, color)}
                                        disabled={loading}
                                        title="Cambiar color"
                                      />
                                    ))}
                                  </div>
                                  
                                  <button
                                    className="btn-delete-column"
                                    onClick={() => handleDeleteColumn(column.id)}
                                    disabled={loading}
                                    title="Eliminar columna"
                                  >
                                    <Trash2 size={16} />
                                  </button>
                                </>
                              )}
                            </div>
                          </div>
                        )}
                      </Draggable>
                    ))}
                    {provided.placeholder}
                  </div>
                )}
              </Droppable>
            </DragDropContext>
          </div>

          {!canEdit && (
            <div className="info-message">
              Solo los editores y administradores pueden modificar columnas
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ColumnManager;

