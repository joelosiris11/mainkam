import { createContext, useContext, useState, useEffect } from 'react';
import { usersService } from '../services/firebaseService';
import { storage, STORAGE_KEYS } from '../utils/storage';

const AuthContext = createContext(null);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth debe usarse dentro de AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [currentUser, setCurrentUser] = useState(null);
  const [users, setUsers] = useState([]);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [loading, setLoading] = useState(true);

  // Cargar usuario guardado en localStorage
  useEffect(() => {
    const savedUser = storage.get(STORAGE_KEYS.CURRENT_USER);
    if (savedUser) {
      setCurrentUser(savedUser);
      setIsAuthenticated(true);
    }
    setLoading(false);
  }, []);

  // Sincronizar usuarios en tiempo real
  useEffect(() => {
    const unsubscribe = usersService.onUsersSnapshot((updatedUsers) => {
      setUsers(updatedUsers);
    });

    return () => unsubscribe();
  }, []);

  const login = async (username, pin) => {
    try {
      // Buscar usuario en Firebase
      let user = await usersService.getByUsername(username.toLowerCase());
      
      if (!user) {
        // Crear nuevo usuario
        user = await usersService.create({
          username: username.toLowerCase(),
          pin: pin,
          role: null
        });
      } else {
        // Verificar PIN
        if (user.pin !== pin) {
          throw new Error('PIN incorrecto');
        }
      }
      
      setCurrentUser(user);
      setIsAuthenticated(true);
      storage.set(STORAGE_KEYS.CURRENT_USER, user);
      
      return { success: true, user, isNewUser: !user.role };
    } catch (error) {
      console.error('Error en login:', error);
      throw error;
    }
  };

  const logout = () => {
    setCurrentUser(null);
    setIsAuthenticated(false);
    storage.remove(STORAGE_KEYS.CURRENT_USER);
    storage.remove(STORAGE_KEYS.LAST_PROJECT_ID);
  };

  const updateUserRole = async (role) => {
    if (!currentUser) return;
    
    try {
      await usersService.update(currentUser.username, { role });
      const updatedUser = { ...currentUser, role };
      setCurrentUser(updatedUser);
      storage.set(STORAGE_KEYS.CURRENT_USER, updatedUser);
    } catch (error) {
      console.error('Error al actualizar rol:', error);
      throw error;
    }
  };

  const updateUser = async (updates) => {
    if (!currentUser) return;
    
    try {
      await usersService.update(currentUser.username, updates);
      const updatedUser = { ...currentUser, ...updates };
      setCurrentUser(updatedUser);
      storage.set(STORAGE_KEYS.CURRENT_USER, updatedUser);
    } catch (error) {
      console.error('Error al actualizar usuario:', error);
      throw error;
    }
  };

  const deleteUser = async (username) => {
    try {
      await usersService.delete(username);
      if (currentUser?.username === username) {
        logout();
      }
    } catch (error) {
      console.error('Error al eliminar usuario:', error);
      throw error;
    }
  };

  const refreshUsers = async () => {
    try {
      const allUsers = await usersService.getAll();
      setUsers(allUsers);
    } catch (error) {
      console.error('Error al actualizar usuarios:', error);
    }
  };

  const value = {
    currentUser,
    users,
    isAuthenticated,
    hasRole: currentUser?.role ? true : false,
    loading,
    login,
    logout,
    updateUserRole,
    updateUser,
    deleteUser,
    refreshUsers
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

export default AuthContext;

