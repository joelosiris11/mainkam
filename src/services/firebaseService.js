import {
  collection,
  doc,
  getDoc,
  getDocs,
  addDoc,
  updateDoc,
  deleteDoc,
  query,
  where,
  orderBy,
  serverTimestamp,
  setDoc,
  onSnapshot
} from 'firebase/firestore';
import { db } from '../config/firebase';

// ============ USERS SERVICE ============
export const usersService = {
  async getAll() {
    const usersRef = collection(db, 'users');
    const snapshot = await getDocs(usersRef);
    return snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));
  },

  async getByUsername(username) {
    const userRef = doc(db, 'users', username);
    const userSnap = await getDoc(userRef);
    
    if (userSnap.exists()) {
      return { id: userSnap.id, ...userSnap.data() };
    }
    return null;
  },

  async create(userData) {
    const userRef = doc(db, 'users', userData.username);
    
    // SEGURIDAD: Prevenir creación directa de usuarios admin
    // Solo permitir si no hay role o si el role no es admin
    const role = (userData.role === 'admin') ? null : (userData.role || null);
    
    const newUser = {
      id: Date.now(),
      username: userData.username.toLowerCase(),
      pin: userData.pin,
      role: role,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
      settings: {
        theme: 'light',
        notifications: true,
        language: 'es'
      }
    };
    
    // Solo agregar email y avatar si existen
    if (userData.email) {
      newUser.email = userData.email;
    }
    if (userData.avatar) {
      newUser.avatar = userData.avatar;
    }
    
    await setDoc(userRef, newUser);
    return newUser;
  },

  async update(username, updates) {
    const userRef = doc(db, 'users', username);
    
    // Filtrar valores undefined
    const cleanUpdates = {};
    Object.keys(updates).forEach(key => {
      if (updates[key] !== undefined) {
        cleanUpdates[key] = updates[key];
      }
    });
    
    await updateDoc(userRef, {
      ...cleanUpdates,
      updatedAt: serverTimestamp()
    });
  },

  async delete(username) {
    const userRef = doc(db, 'users', username);
    await deleteDoc(userRef);
  },

  onUsersSnapshot(callback) {
    const usersRef = collection(db, 'users');
    return onSnapshot(usersRef, (snapshot) => {
      const users = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      callback(users);
    });
  }
};

