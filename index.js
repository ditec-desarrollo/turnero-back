const express = require("express");
const dotenv = require("dotenv");
const cors = require("cors");
const morgan = require("morgan");
const connectDB = require("./config/dbUsuariosMongoDB");
const bodyParser = require('body-parser');
const https = require('https');
const fs = require('fs');
const app = express();

app.use(cors());
dotenv.config();
// connectDB();
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json({ limit: '20mb' }));

const usuariosRoutes = require("./routes/usuariosRoutes");
const turnosRoutes = require("./routes/turnosRoutes");

const PORT = process.env.PORT;

app.use(morgan("dev"));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use('/usuarios', usuariosRoutes)
app.use("/turnos", turnosRoutes);

// const options = {
//     key: fs.readFileSync('/opt/psa/var/certificates/scfx0vp99'),
//     cert: fs.readFileSync('/opt/psa/var/certificates/scfx0vp99'),
//     //ca: fs.readFileSync('/opt/psa/var/certificates/scfqdiDyQ') // si tienes un archivo CA bundle
//   };
  
//   https.createServer(options, app).listen(7772, () => {
//     console.log(`server listening on port 7772`);
//   });

  app.listen(3050, () => {
    console.log(`server listening on port 3050`);
  });
