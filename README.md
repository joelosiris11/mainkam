# MainKan v3.0

Sistema de gestión de proyectos Kanban multi-workspace desarrollado con React y Firebase.

## 🚀 Características

### ✨ Gestión Multi-Proyecto
- Crear y gestionar múltiples proyectos independientes
- Dashboard centralizado de proyectos
- Proyectos propios y compartidos
- Archivado de proyectos

### 👥 Colaboración
- Sistema de miembros por proyecto
- Roles diferenciados (Admin, Editor, Visualizador)
- Invitaciones a proyectos
- Control de permisos granular

### 📋 Tablero Kanban
- Columnas personalizables por proyecto
- Drag & Drop de tareas
- 8 tipos de tareas (programación, diseño, testing, etc.)
- 3 niveles de prioridad (baja, media, alta)
- Asignación de tareas
- Comentarios en tareas
- Etiquetas y categorización
- Horas estimadas

### 🔐 Autenticación
- Sistema de login con PIN de 4 dígitos
- Roles de usuario globales
- Sesión persistente

### ⚡ Tiempo Real
- Sincronización automática con Firebase
- Actualizaciones en vivo
- Múltiples usuarios simultáneos

## 📦 Tecnologías

- **Frontend**: React 18 + Vite
- **Base de Datos**: Firebase Firestore
- **Drag & Drop**: @hello-pangea/dnd
- **Routing**: React Router DOM v6
- **Iconos**: Lucide React
- **Hosting**: Firebase Hosting

## 🛠️ Instalación

### Prerrequisitos

- Node.js 16 o superior
- npm o yarn
- Cuenta de Firebase

### Pasos

1. **Clonar el repositorio**

```bash
git clone <tu-repositorio>
cd MainKan
```

2. **Instalar dependencias**

```bash
npm install
```

3. **Configurar Firebase**

El proyecto ya está configurado con Firebase. Las credenciales están en `src/config/firebase.js`.

Si necesitas usar tu propio proyecto de Firebase:
- Crea un proyecto en [Firebase Console](https://console.firebase.google.com/)
- Habilita Firestore Database
- Copia las credenciales y actualiza `src/config/firebase.js`

4. **Configurar Firestore**

Despliega las reglas de seguridad e índices:

```bash
firebase deploy --only firestore:rules
firebase deploy --only firestore:indexes
```

5. **Iniciar en desarrollo**

```bash
npm run dev
```

La aplicación estará disponible en `http://localhost:3000`

## 🚀 Despliegue

### Build de producción

```bash
npm run build
```

### Desplegar a Firebase Hosting

```bash
# Iniciar sesión en Firebase
firebase login

# Desplegar
firebase deploy
```

## 📁 Estructura del Proyecto

```
MainKan/
├── src/
│   ├── components/
│   │   ├── auth/              # Componentes de autenticación
│   │   ├── projects/          # Dashboard y gestión de proyectos
│   │   └── kanban/            # Componentes del tablero Kanban
│   ├── context/               # Context API (Auth, Project, Kanban)
│   ├── services/              # Servicios de Firebase
│   ├── utils/                 # Utilidades y helpers
│   ├── config/                # Configuración (Firebase)
│   ├── App.jsx                # Componente principal
│   └── main.jsx               # Punto de entrada
├── public/
├── firestore.rules            # Reglas de seguridad Firestore
├── firestore.indexes.json     # Índices compuestos
├── firebase.json              # Configuración Firebase
└── package.json
```

## 🎯 Uso

### Primer Acceso

1. **Login**
   - Ingresa un nombre de usuario y PIN de 4 dígitos
   - Si es nuevo, se creará tu cuenta automáticamente

2. **Seleccionar Rol**
   - Elige tu rol en el equipo (Desarrollador, Diseñador, PM, QA, Admin)

3. **Dashboard de Proyectos**
   - Verás todos tus proyectos
   - Crea tu primer proyecto con el botón "Crear Proyecto"

### Gestión de Proyectos

**Crear Proyecto:**
1. Click en "Crear Proyecto"
2. Ingresa nombre, descripción, elige icono y color
3. El proyecto se crea con columnas predeterminadas

**Gestionar Miembros:**
1. Entra al proyecto
2. Click en el ícono de usuarios
3. Agrega o remueve miembros
4. Asigna roles (Admin, Editor, Viewer)

### Trabajar con Tareas

**Crear Tarea:**
1. Click en el botón "+" de cualquier columna
2. Completa el formulario
3. Asigna tipo, prioridad, horas estimadas
4. Asigna a un miembro del equipo

**Mover Tarea:**
- Arrastra y suelta entre columnas

**Ver Detalles:**
- Click simple en la tarea

**Editar:**
- Doble click en la tarea (si tienes permisos)

**Comentarios:**
- Abre los detalles de la tarea
- Escribe en el área de comentarios

## 👥 Roles y Permisos

### Roles Globales (del Usuario)
- **Desarrollador**: Rol de desarrollo
- **Diseñador**: Rol de diseño UI/UX
- **Project Manager**: Gestor de proyectos
- **QA**: Control de calidad
- **Admin**: Administrador del sistema

### Roles en Proyectos
- **Admin**: Control total, gestión de miembros y configuración
- **Editor**: Crear, editar y eliminar tareas y columnas
- **Viewer**: Solo visualizar y comentar

## 🔒 Seguridad

- Autenticación basada en PIN
- Reglas de seguridad en Firestore
- Validación de permisos en frontend y backend
- Control de acceso por proyecto

## 🎨 Personalización

### Tipos de Tareas
Edita `src/utils/roles.js` para modificar tipos de tareas

### Columnas por Defecto
Modifica `DEFAULT_COLUMNS` en `src/utils/roles.js`

### Colores y Temas
Ajusta las variables CSS en `src/App.css`

## 📊 Base de Datos

### Estructura Firestore

```
users/{username}
  - id, username, pin, role, createdAt, updatedAt, settings

projects/{projectId}
  - name, description, owner, members, roles, color, icon
  - isArchived, createdAt, updatedAt, settings
  
  columns/{columnId}
    - id, title, color, order, createdAt
  
  tasks/{taskId}
    - title, description, status, priority, type
    - hours, createdBy, assignedTo, tags
    - comments[], checklist[], attachments[]
    - createdAt, updatedAt
```

## 🐛 Solución de Problemas

### La aplicación no carga
- Verifica la conexión a Internet
- Revisa la consola del navegador
- Verifica las credenciales de Firebase

### Error de permisos en Firestore
- Verifica que las reglas estén desplegadas
- Revisa la configuración del proyecto en Firebase Console

### Tareas no se actualizan
- Verifica que los índices estén creados
- Revisa la consola de Firebase

## 🤝 Contribuir

Las contribuciones son bienvenidas. Por favor:
1. Fork el proyecto
2. Crea una rama para tu feature
3. Commit tus cambios
4. Push a la rama
5. Abre un Pull Request

## 📝 Licencia

Este proyecto está bajo licencia MIT.

## 👨‍💻 Autor

Kanban JCE Team

## 📧 Contacto

Para soporte o preguntas, contacta a tu equipo de desarrollo.

## 🎉 Agradecimientos

- Firebase por la infraestructura
- React por el framework
- Lucide por los iconos
- La comunidad open source

---

**Versión**: 3.0.0  
**Última actualización**: Noviembre 2024

