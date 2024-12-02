const CustomError = require("../utils/customError");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const {
  conectarBDEstadisticasMySql,
} = require("../config/dbEstadisticasMYSQL");


const getAuthStatus = async (req, res) => {
  let connection;
  try {
    connection = await conectarBDEstadisticasMySql();
    const id = req.id;

    const [user] = await connection.execute(
      "SELECT * FROM persona WHERE id_persona = ?",
      [id]
    );

    if (user.length == 0) throw new CustomError("Autenticación fallida", 401);
    const { clave, ...usuarioSinContraseña } = user[0];
    // await connection.end();
    res.status(200).json({ usuarioSinContraseña });
  } catch (error) {
    res.status(error.code || 500).json({
      message:
        error.message || "Ups! Hubo un problema, por favor intenta más tarde",
    });
  } finally {
    // Cerrar la conexión a la base de datos
    if (connection) {
      await connection.end();
    }
  }
};

module.exports = {
  getAuthStatus,
};
