CREATE DATABASE algothinker;

CREATE TABLE usuarios (
    id SERIAL PRIMARY KEY,
    nombre VARCHAR(200) NOT NULL,
    email VARCHAR(100) UNIQUE NOT NULL,
    foto_perfil VARCHAR(500) DEFAULT '',
    password VARCHAR(300) NOT NULL         
);

CREATE TABLE cursos (
    id SERIAL PRIMARY KEY,
    nombre VARCHAR(200) NOT NULL
);

CREATE TABLE cursos_por_usuario (
    id SERIAL PRIMARY KEY,
    id_usuario INT REFERENCES usuarios(id) ON DELETE CASCADE,
    id_curso INT REFERENCES cursos(id) ON DELETE CASCADE,
    porcentaje_dominio NUMERIC(3, 2)
);

CREATE TABLE seccion_curso (
    id SERIAL PRIMARY KEY,
    nombre VARCHAR(200) NOT NULL,
    porcentaje_dominio NUMERIC(3, 2),
    id_curso INT REFERENCES cursos(id) ON DELETE CASCADE
);

CREATE TABLE lecciones (
    id SERIAL PRIMARY KEY,
    nombre VARCHAR(200) NOT NULL,
    objetivos_completados NUMERIC(3, 2) DEFAULT 0.00,
    archivo_teoria VARCHAR(200) DEFAULT '',
    archivo_explicacion_video VARCHAR(200) DEFAULT '',
    id_seccion_curso INT REFERENCES seccion_curso(id) ON DELETE CASCADE
);

CREATE TABLE lecciones_por_usuario (
    id SERIAL PRIMARY KEY,
    id_leccion INT REFERENCES lecciones(id) ON DELETE CASCADE,
    id_cursos_por_usuario INT REFERENCES cursos_por_usuario(id) ON DELETE CASCADE,
    fecha TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

/* INSERCIONES INICIALES */

INSERT INTO usuarios (
    nombre,
    email,
    password
) VALUES (
    'Luis Barboza',
    'lbarbozanav@gmail.com',
    '12345'
);