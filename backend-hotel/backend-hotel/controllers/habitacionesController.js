const db = require('../config/bd'); 

exports.getHabitaciones = (req, res) => {
    const sql = "SELECT * FROM habitaciones";
    
    db.query(sql, (err, results) => {
        if (err) {
            console.error("Error al obtener habitaciones:", err);
            return res.status(500).json({ error: "Error en la base de datos" });
        }
        // Esto es lo que recibe tu fetch en el frontend
        res.json(results);
    });
};