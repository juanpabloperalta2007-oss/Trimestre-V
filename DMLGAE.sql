use gae;

INSERT INTO usuarios (login, password_hash, estado) VALUES 
('andrescasas@gmail.com', SHA2('123456789', 256), 'Activo'),
('juanpablo@gmail.com', SHA2('987654321', 256), 'Activo'),
('jhoanferia@gmail.com', SHA2('147258369', 256), 'Activo'),
('marialuisa@gmail.com', SHA2('3692581474', 256), 'Activo'),
('jenicortez@gmail.com', SHA2('258369147', 256), 'Activo'),
('jorge5000@gmail.com', SHA2('000111222', 256), 'Activo'),
('carlosrodriguez@gmail.com', SHA2('111000987', 256), 'Activo'),
('laura.martinez@gmail.com', SHA2('22255588', 256), 'Activo');

INSERT INTO cargos (nombre_cargo) VALUES 
('Administrador'),
('Coordinador'),
('Profesor'),
('Acudiente');

INSERT INTO personas (tipo_documento, numero_documento, primer_nombre, segundo_nombre, primer_apellido, segundo_apellido, telefono, correo, id_usuario, id_cargo) 
VALUES
('cedula', '1023373352', 'Andres', 'Felipe', 'Casas', 'Pinarete','3104826083', 'andrescasas@gmail.com', 1, 1),

('cedula', '1036958420', 'Juan', 'Pablo', 'Peralta', 'Roa','3526987741', 'juanpablo@gmail.com', 2, 1),

('tarjeta identidad', '1025698455', 'Jhoan', 'Luis', 'Castro', 'Feria','3225698520', 'jhoanferia@gmail.com', 3, 2),

('cedula', '105698752', 'Maria', 'Luisa', 'Valderrama', 'Diaz','3692587411', 'marialuisa@gmail.com', 4, 2),

('cedula', '1088569753', 'Jennifer', 'Andrea', 'Cortez', 'Martinez','3256669874', 'jenicortez@gmail.com', 5, 2),

('tarjeta identidad', '1500286477', 'Jorge', NULL, 'Salgado', 'Gomez','3571598622', 'jorge5000@gmail.com', 6, 3),

('cedula', '1012345678', 'Carlos', 'Andres', 'Rodriguez', 'Gomez','3001234567', 'carlosrodriguez@gmail.com', 7, 3),

('cedula', '1098765432', 'Laura', 'Marcela', 'Martinez', 'Perez', '3109876543', 'laura.martinez@gmail.com', 8, 4);





INSERT INTO docentes (id_persona, id_cargo) VALUES
(4, 3),
(5, 3);




INSERT INTO acudientes (id_persona, direccion) VALUES
(1, 'Calle 44 #8-28'),
(2, 'Calle 57 #65-9');




INSERT INTO estudiantes (id_persona, codigo_lista, estado) VALUES
(3, 1, 'Activo'),
(6, 2, 'Activo');



INSERT INTO coordinadores (id_persona, area_asignada, estado) VALUES
(7, 'Coordinacion de Convivencia', 'Activo'),
(8, 'Coordinacion Academica', 'Activo');


INSERT INTO areas (nombre_area) VALUES
('Matematicas'),
('Lengua Castellana'),
('Ciencias Naturales');


INSERT INTO asignaturas (nombre_asignatura, id_area) VALUES
('Matemáticas', 1),
('Lengua Castellana', 2),
('Ciencias Naturales', 3),
('Inglés', NULL),
('Educación Física', NULL),
('Tecnología e Informática', NULL);



INSERT INTO cursos (nombre_curso, estado) VALUES
('601', 'Activo'),
('602', 'Activo'),
('701', 'Activo'),
('702', 'Activo'),
('801', 'Activo'),
('802', 'Activo');



INSERT INTO acudientes_estudiantes 
(id_acudiente, id_estudiante, parentesco) VALUES
(1, 1, 'Padre'),
(2, 2, 'Madre');



INSERT INTO estudiantes_cursos 
(id_estudiante, id_curso, anio) VALUES
(1, 1, 2026),
(2, 2, 2026);



INSERT INTO asignaturas_cursos 
(id_asignatura, id_curso, id_docente) VALUES
(1, 1, 1),
(2, 1, 1),
(3, 1, 2),
(4, 1, 2),
(1, 2, 1),
(2, 2, 1),
(3, 2, 2),
(4, 2, 2);


INSERT INTO coordinadores_cursos 
(id_coordinador, id_curso) VALUES
(1, 1),
(1, 2),
(2, 3),
(2, 4);



INSERT INTO asistencias 
(fecha, estado, observaciones, id_estudiante, id_asignatura_curso) VALUES
('2026-08-10', 'Presente', NULL, 1, 1),
('2026-08-10', 'Ausente', 'No presentó excusa', 2, 1),
('2026-08-11', 'Presente', NULL, 1, 2),
('2026-08-11', 'Tarde', 'Llegó 10 minutos tarde', 2, 2),
('2026-08-12', 'Ausente', 'Inasistencia justificada', 1, 3),
('2026-08-12', 'Presente', NULL, 2, 3),
('2026-08-13', 'Presente', NULL, 1, 4),
('2026-08-13', 'Ausente', 'No presentó excusa', 2, 4);


INSERT INTO calendario_escolar 
(titulo, descripcion, fecha_inicio, fecha_fin, tipo_evento, id_curso) VALUES
(
    'Reunión de padres',
    'Reunión general con padres de familia y acudientes.',
    '2026-08-20 07:00:00',
    '2026-08-20 09:00:00',
    'Reunión',
    NULL
),
(
    'Evaluación de Matemáticas',
    'Evaluación correspondiente al segundo periodo.',
    '2026-08-25 08:00:00',
    '2026-08-25 10:00:00',
    'Evaluación',
    1
),
(
    'Actividad deportiva',
    'Jornada de actividades deportivas.',
    '2026-08-28 08:00:00',
    '2026-08-28 12:00:00',
    'Actividad',
    1
),
(
    'Entrega de informes',
    'Entrega de informes académicos a los acudientes.',
    '2026-09-05 07:00:00',
    '2026-09-05 12:00:00',
    'Académico',
    NULL
);


INSERT INTO correos_notificaciones 
(asunto, mensaje, tipo_notificacion, estado_envio, 
 id_docente, id_acudiente, id_estudiante) VALUES

(
    'Notificación de inasistencia',
    'Se informa que el estudiante presentó una inasistencia a clase de Matemáticas.',
    'Inasistencia',
    'Enviado',
    1,
    1,
    1
),

(
    'Notificación de inasistencia',
    'Se informa que el estudiante presentó una inasistencia a clase de Matemáticas.',
    'Inasistencia',
    'Enviado',
    2,
    2,
    2
),

(
    'Llegada tarde a clase',
    'Se informa que el estudiante llegó tarde a la clase de Lengua Castellana.',
    'Llegada tarde',
    'Enviado',
    1,
    2,
    2
),

(
    'Alerta de asistencia',
    'El estudiante registra varias novedades de asistencia durante el periodo.',
    'Alerta',
    'Enviado',
    2,
    1,
    1
);
    

show tables;

select * from usuarios;
select * from personas;
select * from estudiantes;
select * from estudiantes_cursos;
select * from docentes;
select * from cursos;
select * from correos_notificaciones;
select * from coordinadores_cursos;
select * from coordinadores;
select * from cargos;
select * from calendario_escolar;
select * from asistencias;
select * from asignaturas_cursos;
select * from asignaturas;
select * from areas;
select * from acudientes_estudiantes;
select * from acudientes;