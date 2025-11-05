export const GLOBAL_ROLES = {
  dev: {
    id: 'dev',
    name: 'Desarrollador',
    description: 'Desarrollador de software',
    color: '#6366f1',
    icon: '💻'
  },
  design: {
    id: 'design',
    name: 'Diseñador',
    description: 'Diseñador UI/UX',
    color: '#ec4899',
    icon: '🎨'
  },
  pm: {
    id: 'pm',
    name: 'Project Manager',
    description: 'Gestor de proyectos',
    color: '#8b5cf6',
    icon: '📊'
  },
  qa: {
    id: 'qa',
    name: 'QA Tester',
    description: 'Control de calidad',
    color: '#10b981',
    icon: '🔍'
  },
  admin: {
    id: 'admin',
    name: 'Administrador',
    description: 'Administrador del sistema',
    color: '#f59e0b',
    icon: '👑'
  }
};

export const PROJECT_ROLES = {
  admin: {
    id: 'admin',
    name: 'Administrador',
    permissions: ['read', 'write', 'delete', 'manage'],
    description: 'Control total del proyecto'
  },
  editor: {
    id: 'editor',
    name: 'Editor',
    permissions: ['read', 'write'],
    description: 'Puede crear y editar tareas'
  },
  viewer: {
    id: 'viewer',
    name: 'Visualizador',
    permissions: ['read'],
    description: 'Solo puede ver y comentar'
  }
};

export const TASK_TYPES = {
  general: { id: 'general', name: 'General', color: '#64748b', icon: '📝' },
  programacion: { id: 'programacion', name: 'Programación', color: '#6366f1', icon: '💻' },
  investigacion: { id: 'investigacion', name: 'Investigación', color: '#8b5cf6', icon: '🔬' },
  diseno: { id: 'diseno', name: 'Diseño', color: '#ec4899', icon: '🎨' },
  testing: { id: 'testing', name: 'Testing', color: '#10b981', icon: '🧪' },
  documentacion: { id: 'documentacion', name: 'Documentación', color: '#06b6d4', icon: '📚' },
  reunion: { id: 'reunion', name: 'Reunión', color: '#f59e0b', icon: '👥' },
  bug: { id: 'bug', name: 'Bug', color: '#ef4444', icon: '🐛' }
};

export const TASK_PRIORITIES = {
  low: { id: 'low', name: 'Baja', color: '#10b981', icon: '⬇️' },
  medium: { id: 'medium', name: 'Media', color: '#f59e0b', icon: '➡️' },
  high: { id: 'high', name: 'Alta', color: '#ef4444', icon: '⬆️' }
};

export const DEFAULT_COLUMNS = [
  { id: 'backlog', title: 'Backlog', color: '#94a3b8', order: 0 },
  { id: 'todo', title: 'Por Hacer', color: '#6366f1', order: 1 },
  { id: 'in-progress', title: 'En Proceso', color: '#f59e0b', order: 2 },
  { id: 'review', title: 'En Revisión', color: '#8b5cf6', order: 3 },
  { id: 'completed', title: 'Completado', color: '#10b981', order: 4 }
];

