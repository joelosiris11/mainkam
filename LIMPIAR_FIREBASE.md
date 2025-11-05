# 🧹 Limpieza de Tareas Viejas en Firebase

## ⚠️ Solo necesario si creaste tareas ANTES del fix

Las tareas creadas antes tenían IDs incorrectos. Para que todo funcione correctamente:

## Opción 1: Eliminar desde Firebase Console (MÁS RÁPIDO)

1. Ve a: https://console.firebase.google.com
2. Selecciona tu proyecto: `mainkam-915ac`
3. Ve a **Firestore Database**
4. Navega a: `projects` → `{tu-proyecto-id}` → `tasks`
5. Selecciona todos los documentos de tasks
6. Click derecho → **Delete document**
7. **Recarga la app** (F5)

## Opción 2: Crear Proyecto Nuevo (MÁS SIMPLE)

1. En MainKan, vuelve al Dashboard
2. Click en "Crear Proyecto"
3. Dale un nombre nuevo
4. Trabaja en el nuevo proyecto

**Las tareas nuevas tendrán IDs correctos automáticamente.**

---

## ✅ Después de la limpieza

1. Recarga la página
2. Crea una tarea nueva
3. Todo funcionará:
   - ✅ Drag & drop
   - ✅ Comentarios en tiempo real
   - ✅ Edición de tareas
   - ✅ Gestión de columnas
   - ✅ Burndown chart

---

## 🎉 Nuevas Funcionalidades Agregadas

### 📊 Burndown Chart
- Click en el ícono de gráfica (📊) en el header
- Muestra el progreso del proyecto en el tiempo

### 📋 Gestión de Columnas
- Click en el ícono de columnas (☰) en el header
- Crea nuevas columnas personalizadas
- Cambia colores de columnas
- Elimina columnas vacías

### 💬 Comentarios en Tiempo Real
- Ahora los comentarios se ven INMEDIATAMENTE
- No necesitas salir y volver a entrar

---

**¡Todo listo para trabajar!** 🚀

