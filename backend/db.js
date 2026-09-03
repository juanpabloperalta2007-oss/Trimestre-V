import mysql from 'mysql2/promise';

// se crea una function para aceptar las conexiones simultanias

const pool = mysql.createPool ({
    host: process.env.DB_host,  // direccion del servidor ejemplo: localhost o ip del  servidor de la nube
    user: process.env.DB_user, // Usuario de la base de datos
    password: process.env.DB_password, // password de la base de datos
    database: process.env.DB_name,  // Nombre de la base de datos
    waitForConnections: true, // tiempo de espera para dar a un usuario cuando una conxion es libre
    connectionLimit: 10, // cantidad de usuarios que voy a dejar conectar, en este caso 10 usuarios
    queueLimit: 0 // se define cuantas peteiciones se pueden quedar esperando en la fila
    
})

export default pool; 