drop database GAE;
create database GAE;
use GAE;
show tables;
-- 1. AUTENTICACIÓN Y TABLA BASE DE PERSONAS
CREATE TABLE usuarios (
    id_usuario INT AUTO_INCREMENT PRIMARY KEY,
    login VARCHAR(100) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    estado VARCHAR(20) DEFAULT 'Activo'
);

CREATE TABLE cargos (
    id_cargo INT AUTO_INCREMENT PRIMARY KEY,
    nombre_cargo VARCHAR(100) NOT NULL
);


CREATE TABLE personas (
    id_persona INT AUTO_INCREMENT PRIMARY KEY,
    tipo_documento VARCHAR(20) NOT NULL,
    numero_documento VARCHAR(20) UNIQUE NOT NULL,
    primer_nombre VARCHAR(100) NOT NULL,
    segundo_nombre VARCHAR(100) NULL,
    primer_apellido VARCHAR(100) NOT NULL,
    segundo_apellido VARCHAR(100) NULL,
    telefono VARCHAR(20) NULL,
    correo VARCHAR(255) UNIQUE NULL, -- Para notificaciones directas
    id_usuario INT UNIQUE NULL,
    FOREIGN KEY (id_usuario) REFERENCES usuarios(id_usuario) ON DELETE SET NULL,
    id_cargo int,
    foreign key (id_cargo) references cargos(id_cargo)
);

-- 2. TABLAS ESPECÍFICAS POR ROL (Docente, Acudiente, Estudiante, Coordinador)

CREATE TABLE docentes (
    id_docente INT AUTO_INCREMENT PRIMARY KEY,
    id_persona INT UNIQUE NOT NULL,
    id_cargo INT NULL,
    FOREIGN KEY (id_persona) REFERENCES personas(id_persona) ON DELETE CASCADE,
    FOREIGN KEY (id_cargo) REFERENCES cargos(id_cargo) ON DELETE SET NULL
);

CREATE TABLE acudientes (
    id_acudiente INT AUTO_INCREMENT PRIMARY KEY,
    id_persona INT UNIQUE NOT NULL,
    direccion VARCHAR(150) NULL,
    FOREIGN KEY (id_persona) REFERENCES personas(id_persona) ON DELETE CASCADE
);

CREATE TABLE estudiantes (
    id_estudiante INT AUTO_INCREMENT PRIMARY KEY,
    id_persona INT UNIQUE NOT NULL,
    codigo_lista INT UNIQUE NOT NULL,
    estado VARCHAR(20) DEFAULT 'Activo',
    FOREIGN KEY (id_persona) REFERENCES personas(id_persona) ON DELETE CASCADE
);

-- TABLA DE COORDINADORES
CREATE TABLE coordinadores (
    id_coordinador INT AUTO_INCREMENT PRIMARY KEY,
    id_persona INT UNIQUE NOT NULL,
    area_asignada VARCHAR(100) NULL, -- Ej: 'Coordinación Académica', 'Coordinación de Convivencia'
    estado VARCHAR(20) DEFAULT 'Activo',
    FOREIGN KEY (id_persona) REFERENCES personas(id_persona) ON DELETE CASCADE
);

-- 3. ESTRUCTURA ACADÉMICA BASE
CREATE TABLE areas (
    id_area INT AUTO_INCREMENT PRIMARY KEY,
    nombre_area VARCHAR(100) NOT NULL
);

CREATE TABLE asignaturas (
    id_asignatura INT AUTO_INCREMENT PRIMARY KEY,
    nombre_asignatura VARCHAR(100) NOT NULL,
    id_area INT NULL,
    FOREIGN KEY (id_area) REFERENCES areas(id_area) ON DELETE SET NULL
);

CREATE TABLE cursos (
    id_curso INT AUTO_INCREMENT PRIMARY KEY,
    nombre_curso VARCHAR(100) UNIQUE NOT NULL,
    estado VARCHAR(20) DEFAULT 'Activo'
);

