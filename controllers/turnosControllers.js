const { conectarDBTurnosPrueba } = require("../config/dbTurnosMYSQL");
const nodemailer = require('nodemailer');
const { formatFechaEmail } = require("../utils/helpers");

const obtenerTramites = async (req, res) => {
  let connection;
  try {
      connection = await conectarDBTurnosPrueba();
        const reparticion_id = req.query.reparticion_id;
  
      const [tramites, fields] = await connection.execute(
        " SELECT tramite.idtramite, tramite.nombre_tramite, tramite.reparticion_id, tramite.observaciones, tramite.adicionalrequerido FROM tramite WHERE reparticion_id = ? ",[reparticion_id]
      );

      res.status(200).json({ tramites });

    } catch (error) {
      console.error("Error:", error);
      res.status(500).json({ error: "Error de servidor" });
    }finally {
      // Cerrar la conexión a la base de datos
      if (connection) {
        await connection.end();
      }
    }
  };

  const obtenerProcedimientos = async (req, res) => {
    let connection;
    try {
       connection = await conectarDBTurnosPrueba();

        const [tramites, fields] = await connection.execute(process.env.QUERY_GET_PROCEDIMIENTOS_CEMA);

        res.status(200).json({ tramites });


    } catch (error) {
        console.error('Error:', error);
        res.status(500).json({ error: 'Error de servidor' });
    }finally {
      // Cerrar la conexión a la base de datos
      if (connection) {
        await connection.end();
      }
    }
};

const obtenerFunciones = async (req, res) => {
  let connection;
  try {
       connection = await conectarDBTurnosPrueba();

        const [funciones, fields] = await connection.execute(process.env.QUERY_GET_FUNCIONES_CEMA);

        res.status(200).json({ funciones });


    } catch (error) {
        console.error('Error:', error);
        res.status(500).json({ error: 'Error de servidor' });
    }finally {
      // Cerrar la conexión a la base de datos
      if (connection) {
        await connection.end();
      }
    }
};


const existeTurno = async (req, res) => {
  let connection;
  try {
      connection = await conectarDBTurnosPrueba();
      const cuil = req.query.cuil;
      const id_tramite = req.query.id_tramite;
  
      let sqlQuery = `CALL api_existeturno(?,?)`;
      const [results, fields] = await connection.execute(sqlQuery, [id_tramite, cuil]);

      res.status(200).json(results[0]);
  
    } catch (error) {
      console.error("Error:", error);
      res.status(500).json({ error: "Error de servidor" });
    }finally {
      // Cerrar la conexión a la base de datos
      if (connection) {
        await connection.end();
      }
    }
  };

  const obtenerTurnosDisponiblesPorDia = async (req, res) => {
    let connection;
    try {
      connection = await conectarDBTurnosPrueba();
      const id_tramite = req.query.id_tramite;
  
      let sqlQuery = `CALL api_obtenerturnospordia(?)`;
      const [results, fields] = await connection.execute(sqlQuery,[id_tramite]);

      res.status(200).json(results[0]);
  
    } catch (error) {
      console.error("Error:", error);
      res.status(500).json({ error: "Error de servidor" });
    }finally {
      // Cerrar la conexión a la base de datos
      if (connection) {
        await connection.end();
      }
    }
  };
  
  const obtenerTurnosDisponiblesPorHora = async (req, res) => {
    let connection;
    try {
      connection = await conectarDBTurnosPrueba();
      const id_tramite = req.query.id_tramite;
      const fecha_solicitada = req.query.fecha_solicitada;
  
      let sqlQuery = `CALL api_obtenerturnosporhora(?, ?)`;
  
      const [results, fields] = await connection.execute(sqlQuery, [id_tramite, fecha_solicitada]);

      res.status(200).json(results[0]);

    } catch (error) {
      console.error("Error:", error);
      res.status(500).json({ error: "Error de servidor" });
    }finally {
      // Cerrar la conexión a la base de datos
      if (connection) {
        await connection.end();
      }
    }
  };

  const transporter = nodemailer.createTransport({
    // host: 'smtp.gmail.com',
    service:"gmail",
    // port: 465,
    // secure: true,
    auth: {
        user: 'no-reply-cdigital@smt.gob.ar',
        pass: process.env.PASSWORD_MAIL
    }
  });

