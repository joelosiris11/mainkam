import { useMemo, useState, useEffect } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { Calendar, Save } from 'lucide-react';
import { useKanban } from '../../context/KanbanContext';
import { useProject } from '../../context/ProjectContext';
import './BurndownChart.css';

const BurndownChart = ({ compact = false }) => {
  const { tasks } = useKanban();
  const { currentProject, updateProject } = useProject();
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [saving, setSaving] = useState(false);

  // Cargar fechas del proyecto cuando cambie currentProject
  useEffect(() => {
    if (currentProject) {
      // Usar fechas guardadas o defaults
      const savedStartDate = currentProject.burndownStartDate?.toDate 
        ? currentProject.burndownStartDate.toDate() 
        : currentProject.createdAt?.toDate 
        ? currentProject.createdAt.toDate() 
        : new Date();
      
      const savedEndDate = currentProject.burndownEndDate?.toDate 
        ? currentProject.burndownEndDate.toDate() 
        : null;
      
      setStartDate(savedStartDate.toISOString().split('T')[0]);
      setEndDate(savedEndDate ? savedEndDate.toISOString().split('T')[0] : '');
    }
  }, [currentProject?.id, currentProject?.burndownStartDate, currentProject?.burndownEndDate]);

  const handleSaveDates = async () => {
    if (!startDate || !currentProject) return;
    
    setSaving(true);
    try {
      // Usar updateProject del contexto para que se actualice en tiempo real
      await updateProject(currentProject.id, {
        burndownStartDate: new Date(startDate + 'T00:00:00'),
        burndownEndDate: endDate ? new Date(endDate + 'T23:59:59') : null
      });
      setShowDatePicker(false);
    } catch (error) {
      console.error('Error al guardar fechas:', error);
      alert('Error al guardar fechas. Intenta de nuevo.');
    }
    setSaving(false);
  };

  const chartData = useMemo(() => {
    if (!tasks || tasks.length === 0 || !startDate) return [];

    // Excluir tareas del backlog
    const activeTasks = tasks.filter(t => t.status !== 'backlog');
    const totalHours = activeTasks.reduce((sum, t) => sum + (t.hours || 0), 0);
    
    const projectStartDate = new Date(startDate + 'T00:00:00');
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    // Definir fecha final del sprint
    const sprintEndDate = endDate ? new Date(endDate + 'T23:59:59') : new Date(today.getTime() + (14 * 24 * 60 * 60 * 1000)); // Default 14 días si no hay fecha fin
    
    // Generar TODOS los días del sprint (inicio hasta fin)
    const dateRange = [];
    for (let d = new Date(projectStartDate); d <= sprintEndDate; d.setDate(d.getDate() + 1)) {
      dateRange.push(new Date(d).toISOString().split('T')[0]);
    }

    if (dateRange.length === 0) return [];

    // Calcular días totales del sprint
    const totalSprintDays = dateRange.length;

    const data = dateRange.map((dateStr, index) => {
      const currentDate = new Date(dateStr + 'T00:00:00');
      const isFutureDate = currentDate > today;
      
      // Para fechas futuras, solo mostramos la línea ideal
      const hoursCompleted = isFutureDate ? null : activeTasks
        .filter(t => {
          if (t.status !== 'completed') return false;
          const completedDate = t.completedDate?.toDate 
            ? t.completedDate.toDate() 
            : t.updatedAt?.toDate 
            ? t.updatedAt.toDate() 
            : null;
          return completedDate && completedDate <= currentDate;
        })
        .reduce((sum, t) => sum + (t.hours || 0), 0);

      const hoursPending = isFutureDate ? null : totalHours - hoursCompleted;
      
      // Línea ideal: va desde totalHours hasta 0
      const hoursPerDay = totalHours / totalSprintDays;
      const idealHours = Math.max(0, totalHours - (hoursPerDay * (index + 1)));

      return {
        date: currentDate.toLocaleDateString('es', { day: '2-digit', month: 'short' }),
        ideal: Math.round(idealHours * 10) / 10,
        real: hoursPending !== null ? Math.round(hoursPending * 10) / 10 : null,
        completadas: hoursCompleted !== null ? Math.round(hoursCompleted * 10) / 10 : null
      };
    });

    return data;
  }, [tasks, startDate, endDate]);

  const totalHours = useMemo(() => {
    const activeTasks = tasks.filter(t => t.status !== 'backlog');
    return activeTasks.reduce((sum, t) => sum + (t.hours || 0), 0);
  }, [tasks]);
  
  const completedHours = useMemo(() => {
    const activeTasks = tasks.filter(t => t.status !== 'backlog');
    return activeTasks.filter(t => t.status === 'completed').reduce((sum, t) => sum + (t.hours || 0), 0);
  }, [tasks]);

  if (!chartData || chartData.length === 0) {
    return (
      <div className={`burndown-empty ${compact ? 'compact' : ''}`}>
        <p>No hay datos</p>
        {!compact && <p className="burndown-hint">Crea tareas con horas estimadas</p>}
      </div>
    );
  }

  return (
    <div className={`burndown-chart-container ${compact ? 'compact' : ''}`}>
      <div className="burndown-header">
        <div className="burndown-title-row">
          <h3>{compact ? '📊 Burndown' : '📊 Burndown Chart - Horas del Proyecto'}</h3>
          <button 
            className="btn-date-picker"
            onClick={() => setShowDatePicker(!showDatePicker)}
            title="Configurar fechas del sprint"
          >
            <Calendar size={16} />
          </button>
        </div>
        {!compact && <p>Progreso real vs. línea ideal de trabajo</p>}
        {startDate && (
          <div className={`burndown-dates-info ${compact ? 'compact' : ''}`}>
            <span>📅 {new Date(startDate).toLocaleDateString('es', { day: '2-digit', month: 'short', year: 'numeric' })}</span>
            {endDate && (
              <>
                <span className="date-separator">→</span>
                <span>🎯 {new Date(endDate).toLocaleDateString('es', { day: '2-digit', month: 'short', year: 'numeric' })}</span>
              </>
            )}
          </div>
        )}
      </div>

      {showDatePicker && (
        <div className="date-picker-section">
          <div className="date-input-group">
            <label>Fecha Inicio:</label>
            <input 
              type="date" 
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              disabled={saving}
            />
          </div>
          <div className="date-input-group">
            <label>Fecha Fin (opcional):</label>
            <input 
              type="date" 
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              min={startDate}
              disabled={saving}
            />
          </div>
          <button 
            className="btn-save-dates"
            onClick={handleSaveDates}
            disabled={saving || !startDate}
          >
            <Save size={14} />
            {saving ? 'Guardando...' : 'Guardar'}
          </button>
        </div>
      )}

      <ResponsiveContainer width="100%" height={compact ? 180 : 250}>
        <LineChart data={chartData}>
          <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
          <XAxis 
            dataKey="date" 
            stroke="#64748b"
            style={{ fontSize: '11px' }}
          />
          <YAxis 
            stroke="#64748b"
            style={{ fontSize: '11px' }}
            label={{ value: 'Horas', angle: -90, position: 'insideLeft' }}
          />
          <Tooltip 
            contentStyle={{
              backgroundColor: 'white',
              border: '1px solid #e2e8f0',
              borderRadius: '8px',
              padding: '12px'
            }}
            formatter={(value) => `${value}h`}
          />
          <Legend 
            wrapperStyle={{
              paddingTop: '15px',
              fontSize: '12px'
            }}
          />
          <Line 
            type="monotone" 
            dataKey="ideal" 
            stroke="#94a3b8" 
            strokeWidth={2}
            strokeDasharray="5 5"
            name="Línea Ideal"
            dot={false}
          />
          <Line 
            type="monotone" 
            dataKey="real" 
            stroke="#f59e0b" 
            strokeWidth={3}
            name="Horas Pendientes"
            dot={{ fill: '#f59e0b', r: 3 }}
          />
          <Line 
            type="monotone" 
            dataKey="completadas" 
            stroke="#10b981" 
            strokeWidth={2}
            name="Horas Completadas"
            dot={{ fill: '#10b981', r: 3 }}
          />
        </LineChart>
      </ResponsiveContainer>

      <div className="burndown-stats">
        <div className="stat-item">
          <span className="stat-label">Total Horas</span>
          <span className="stat-value">{totalHours}h</span>
        </div>
        <div className="stat-item">
          <span className="stat-label">Completadas</span>
          <span className="stat-value completed">{completedHours}h</span>
        </div>
        <div className="stat-item">
          <span className="stat-label">Pendientes</span>
          <span className="stat-value pending">{totalHours - completedHours}h</span>
        </div>
        <div className="stat-item">
          <span className="stat-label">% Progreso</span>
          <span className="stat-value">{totalHours > 0 ? Math.round((completedHours / totalHours) * 100) : 0}%</span>
        </div>
      </div>
    </div>
  );
};

export default BurndownChart;

