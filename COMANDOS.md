# Comandos Útiles - MainKan v3.0

## 🚀 Inicio Rápido

```bash
# Instalar dependencias
npm install

# Iniciar servidor de desarrollo
npm run dev

# La aplicación estará en http://localhost:3000
```

## 📦 Instalación Completa

```bash
# 1. Instalar Node.js (si no lo tienes)
# Descarga desde: https://nodejs.org/

# 2. Instalar Firebase CLI globalmente
npm install -g firebase-tools

# 3. Instalar dependencias del proyecto
npm install

# 4. Iniciar sesión en Firebase
firebase login

# 5. Desplegar reglas de Firestore
firebase deploy --only firestore:rules

# 6. Desplegar índices de Firestore
firebase deploy --only firestore:indexes

# 7. Iniciar aplicación
npm run dev
```

## 🛠️ Desarrollo

```bash
# Iniciar servidor de desarrollo
npm run dev

# La app se recarga automáticamente al hacer cambios
# Abre http://localhost:3000 en tu navegador
```

## 📦 Build y Despliegue

```bash
# Crear build de producción
npm run build

# Los archivos estarán en la carpeta /dist

# Previsualizar build localmente
npm run preview

# Desplegar a Firebase Hosting
firebase deploy

# O solo desplegar hosting
firebase deploy --only hosting
```

## 🔥 Firebase

```bash
# Iniciar sesión
firebase login

# Ver proyectos
firebase projects:list

# Seleccionar proyecto
firebase use <project-id>

# Desplegar solo reglas
firebase deploy --only firestore:rules

# Desplegar solo índices
firebase deploy --only firestore:indexes

# Desplegar todo
firebase deploy

# Ver logs
firebase functions:log
```

## 🧹 Limpieza

```bash
# Limpiar caché de node
rm -rf node_modules
npm install

# Limpiar build
rm -rf dist

# Reinstalar todo desde cero
rm -rf node_modules package-lock.json
npm install
```

## 🐛 Solución de Problemas

```bash
# Si hay errores de dependencias
npm install --legacy-peer-deps

# Si hay problemas con el build
npm run build -- --debug

# Verificar versión de Node
node --version
# Debe ser 16 o superior

# Verificar versión de npm
npm --version
```

## 📊 Firestore

```bash
# Ver datos en consola
# Ve a: https://console.firebase.google.com
# Navega a tu proyecto > Firestore Database

# Importar datos de ejemplo (si tienes un archivo)
# firebase firestore:delete --all-collections
# node scripts/seed.js (si creas un script de seed)

# Exportar datos
firebase firestore:export gs://tu-bucket/backup

# Importar datos
firebase firestore:import gs://tu-bucket/backup
```

## 🔍 Debugging

```bash
# Ver errores en tiempo real
# Abre DevTools en el navegador (F12)
# Ve a la pestaña Console

# Verificar reglas de Firestore
# Ve a Firebase Console > Firestore > Rules
# Verifica que estén publicadas correctamente

# Verificar índices
# Ve a Firebase Console > Firestore > Indexes
# Espera a que todos estén en estado "Enabled"
```

## 📱 Pruebas

```bash
# Instalar dependencias de pruebas (opcional)
npm install --save-dev @testing-library/react @testing-library/jest-dom vitest

# Ejecutar pruebas (si las configuras)
npm test
```

## 🌐 Acceso Remoto

```bash
# Después de desplegar, tu app estará en:
# https://mainkam-915ac.web.app
# o
# https://mainkam-915ac.firebaseapp.com

# Ver logs de hosting
firebase hosting:channel:list

# Crear preview deploy
firebase hosting:channel:deploy preview
```

## 📝 Scripts Personalizados

```bash
# Agregar scripts personalizados en package.json:

# "scripts": {
#   "dev": "vite",
#   "build": "vite build",
#   "preview": "vite preview",
#   "deploy": "npm run build && firebase deploy",
#   "deploy:rules": "firebase deploy --only firestore:rules",
#   "deploy:hosting": "firebase deploy --only hosting"
# }

# Usar:
npm run deploy
npm run deploy:rules
npm run deploy:hosting
```

## 🎯 Primeros Pasos Después de Instalar

1. **Inicia el servidor**:
   ```bash
   npm run dev
   ```

2. **Abre el navegador**: 
   ```
   http://localhost:3000
   ```

3. **Crea tu primer usuario**:
   - Usuario: `admin`
   - PIN: `1234`
   - Selecciona rol: Admin

4. **Crea tu primer proyecto**:
   - Click en "Crear Proyecto"
   - Nombre: "Mi Primer Proyecto"
   - Elige icono y color

5. **Crea tu primera tarea**:
   - Click en el "+" de cualquier columna
   - Completa los datos
   - ¡Listo!

## 💡 Tips

- **Hot Reload**: Los cambios se reflejan automáticamente sin recargar
- **Estado Persistente**: Los datos se guardan automáticamente en Firebase
- **Múltiples Usuarios**: Abre en varias pestañas para ver sync en tiempo real
- **DevTools**: Usa React DevTools para debugging avanzado
- **Network Tab**: Verifica las llamadas a Firebase en el Network tab

## 🔗 Enlaces Útiles

- Firebase Console: https://console.firebase.google.com
- React Docs: https://react.dev
- Vite Docs: https://vitejs.dev
- Firebase Docs: https://firebase.google.com/docs

## ⚡ Comandos Rápidos del Día a Día

```bash
# Desarrollo
npm run dev

# Build y deploy
npm run build && firebase deploy

# Ver la app en producción
open https://mainkam-915ac.web.app

# Actualizar solo reglas
firebase deploy --only firestore:rules
```

---

¿Preguntas? Revisa el README.md o la documentación de Firebase.