const enviarEmail = (nombre_tramite,fecha,hora, email, res) => {

  const mailOptions = {
    from: 'SMT-Turnos no-reply-cdigital@smt.gob.ar',
    to: email,
    subject: `Turno Confirmado - ${nombre_tramite}`,
    text: `Su turno para el trámite: ${nombre_tramite} fue confirmado para el dia: ${formatFechaEmail(fecha)} a horas: ${hora}`
  };


  transporter.sendMail(mailOptions, (errorEmail, info) => {
    if (errorEmail) {
      // return res.status(500).json({ mge: 'Error al enviar el correo electrónico:', ok: false, error: errorEmail });
      console.log(errorEmail);
    } else {
      // return res.status(200).json({ mge: 'Correo electrónico enviado correctamente:', ok: true });
      console.log('Correo electrónico enviado correctamente');
    }
  });
}


  const confirmarTurno = async (req, res) => {
    let connection;
    try {
       connection = await conectarDBTurnosPrueba();

      const { cuil, id_tramite, apellido, nombre, fecha_solicitada, hora_solicitada, email, nombre_tramite,adicional} = req.body;
  
      let sqlQuery = `SELECT api_confirmarturno(?, ?, ?, ?, ?, ?,?)`;
      const [results, fields] = await connection.execute(sqlQuery, [id_tramite, cuil, apellido, nombre, fecha_solicitada, hora_solicitada,adicional]);
  
      if(Object.values(results[0])[0] == 1){
        enviarEmail(nombre_tramite,fecha_solicitada,hora_solicitada,email,res);
      }

      res.status(200).json(results[0]);
    } catch (error) {
      console.error("Error:", error);
      res.status(500).json({ error: "Error de servidor" });
    }finally {
      // Cerrar la conexión a la base de datos
      if (connection) {
        await connection.end();
      }
    }
  };

  const anularTurno = async (req, res) => {
    let connection;
    try {
      connection = await conectarDBTurnosPrueba();
      const cuil = req.query.cuil;
      const id_tramite = req.query.id_tramite;
  
      let sqlQuery = `SELECT api_anularturno(?, ?)`;
      const [results, fields] = await connection.execute(sqlQuery, [id_tramite, cuil]);

      res.status(200).json(results[0]);

    } catch (error) {
      console.error("Error:", error);
      res.status(500).json({ error: "Error de servidor" });
    }finally {
      // Cerrar la conexión a la base de datos
      if (connection) {
        await connection.end();
      }
    }
  };

  const confirmarTurnoFichaMedica = async (req, res) => {
    let connection;
    try {
       connection = await conectarDBTurnosPrueba();

      const { cuil, id_tramite, apellido, nombre, fecha_solicitada, hora_solicitada, email, nombre_tramite,adicional, cantidadDePersonas} = req.body;
  
      let sqlQuery = `SELECT api_confirmarturnos_fichamedica(?, ?, ?, ?, ?, ?,?,?)`;
      const [results, fields] = await connection.execute(sqlQuery, [id_tramite, cuil, apellido, nombre, fecha_solicitada, hora_solicitada,adicional,cantidadDePersonas]);
  
      if(Object.values(results[0])[0] == 1){
        enviarEmail(nombre_tramite,fecha_solicitada,hora_solicitada,email,res);
      }

      res.status(200).json(results[0]);
    } catch (error) {
      console.error("Error:", error);
      res.status(500).json({ error: "Error de servidor" });
    }finally {
      // Cerrar la conexión a la base de datos
      if (connection) {
        await connection.end();
      }
    }
  };

  const anularTurnoFichaMedica = async (req, res) => {
    let connection;
    try {
      connection = await conectarDBTurnosPrueba();
      const cuil = req.query.cuil;
      const id_tramite = req.query.id_tramite;
  
      let sqlQuery = `SELECT api_anularturno_fichamedica(?, ?)`;
      const [results, fields] = await connection.execute(sqlQuery, [id_tramite, cuil]);

      res.status(200).json(results[0]);

    } catch (error) {
      console.error("Error:", error);
      res.status(500).json({ error: "Error de servidor" });
    }finally {
      // Cerrar la conexión a la base de datos
      if (connection) {
        await connection.end();
      }
    }
  };
  

  module.exports = {obtenerTramites, obtenerProcedimientos,obtenerFunciones, existeTurno, obtenerTurnosDisponiblesPorDia, obtenerTurnosDisponiblesPorHora, confirmarTurno, anularTurno, confirmarTurnoFichaMedica, anularTurnoFichaMedica}