// ============ PROJECTS SERVICE ============
export const projectsService = {
  async create(projectData, userId) {
    const projectsRef = collection(db, 'projects');
    const newProject = {
      name: projectData.name,
      description: projectData.description || '',
      owner: userId,
      members: [userId],
      roles: { [userId]: 'admin' },
      color: projectData.color || '#6366f1',
      icon: projectData.icon || '📋',
      isArchived: false,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
      settings: {
        allowComments: true,
        allowTaskAssignment: true,
        requireApproval: false,
        defaultPriority: 'medium'
      }
    };
    
    const docRef = await addDoc(projectsRef, newProject);
    
    // Inicializar columnas por defecto
    await this.initializeDefaultColumns(docRef.id);
    
    return { id: docRef.id, ...newProject };
  },

  async initializeDefaultColumns(projectId) {
    const defaultColumns = [
      { id: 'backlog', title: 'Backlog', color: '#94a3b8', order: 0 },
      { id: 'todo', title: 'Por Hacer', color: '#6366f1', order: 1 },
      { id: 'in-progress', title: 'En Proceso', color: '#f59e0b', order: 2 },
      { id: 'review', title: 'En Revisión', color: '#8b5cf6', order: 3 },
      { id: 'completed', title: 'Completado', color: '#10b981', order: 4 }
    ];
    
    for (const column of defaultColumns) {
      const columnRef = doc(db, 'projects', projectId, 'columns', column.id);
      await setDoc(columnRef, {
        ...column,
        createdAt: serverTimestamp()
      });
    }
  },

  async getAll() {
    const projectsRef = collection(db, 'projects');
    const snapshot = await getDocs(projectsRef);
    return snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));
  },

  async getUserProjects(userId) {
    const projectsRef = collection(db, 'projects');
    
    // Proyectos donde es owner
    const ownedQuery = query(
      projectsRef,
      where('owner', '==', userId),
      where('isArchived', '==', false)
    );
    
    // Proyectos donde es miembro
    const memberQuery = query(
      projectsRef,
      where('members', 'array-contains', userId),
      where('isArchived', '==', false)
    );
    
    const [ownedSnapshot, memberSnapshot] = await Promise.all([
      getDocs(ownedQuery),
      getDocs(memberQuery)
    ]);
    
    const ownedProjects = ownedSnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));
    
    const memberProjects = memberSnapshot.docs
      .filter(doc => doc.data().owner !== userId)
      .map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
    
    return {
      owned: ownedProjects,
      shared: memberProjects,
      all: [...ownedProjects, ...memberProjects]
    };
  },

  async getById(projectId) {
    const projectRef = doc(db, 'projects', projectId);
    const projectSnap = await getDoc(projectRef);
    
    if (!projectSnap.exists()) {
      throw new Error('Proyecto no encontrado');
    }
    
    return {
      id: projectSnap.id,
      ...projectSnap.data()
    };
  },

  async update(projectId, updates) {
    const projectRef = doc(db, 'projects', projectId);
    await updateDoc(projectRef, {
      ...updates,
      updatedAt: serverTimestamp()
    });
  },

  async addMember(projectId, username, role = 'editor') {
    const projectRef = doc(db, 'projects', projectId);
    const project = await this.getById(projectId);
    
    if (project.members.includes(username)) {
      throw new Error('El usuario ya es miembro del proyecto');
    }
    
    await updateDoc(projectRef, {
      members: [...project.members, username],
      [`roles.${username}`]: role,
      updatedAt: serverTimestamp()
    });
  },

  async removeMember(projectId, username) {
    const projectRef = doc(db, 'projects', projectId);
    const project = await this.getById(projectId);
    
    if (project.owner === username) {
      throw new Error('No puedes remover al dueño del proyecto');
    }
    
    const newMembers = project.members.filter(m => m !== username);
    const newRoles = { ...project.roles };
    delete newRoles[username];
    
    await updateDoc(projectRef, {
      members: newMembers,
      roles: newRoles,
      updatedAt: serverTimestamp()
    });
  },

  async archive(projectId) {
    const projectRef = doc(db, 'projects', projectId);
    await updateDoc(projectRef, {
      isArchived: true,
      updatedAt: serverTimestamp()
    });
  },

  async delete(projectId) {
    // Eliminar todas las sub-colecciones (columns y tasks)
    const columnsRef = collection(db, 'projects', projectId, 'columns');
    const tasksRef = collection(db, 'projects', projectId, 'tasks');
    
    const [columnsSnapshot, tasksSnapshot] = await Promise.all([
      getDocs(columnsRef),
      getDocs(tasksRef)
    ]);
    
    // Eliminar todas las columnas
    for (const columnDoc of columnsSnapshot.docs) {
      await deleteDoc(columnDoc.ref);
    }
    
    // Eliminar todas las tareas
    for (const taskDoc of tasksSnapshot.docs) {
      await deleteDoc(taskDoc.ref);
    }
    
    // Finalmente eliminar el proyecto
    const projectRef = doc(db, 'projects', projectId);
    await deleteDoc(projectRef);
  },

  onProjectSnapshot(projectId, callback) {
    const projectRef = doc(db, 'projects', projectId);
    return onSnapshot(projectRef, (doc) => {
      if (doc.exists()) {
        callback({ id: doc.id, ...doc.data() });
      }
    });
  },

  onProjectsSnapshot(userId, callback) {
    const projectsRef = collection(db, 'projects');
    const q = query(
      projectsRef,
      where('members', 'array-contains', userId),
      where('isArchived', '==', false)
    );
    
    return onSnapshot(q, (snapshot) => {
      const projects = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      callback(projects);
    });
  }
};