-- 4. RELACIONES ACADÉMICAS E INTERMEDIAS
CREATE TABLE acudientes_estudiantes (
    id_acudiente INT NOT NULL,
    id_estudiante INT NOT NULL,
    parentesco VARCHAR(50) DEFAULT 'Acudiente',
    PRIMARY KEY (id_acudiente, id_estudiante),
    FOREIGN KEY (id_acudiente) REFERENCES acudientes(id_acudiente) ON DELETE CASCADE,
    FOREIGN KEY (id_estudiante) REFERENCES estudiantes(id_estudiante) ON DELETE CASCADE
);

CREATE TABLE estudiantes_cursos (
    id_estudiante INT NOT NULL,
    id_curso INT NOT NULL,
    anio YEAR NOT NULL DEFAULT (YEAR(CURRENT_DATE)),
    PRIMARY KEY (id_estudiante, id_curso, anio),
    FOREIGN KEY (id_estudiante) REFERENCES estudiantes(id_estudiante) ON DELETE CASCADE,
    FOREIGN KEY (id_curso) REFERENCES cursos(id_curso) ON DELETE CASCADE
);

CREATE TABLE asignaturas_cursos (
    id_asignatura_curso INT AUTO_INCREMENT PRIMARY KEY,
    id_asignatura INT NOT NULL,
    id_curso INT NOT NULL,
    id_docente INT NOT NULL,
    UNIQUE(id_asignatura, id_curso),
    FOREIGN KEY (id_asignatura) REFERENCES asignaturas(id_asignatura) ON DELETE CASCADE,
    FOREIGN KEY (id_curso) REFERENCES cursos(id_curso) ON DELETE CASCADE,
    FOREIGN KEY (id_docente) REFERENCES docentes(id_docente) ON DELETE CASCADE
);

-- Asignación de Coordinador a Cursos (tomado de tu script original)
CREATE TABLE coordinadores_cursos (
    id_coordinador INT NOT NULL,
    id_curso INT NOT NULL,
    PRIMARY KEY (id_coordinador, id_curso),
    FOREIGN KEY (id_coordinador) REFERENCES coordinadores(id_coordinador) ON DELETE CASCADE,
    FOREIGN KEY (id_curso) REFERENCES cursos(id_curso) ON DELETE CASCADE
);

-- 5. OPERACIÓN, CALENDARIO Y NOTIFICACIONES
CREATE TABLE asistencias (
    id_asistencia INT AUTO_INCREMENT PRIMARY KEY,
    fecha DATE NOT NULL,
    estado VARCHAR(50) NOT NULL,
    observaciones TEXT NULL,
    id_estudiante INT NOT NULL,
    id_asignatura_curso INT NOT NULL,
    FOREIGN KEY (id_estudiante) REFERENCES estudiantes(id_estudiante) ON DELETE CASCADE,
    FOREIGN KEY (id_asignatura_curso) REFERENCES asignaturas_cursos(id_asignatura_curso) ON DELETE CASCADE
);

CREATE TABLE calendario_escolar (
    id_evento INT AUTO_INCREMENT PRIMARY KEY,
    titulo VARCHAR(150) NOT NULL,
    descripcion TEXT NULL,
    fecha_inicio DATETIME NOT NULL,
    fecha_fin DATETIME NOT NULL,
    tipo_evento VARCHAR(50) DEFAULT 'General',
    id_curso INT NULL,
    FOREIGN KEY (id_curso) REFERENCES cursos(id_curso) ON DELETE CASCADE
);

CREATE TABLE correos_notificaciones (
    id_correo INT AUTO_INCREMENT PRIMARY KEY,
    asunto VARCHAR(150) NOT NULL,
    mensaje TEXT NOT NULL,
    fecha_envio DATETIME DEFAULT CURRENT_TIMESTAMP,
    tipo_notificacion VARCHAR(50) DEFAULT 'Inasistencia',
    estado_envio VARCHAR(20) DEFAULT 'Enviado',
    id_docente INT NOT NULL,
    id_acudiente INT NOT NULL,
    id_estudiante INT NULL,
    FOREIGN KEY (id_docente) REFERENCES docentes(id_docente) ON DELETE CASCADE,
    FOREIGN KEY (id_acudiente) REFERENCES acudientes(id_acudiente) ON DELETE CASCADE,
    FOREIGN KEY (id_estudiante) REFERENCES estudiantes(id_estudiante) ON DELETE SET NULL
);