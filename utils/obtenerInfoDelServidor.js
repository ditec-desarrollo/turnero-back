const { conectar_BD_GAF_MySql } = require("../config/dbEstadisticasMYSQL");

const obtenerFechaDelServidor = async (req, res) => {
    let connection;
    try {

       connection = await conectar_BD_GAF_MySql();
       const [result] = await connection.execute("SELECT DATE_FORMAT(NOW(), '%Y-%m-%d') AS fecha_actual");
       
       return result[0];

    } catch (error) {
      res.status(500).json({ message: error.message || "Algo salió mal :(" });
    }finally {
     
      if (connection) {
        await connection.end();
      }
    }
  }

  const obtenerFechaHoraDelServidor = async (req, res) => {
    let connection;
    try {

        connection = await conectar_BD_GAF_MySql();
        const [result] = await connection.execute("SELECT DATE_FORMAT(NOW(), '%Y-%m-%d %H:%i:%s') AS fecha_hora_actual");
        return result[0];

    } catch (error) {
      res.status(500).json({ message: error.message || "Algo salió mal :(" });
    }finally {
     
      if (connection) {
        await connection.end();
      }
    }
  }

  const obtenerHoraDelServidor = async (req, res) => {
    let connection;
    try {

        connection = await conectar_BD_GAF_MySql();
        const [result] = await connection.execute("SELECT DATE_FORMAT(NOW(), '%H:%i:%s') AS hora_actual");
        return result[0];

    } catch (error) {
      res.status(500).json({ message: error.message || "Algo salió mal :(" });
    }finally {
     
      if (connection) {
        await connection.end();
      }
    }
  }

module.exports={obtenerFechaDelServidor, obtenerFechaHoraDelServidor, obtenerHoraDelServidor}