// ============ COLUMNS SERVICE ============
export const columnsService = {
  async getAll(projectId) {
    const columnsRef = collection(db, 'projects', projectId, 'columns');
    const q = query(columnsRef, orderBy('order', 'asc'));
    const snapshot = await getDocs(q);
    
    return snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));
  },

  async create(projectId, columnData) {
    const columnsRef = collection(db, 'projects', projectId, 'columns');
    const newColumn = {
      ...columnData,
      createdAt: serverTimestamp()
    };
    
    const docRef = await addDoc(columnsRef, newColumn);
    return { id: docRef.id, ...newColumn };
  },

  async update(projectId, columnId, updates) {
    const columnRef = doc(db, 'projects', projectId, 'columns', columnId);
    await updateDoc(columnRef, updates);
  },

  async delete(projectId, columnId) {
    const columnRef = doc(db, 'projects', projectId, 'columns', columnId);
    await deleteDoc(columnRef);
  },

  onColumnsSnapshot(projectId, callback) {
    const columnsRef = collection(db, 'projects', projectId, 'columns');
    const q = query(columnsRef, orderBy('order', 'asc'));
    
    return onSnapshot(q, (snapshot) => {
      const columns = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      callback(columns);
    });
  }
};

// ============ TASKS SERVICE ============
export const tasksService = {
  async getAll(projectId) {
    const tasksRef = collection(db, 'projects', projectId, 'tasks');
    const q = query(tasksRef, orderBy('createdAt', 'desc'));
    const snapshot = await getDocs(q);
    
    return snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));
  },

  async create(projectId, taskData) {
    const tasksRef = collection(db, 'projects', projectId, 'tasks');
    
    // NO incluir campo 'id' interno - Firebase genera el ID automáticamente
    const newTask = {
      title: taskData.title,
      description: taskData.description || '',
      status: taskData.status,
      priority: taskData.priority || 'medium',
      type: taskData.type || 'general',
      hours: taskData.hours || 0,
      createdBy: taskData.createdBy,
      assignedTo: taskData.assignedTo || null,
      comments: [],
      attachments: [],
      checklist: [],
      tags: taskData.tags || [],
      dueDate: taskData.dueDate || null,
      startDate: taskData.startDate || null,
      completedDate: null,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp()
    };
    
    const docRef = await addDoc(tasksRef, newTask);
    
    // Retornar con el ID del documento de Firebase
    return { 
      id: docRef.id,  // Este es el ID real del documento
      ...newTask,
      createdAt: new Date(),
      updatedAt: new Date()
    };
  },

  async update(projectId, taskId, updates) {
    const taskRef = doc(db, 'projects', projectId, 'tasks', taskId);
    await updateDoc(taskRef, {
      ...updates,
      updatedAt: serverTimestamp()
    });
  },

  async delete(projectId, taskId) {
    const taskRef = doc(db, 'projects', projectId, 'tasks', taskId);
    await deleteDoc(taskRef);
  },

  async addComment(projectId, taskId, comment) {
    const taskRef = doc(db, 'projects', projectId, 'tasks', taskId);
    const taskSnap = await getDoc(taskRef);
    
    if (!taskSnap.exists()) {
      throw new Error('Tarea no encontrada');
    }
    
    const task = taskSnap.data();
    const newComment = {
      id: Date.now(),
      ...comment,
      createdAt: new Date().toISOString()
    };
    
    await updateDoc(taskRef, {
      comments: [...(task.comments || []), newComment],
      updatedAt: serverTimestamp()
    });
  },

  async deleteComment(projectId, taskId, commentId) {
    const taskRef = doc(db, 'projects', projectId, 'tasks', taskId);
    const taskSnap = await getDoc(taskRef);
    
    if (!taskSnap.exists()) {
      throw new Error('Tarea no encontrada');
    }
    
    const task = taskSnap.data();
    const updatedComments = task.comments.filter(c => c.id !== commentId);
    
    await updateDoc(taskRef, {
      comments: updatedComments,
      updatedAt: serverTimestamp()
    });
  },

  onTasksSnapshot(projectId, callback) {
    const tasksRef = collection(db, 'projects', projectId, 'tasks');
    const q = query(tasksRef, orderBy('createdAt', 'desc'));
    
    return onSnapshot(q, (snapshot) => {
      const tasks = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      callback(tasks);
    });
  }
};

export default {
  users: usersService,
  projects: projectsService,
  columns: columnsService,
  tasks: tasksService
};

