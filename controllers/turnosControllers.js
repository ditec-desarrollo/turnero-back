const { conectarDBTurnosPrueba, conectarDBTurnos } = require("../config/dbTurnosMYSQL");
const nodemailer = require('nodemailer');
const { formatFechaEmail } = require("../utils/helpers");
const { authMacroApi } = require("../utils/loginApiMacro");
const { formatDate, formatDateOrder } = require("../utils/formatFecha");

const obtenerTramites = async (req, res) => {
  let connection;
  try {
    connection = await conectarDBTurnosPrueba();
    const reparticion_id = req.query.reparticion_id;

    let query = `
      SELECT idtramite, nombre_tramite, reparticion_id, observaciones, adicionalrequerido
      FROM tramite
      WHERE habilitado = 1
    `;
    let params = [];

    if (reparticion_id!=0) {
      query += " AND reparticion_id = ?";
      params.push(reparticion_id);
    }

    const [tramites] = await connection.execute(query, params);

    res.status(200).json({ tramites });

  } catch (error) {
    console.error("Error:", error);
    res.status(500).json({ error: "Error de servidor" });
  } finally {
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

      let sqlQueryExisteTurno = `CALL api_existeturno(?,?)`;
      const [resultsExisteTurno, fieldsExisteTurno] = await connection.execute(sqlQueryExisteTurno, [id_tramite, cuil]);

      if(resultsExisteTurno[0][0]['0'] == 0){

        let sqlQuery = `SELECT api_confirmarturno(?, ?, ?, ?, ?, ?,?)`;
        const [results, fields] = await connection.execute(sqlQuery, [id_tramite, cuil, apellido, nombre, fecha_solicitada, hora_solicitada,adicional]);
    
        if(Object.values(results[0])[0] == 1){
          enviarEmail(nombre_tramite,fecha_solicitada,hora_solicitada,email,res);

          const data = await authMacroApi();
          let jwtToken = data.jwtToken || null;
  
          if (jwtToken) {
            const resp = await fetch(
              process.env.URL_NOTIFICACIONES_MACRO,
              {
                method: "POST",
                headers: {
                  "Content-Type": "application/json",
                  "X-API-KEY": "6b1985a2-c7a0-5564-d8d1-22cc948c3986",
                  Authorization: `Bearer ${jwtToken}`,
                  // host: "preprod.smt.ciudadana.ar",
                },
                body: JSON.stringify({
                  notificationId: "NOTI-CIUDADANA-SMT",
                  channels: ["EMAIL", "PUSH"],
                  addressType: "CUIL", //CUIL, DOC, MAIL, PHONE
                  addressTos: [
                    cuil, //Datos correspondiente al addressType
                    // "nanomartinezbm@gmail.com"
                    // "mondongo@gmail.com"
                  ],
                  title: "Turno para LICENCIA DE CONDUCIR reservado con éxito!", // PUSH: hasta 40 Carácteres, MAIL: hasta 60 caracteres
                  // description: `Tu turno fue agendado para el ${fecha_solicitada} a las ${hora_solicitada}`, 
                  description: `Tu turno fue agendado para el ${formatDateOrder(fecha_solicitada)} a las ${hora_solicitada}`,
                  // PUSH: hasta 240 Carácteres, MAIL: sin restricciones
                  //Dado que en una misma llamada se puede enviar por PUSH y MAIL, ejecutar el contenido a lo sugerido para PUSH
                }),
              }
            );
          }

        }
  
        res.status(200).json(results[0]);


      }else{

        res.status(400).json({message:"usted ya tiene turno confirmado"});
      }
  

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

      let sqlQueryExisteTurno = `CALL api_existeturno(?,?)`;
      const [resultsExisteTurno, fieldsExisteTurno] = await connection.execute(sqlQueryExisteTurno, [id_tramite, cuil]);

      if (resultsExisteTurno[0][0]['0'] != 0) {

        let sqlQuery = `SELECT api_anularturno(?, ?)`;
        const [results, fields] = await connection.execute(sqlQuery, [id_tramite, cuil]);

        const data = await authMacroApi();
        
        let jwtToken = data.jwtToken || null;

        if (jwtToken) {
          const resp = await fetch(
            process.env.URL_NOTIFICACIONES_MACRO,
            {
              method: "POST",
              headers: {
                "Content-Type": "application/json",
                "X-API-KEY": "6b1985a2-c7a0-5564-d8d1-22cc948c3986",
                Authorization: `Bearer ${jwtToken}`,
                // host: "preprod.smt.ciudadana.ar",
              },
              body: JSON.stringify({
                notificationId: "NOTI-CIUDADANA-SMT",
                channels: ["EMAIL", "PUSH"],
                addressType: "CUIL", //CUIL, DOC, MAIL, PHONE
                addressTos: [
                  cuil, //Datos correspondiente al addressType
                  // "nanomartinezbm@gmail.com"
                  // "mondongo@gmail.com"
                ],
                title: "Turno para LICENCIA DE CONDUCIR cancelado con éxito!", // PUSH: hasta 40 Carácteres, MAIL: hasta 60 caracteres
                // description: `Tu turno fue agendado para el ${fecha_solicitada} a las ${hora_solicitada}`, 
                description: `El turno en fecha ${formatDate(resultsExisteTurno[0][0].dia_turno)} y hora ${resultsExisteTurno[0][0].hora_turno} para ${resultsExisteTurno[0][0].nombre} fue cancelado con éxito`,
                // PUSH: hasta 240 Carácteres, MAIL: sin restricciones
                //Dado que en una misma llamada se puede enviar por PUSH y MAIL, ejecutar el contenido a lo sugerido para PUSH
              }),
            }
          );
        }
  
        res.status(200).json(results[0]);

      }else{

        res.status(400).json({message:"usted no tiene turnos para cancelar"});
      }
  
     

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

      let sqlQueryExisteTurno = `CALL api_existeturno(?,?)`;
      const [resultsExisteTurno, fieldsExisteTurno] = await connection.execute(sqlQueryExisteTurno, [id_tramite, cuil]);

      if(resultsExisteTurno[0][0]['0'] == 0){

        let sqlQuery = `SELECT api_confirmarturnos_fichamedica(?, ?, ?, ?, ?, ?,?,?)`;
        const [results, fields] = await connection.execute(sqlQuery, [id_tramite, cuil, apellido, nombre, fecha_solicitada, hora_solicitada,adicional,cantidadDePersonas]);
    
        if(Object.values(results[0])[0] == 1){
          enviarEmail(nombre_tramite,fecha_solicitada,hora_solicitada,email,res);
       

        const data = await authMacroApi();
        let jwtToken = data.jwtToken || null;

        if (jwtToken) {
          const resp = await fetch(
            process.env.URL_NOTIFICACIONES_MACRO,
            {
              method: "POST",
              headers: {
                "Content-Type": "application/json",
                "X-API-KEY": "6b1985a2-c7a0-5564-d8d1-22cc948c3986",
                Authorization: `Bearer ${jwtToken}`,
                // host: "preprod.smt.ciudadana.ar",
              },
              body: JSON.stringify({
                notificationId: "NOTI-CIUDADANA-SMT",
                channels: ["EMAIL", "PUSH"],
                addressType: "CUIL", //CUIL, DOC, MAIL, PHONE
                addressTos: [
                  cuil, //Datos correspondiente al addressType
                  // "nanomartinezbm@gmail.com"
                  // "mondongo@gmail.com"
                ],
                title: "Turno para FICHA MEDICA reservado con éxito!", // PUSH: hasta 40 Carácteres, MAIL: hasta 60 caracteres
                // description: `Tu turno fue agendado para el ${fecha_solicitada} a las ${hora_solicitada}`, 
                description: `Tu turno fue agendado para el ${formatDateOrder(fecha_solicitada)} a las ${hora_solicitada}`,
                // PUSH: hasta 240 Carácteres, MAIL: sin restricciones
                //Dado que en una misma llamada se puede enviar por PUSH y MAIL, ejecutar el contenido a lo sugerido para PUSH
              }),
            }
          );
        }
      }
        res.status(200).json(results[0]);

      }else{

        res.status(400).json({message:"usted ya tiene turno confirmado"});
      }
  
  
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
      
            let sqlQueryExisteTurno = `CALL api_existeturno(?,?)`;
            const [resultsExisteTurno, fieldsExisteTurno] = await connection.execute(sqlQueryExisteTurno, [id_tramite, cuil]);
      
      if (resultsExisteTurno[0][0]['0'] != 0) {

        let sqlQuery = `SELECT api_anularturno_fichamedica(?, ?)`;
        const [results, fields] = await connection.execute(sqlQuery, [id_tramite, cuil]);

        const data = await authMacroApi();
        
        let jwtToken = data.jwtToken || null;

        if (jwtToken) {
          const resp = await fetch(
            process.env.URL_NOTIFICACIONES_MACRO,
            {
              method: "POST",
              headers: {
                "Content-Type": "application/json",
                "X-API-KEY": "6b1985a2-c7a0-5564-d8d1-22cc948c3986",
                Authorization: `Bearer ${jwtToken}`,
                // host: "preprod.smt.ciudadana.ar",
              },
              body: JSON.stringify({
                notificationId: "NOTI-CIUDADANA-SMT",
                channels: ["EMAIL", "PUSH"],
                addressType: "CUIL", //CUIL, DOC, MAIL, PHONE
                addressTos: [
                  cuil, //Datos correspondiente al addressType
                  // "nanomartinezbm@gmail.com"
                  // "mondongo@gmail.com"
                ],
                title: "Turno para FICHA MEDICA cancelado con éxito!", // PUSH: hasta 40 Carácteres, MAIL: hasta 60 caracteres
                // description: `Tu turno fue agendado para el ${fecha_solicitada} a las ${hora_solicitada}`, 
                description: `El turno en fecha ${formatDate(resultsExisteTurno[0][0].dia_turno)} y hora ${resultsExisteTurno[0][0].hora_turno} para ${resultsExisteTurno[0][0].nombre} fue cancelado con éxito`,
                // PUSH: hasta 240 Carácteres, MAIL: sin restricciones
                //Dado que en una misma llamada se puede enviar por PUSH y MAIL, ejecutar el contenido a lo sugerido para PUSH
              }),
            }
          );
        }

        res.status(200).json(results[0]);
      }else{

        res.status(400).json({message:"usted no tiene turnos para cancelar"});
      }

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

 
  const obtenerPerfilPorCuil = async (req, res) => { 
    const { cuil } = req.params;
    const connection = await conectarDBTurnos();

    try {
        // Obtener el usuario_id y perfil_id correspondiente al cuil
        const [usuarios] = await connection.execute(
            'SELECT id, perfil_id,reparticion_id FROM usuarios WHERE cuil = ?',
            [cuil]
        );

        if (usuarios.length === 0) {
            return res.status(200).json({ message: 'Usuario no encontrado' ,ok:false});
        }

        const usuario = usuarios[0]; // Obtén el usuario con usuario_id y perfil_id

        // Obtener la fila completa del perfil correspondiente al perfil_id
        const [perfiles] = await connection.execute(
            'SELECT * FROM perfiles_menues WHERE perfil_id = ?',
            [usuario.perfil_id]
        );

        if (perfiles.length === 0) {
            return res.status(200).json({ message: 'Perfil no encontrado' ,ok:false});
        }

        // Agregar usuario_id a cada perfil en el array
        const perfilesConUsuario = perfiles.map(perfil => ({
            ...perfil,  
            usuario_id: usuario.id,
           reparticion_id:usuario.reparticion_id
        }));

        res.status(200).json(  {permisos:perfilesConUsuario,ok:true});
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: error.message || 'Algo salió mal :(' });
    } finally {
        await connection.end();
    }
};


