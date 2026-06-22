-- ============================================
-- SISTEMA DE AVANCES PROGRAMÁTICOS (SAP)
-- Schema de Base de Datos
-- ============================================

-- Limpiar tablas si ya existen
DROP TABLE IF EXISTS evidencias CASCADE;
DROP TABLE IF EXISTS avances CASCADE;
DROP TABLE IF EXISTS docente_materia CASCADE;
DROP TABLE IF EXISTS unidades CASCADE;
DROP TABLE IF EXISTS materias CASCADE;
DROP TABLE IF EXISTS planes_estudio CASCADE;
DROP TABLE IF EXISTS periodos CASCADE;
DROP TABLE IF EXISTS departamentos CASCADE;
DROP TABLE IF EXISTS usuarios CASCADE;
DROP TABLE IF EXISTS roles CASCADE;

-- ============================================
-- ROLES
-- ============================================
CREATE TABLE roles (
  id_rol SERIAL PRIMARY KEY,
  nombre VARCHAR(50) NOT NULL UNIQUE
);

-- ============================================
-- USUARIOS
-- ============================================
CREATE TABLE usuarios (
  id_usuario  SERIAL PRIMARY KEY,
  nombre      VARCHAR(100) NOT NULL,
  correo      VARCHAR(100) NOT NULL UNIQUE,
  password    VARCHAR(255) NOT NULL,
  id_rol      INTEGER NOT NULL REFERENCES roles(id_rol),
  activo      BOOLEAN DEFAULT TRUE,
  created_at  TIMESTAMP DEFAULT NOW()
);

-- ============================================
-- DEPARTAMENTOS
-- ============================================
CREATE TABLE departamentos (
  id_departamento SERIAL PRIMARY KEY,
  nombre          VARCHAR(100) NOT NULL UNIQUE,
  activo          BOOLEAN DEFAULT TRUE
);

-- ============================================
-- PERIODOS ESCOLARES
-- ============================================
CREATE TABLE periodos (
  id_periodo   SERIAL PRIMARY KEY,
  nombre       VARCHAR(100) NOT NULL,
  fecha_inicio DATE NOT NULL,
  fecha_fin    DATE NOT NULL,
  activo       BOOLEAN DEFAULT TRUE
);

-- ============================================
-- PLANES DE ESTUDIO
-- ============================================
CREATE TABLE planes_estudio (
  id_plan SERIAL PRIMARY KEY,
  nombre  VARCHAR(100) NOT NULL UNIQUE,
  activo  BOOLEAN DEFAULT TRUE
);

-- ============================================
-- MATERIAS
-- ============================================
CREATE TABLE materias (
  id_materia      SERIAL PRIMARY KEY,
  clave           VARCHAR(20) NOT NULL UNIQUE,
  nombre          VARCHAR(150) NOT NULL,
  id_departamento INTEGER NOT NULL REFERENCES departamentos(id_departamento),
  id_plan         INTEGER NOT NULL REFERENCES planes_estudio(id_plan),
  activo          BOOLEAN DEFAULT TRUE
);

-- ============================================
-- UNIDADES TEMÁTICAS
-- ============================================
CREATE TABLE unidades (
  id_unidad           SERIAL PRIMARY KEY,
  id_materia          INTEGER NOT NULL REFERENCES materias(id_materia),
  nombre              VARCHAR(150) NOT NULL,
  porcentaje_esperado NUMERIC(5,2) NOT NULL CHECK (porcentaje_esperado >= 0 AND porcentaje_esperado <= 100)
);

-- ============================================
-- ASIGNACIÓN DOCENTE - MATERIA
-- ============================================
CREATE TABLE docente_materia (
  id_asignacion SERIAL PRIMARY KEY,
  id_docente    INTEGER NOT NULL REFERENCES usuarios(id_usuario),
  id_materia    INTEGER NOT NULL REFERENCES materias(id_materia),
  id_periodo    INTEGER NOT NULL REFERENCES periodos(id_periodo),
  UNIQUE (id_docente, id_materia, id_periodo)
);

-- ============================================
-- AVANCES PROGRAMÁTICOS
-- ============================================
CREATE TABLE avances (
  id_avance     SERIAL PRIMARY KEY,
  id_docente    INTEGER NOT NULL REFERENCES usuarios(id_usuario),
  id_materia    INTEGER NOT NULL REFERENCES materias(id_materia),
  id_unidad     INTEGER NOT NULL REFERENCES unidades(id_unidad),
  porcentaje    NUMERIC(5,2) NOT NULL CHECK (porcentaje >= 0 AND porcentaje <= 100),
  fecha         DATE NOT NULL DEFAULT CURRENT_DATE,
  observaciones TEXT,
  created_at    TIMESTAMP DEFAULT NOW()
);

-- ============================================
-- EVIDENCIAS
-- ============================================
CREATE TABLE evidencias (
  id_evidencia SERIAL PRIMARY KEY,
  id_avance    INTEGER NOT NULL REFERENCES avances(id_avance) ON DELETE CASCADE,
  archivo      VARCHAR(255) NOT NULL,
  fecha_subida TIMESTAMP DEFAULT NOW()
);

-- ============================================
-- DATOS INICIALES
-- ============================================
INSERT INTO roles (nombre) VALUES
  ('administrador'),
  ('docente'),
  ('jefe_departamento');

-- Contraseña: Admin1234 (bcrypt, se reemplaza al arrancar el backend)
INSERT INTO usuarios (nombre, correo, password, id_rol) VALUES
  ('Administrador', 'admin@sap.edu.mx', '$2b$10$placeholder', 1);
