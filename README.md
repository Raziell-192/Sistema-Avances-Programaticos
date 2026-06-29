# Sistema de Avances Programáticos (SAP)
### Universidad de la Sierra Sur — UNSIS

Plataforma web para registrar, consultar y dar seguimiento al avance de los contenidos temáticos de las asignaturas impartidas durante un periodo escolar. Permite comparar el avance real contra la planeación semestral, facilita la supervisión por parte de jefes de departamento y genera reportes estadísticos de cumplimiento académico.

**Video de demostración:** [https://youtu.be/VVdspqCwcyg]

---

## Arquitectura del Sistema

El sistema utiliza una arquitectura **Cliente-Servidor** basada en **SPA + API REST**:

```
Cliente (Vue 3 SPA)
      │
      │  HTTP / JSON
      \/
Servidor (Express.js REST API)
      │
      │  SQL
      \/
Base de Datos (PostgreSQL)
```
sistema-avances-programaticos/
├── frontend/ # Vue 3 SPA
│   └── src/
│       ├── components/
│       ├── layouts/
│       ├── pages/
│       │   ├── admin/
│       │   ├── docente/
│       │   └── jefe/
│       ├── router/
│       ├── services/
│       └── stores/
├── backend/ # Express.js REST API
│   └── src/
│       ├── config/
│       ├── controllers/
│       ├── middlewares/
│       ├── routes/
│       └── uploads/
├── database/
│   └── schema.sql
└── README.md

---

## Tecnologías y versiones

### Frontend
| Tecnología | Versión |
|---|---|
| Vue | 3.5.38 |
| Vite | 8.0.16 |
| Vue Router | 4.6.4 |
| Pinia | 3.0.4 |
| Axios | 1.18.1 |
| Chart.js | 4.5.1 |
| vue-chartjs | 5.3.3 |

### Backend
| Tecnología | Versión |
|---|---|
| Node.js | 26.3.1 o superior |
| Express.js | 5.2.1 |
| jsonwebtoken | 9.0.3 |
| bcryptjs | 3.0.3 |
| multer | 2.2.0 |
| pg | 8.22.0 |
| dotenv | 17.4.2 |
| nodemon | 3.1.14 |

### Base de datos
| Tecnología | Versión |
|---|---|
| PostgreSQL | 16.14 o superior |

---

## Instalación y ejecución

### Prerrequisitos
- Node.js v20 o superior
- PostgreSQL 16 o superior

### 1 — Clonar el repositorio
```bash
git clone https://github.com/Raziell-192/Sistema-Avances-Programaticos.git
cd Sistema-Avances-Programaticos
```

### 2 — Configurar la base de datos
```bash
psql postgres
```
```sql
CREATE DATABASE sap_db;
CREATE USER postgres WITH PASSWORD 'password';
GRANT ALL PRIVILEGES ON DATABASE sap_db TO postgres;
\q
```
Ejecutar el schema:
```bash
psql -U postgres -d sap_db -f database/schema.sql
```

### 3 — Configurar y ejecutar el Backend
```bash
cd backend
npm install
```

Crear el archivo `.env` en `/backend`:
```env
PORT=3000

DB_HOST=localhost
DB_PORT=5432
DB_NAME=sap_db
DB_USER=postgres
DB_PASSWORD=password

JWT_SECRET=clave_secreta
```

Ejecutar el servidor:
```bash
npm run dev
```
El backend quedará disponible en `http://localhost:3000`

### 4 — Configurar y ejecutar el Frontend
```bash
cd frontend
npm install
npm run dev
```
El frontend quedará disponible en `http://localhost:5173`

### 5 — Acceso inicial al sistema

| Rol | Correo | Contraseña |
|---|---|---|
| Administrador | admin@sap.edu.mx | Admin1234 |

---

## Roles del sistema

| Rol | Permisos |
|---|---|
| **Administrador** | Gestión completa: usuarios, departamentos, licenciaturas, grupos, periodos, planes de estudio, materias, unidades y asignaciones |
| **Docente** | Registro de avances por parcial, subida de evidencias, consulta de recopilatorio semestral |
| **Jefe de Departamento** | Consulta de reportes y análisis de cumplimiento académico |

---

## Endpoints principales de la API

### Autenticación
| Método | Endpoint | Descripción |
|---|---|---|
| POST | `/api/auth/login` | Iniciar sesión, retorna JWT |

### Usuarios
| Método | Endpoint | Descripción |
|---|---|---|
| GET | `/api/usuarios` | Listar usuarios |
| POST | `/api/usuarios` | Crear usuario |
| PUT | `/api/usuarios/:id` | Editar usuario |
| PATCH | `/api/usuarios/:id/toggle` | Activar/desactivar usuario |

### Catálogos
| Método | Endpoint | Descripción |
|---|---|---|
| GET/POST/PUT/DELETE | `/api/departamentos` | Gestión de departamentos |
| GET/POST/PUT/DELETE | `/api/periodos` | Gestión de periodos escolares |
| GET/POST/PUT/DELETE | `/api/planes` | Gestión de planes de estudio |
| GET/POST/PUT/DELETE | `/api/materias` | Gestión de materias |
| GET/POST/PUT/DELETE | `/api/unidades` | Gestión de unidades temáticas |
| GET/PUT | `/api/licenciaturas` | Consulta y edición de licenciaturas |
| GET/POST/DELETE | `/api/grupos` | Gestión de grupos |
| GET/POST/DELETE | `/api/asignaciones` | Asignaciones docente-materia |

### Avances
| Método | Endpoint | Descripción |
|---|---|---|
| GET | `/api/avances` | Listar todos los avances |
| GET | `/api/avances/docente/:id` | Avances de un docente específico |
| GET | `/api/avances/resumen/:id` | Resumen de parciales por materia |
| POST | `/api/avances` | Registrar nuevo avance |
| PUT | `/api/avances/:id` | Editar avance |
| DELETE | `/api/avances/:id` | Eliminar avance |

### Evidencias
| Método | Endpoint | Descripción |
|---|---|---|
| GET | `/api/evidencias/avance/:id` | Evidencias de un avance |
| POST | `/api/evidencias` | Subir archivo de evidencia |
| DELETE | `/api/evidencias/:id` | Eliminar evidencia |

### Reportes y Dashboard
| Método | Endpoint | Descripción |
|---|---|---|
| GET | `/api/dashboard` | Indicadores, gráficas y alertas |
| GET | `/api/reportes/docentes` | Reporte por docentes |
| GET | `/api/reportes/materias` | Reporte por materias |
| GET | `/api/reportes/departamentos` | Reporte por departamentos |
| GET | `/api/reportes/cumplimiento` | Reporte de cumplimiento |

---

## Tipos de evidencia permitidos

- **Lista de asistencia:** PDF, DOCX, PPTX, JPG, PNG
- **Reporte de asesorías:** PDF, DOCX, PPTX, JPG, PNG, XLS, XLSX, ODS
- Tamaño máximo por archivo: **10MB**
- Nomenclatura: `{Grupo}_Asistencia_{Materia}` y `Asesorias_{NombreProfesor}`