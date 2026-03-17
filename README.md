# 642 APP — Sistema de Gestión para 642 Studio

## Cómo abrir el proyecto

1. Descomprime la carpeta `642app`
2. Abre `index.html` directo en tu navegador (Chrome recomendado)
3. Inicia sesión con las credenciales de prueba

**No necesitas instalar nada. No necesitas servidor.**

---

## Credenciales de prueba

| Usuario | Contraseña    | Rol           |
|---------|---------------|---------------|
| admin   | admin123      | Administrador |

Puedes crear más usuarios desde el formulario de **Registrarse**.

---

## Estructura del proyecto

```
642app/
├── index.html              ← Pantalla de Login / Registro
├── pages/
│   ├── dashboard.html      ← Panel principal con métricas y gráficas
│   ├── clientes.html       ← CRUD completo de clientes
│   ├── reservas.html       ← Calendario + lista de reservas
│   ├── inventario.html     ← CRUD de inventario con métricas
│   ├── turnos.html         ← Gestión de turnos por fotógrafo
│   └── facturacion.html    ← Facturas con impresión
├── css/
│   └── styles.css          ← Estilos globales
└── js/
    ├── app.js              ← Auth + DB + UI helpers
    ├── sidebar.js          ← Sidebar compartido
    └── login.js            ← Lógica de login/registro
```

---

## Módulos incluidos

### 🔐 Login / Registro
- Iniciar sesión con validación
- Registrar usuarios con nombre, usuario, rol y contraseña
- Indicador de fuerza de contraseña
- Mostrar/ocultar contraseña
- Toast de error/éxito
- Sesión activa con sessionStorage
- Usuarios guardados en localStorage

### 📊 Dashboard
- Contadores en tiempo real: clientes, inventario, reservas, facturas
- Gráfica de línea: resumen de ingresos
- Gráfica de barras: estado del inventario
- Tabla de próximas reservas

### 👥 Clientes
- Ver, buscar, agregar, editar y eliminar clientes
- Campos: nombre, teléfono, email, notas
- Muestra cuántas reservas tiene cada cliente

### 📅 Reservas
- Vista de **calendario mensual** con reservas por día
- Vista de **lista** con filtros
- Agregar, editar y eliminar reservas
- Estados: pendiente, confirmada, completada, cancelada
- Campos: cliente, servicio, fecha, hora, duración, precio, estado

### 📦 Inventario
- Agregar, editar y eliminar productos
- Filtro por categoría y búsqueda
- Métricas: total, stock bajo, valor total
- Indicador de stock bajo en rojo/naranja
- Campos: nombre, categoría, stock, precio, ubicación, descripción

### 🕐 Turnos
- Asignar turnos a fotógrafos registrados
- Filtro por mes y búsqueda
- Cálculo automático de horas trabajadas
- Estados: activo, libre, ausente

### 🧾 Facturación
- Crear, editar y eliminar facturas
- Numeración automática (FAC-001, FAC-002...)
- Métricas: total cobrado, pendiente, facturas emitidas
- **Imprimir recibo** directo desde el navegador
- Estados: pendiente, pagada, cancelada

---

## Tecnologías

- HTML5 / CSS3 / JavaScript puro (Vanilla JS)
- Chart.js para gráficas (cargado desde CDN)
- localStorage para datos persistentes
- sessionStorage para sesión activa

---

## Notas para el desarrollo

- Los datos se guardan en el `localStorage` del navegador
- Si abres el proyecto en otro navegador, los datos NO se transferirán
- Para resetear los datos: abre la consola del navegador → `localStorage.clear()` → recarga la página
- Para agregar más campos a un módulo, edita el HTML del modal y el JS de guardado en el archivo `.html` correspondiente

---

*Proyecto ITSON — 642 Studio*