const obtenerTipoTramite = async (req, res) => {
  let connection;
  try {
      connection = await conectarDBTurnos();
        const reparticion_id = req.params.reparticion_id;
  
      const [tipotramite, fields] = await connection.execute(
        " SELECT * FROM tipotramite WHERE reparticion_id = ? AND habilita = 1 ",[reparticion_id]
      );

      res.status(200).json({ tipotramite });

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

  const obtenerTurnosAsignados= async (req, res) => {
    let connection;
    try {
        connection = await conectarDBTurnos();
          const id = req.query.tipoTramite;
          const fecha= req.query.fecha
    
        const [turnosAsignados , fields] = await connection.execute(
          "SELECT idturno,hora_turno,dni,apellido,nombre,datoadicional FROM turno WHERE idtramite= ? AND dia_turno= ? AND not(fecha_solicitud IS NULL) ORDER BY dia_turno ",[id,fecha]
        );
  
        res.status(200).json({turnosAsignados });
  
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


    const liberarTurno= async (req, res) => {
      let connection;
      try {
          connection = await conectarDBTurnos();
            const usuario = req.query.usuario;
            const turno= req.query.idturno
      
          const [turnolib , fields] = await connection.execute(
            "UPDATE turno SET idestado=0,dni=NULL,apellido=NULL,nombre=NULL,datoadicional=NULL,fecha_solicitud=NULL,idusuario= ? WHERE idturno= ? ",[usuario,turno]
          );
    
          res.status(200).json({message:"Turno Liberado" });
    
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



  module.exports = {obtenerTramites, obtenerProcedimientos,obtenerFunciones, existeTurno, obtenerTurnosDisponiblesPorDia, obtenerTurnosDisponiblesPorHora, confirmarTurno, anularTurno, confirmarTurnoFichaMedica, anularTurnoFichaMedica,obtenerPerfilPorCuil,obtenerTipoTramite,obtenerTurnosAsignados,liberarTurno}