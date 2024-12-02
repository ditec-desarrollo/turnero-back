const multer = require('multer');
const path = require('path');

// Configurar el almacenamiento de los archivos
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, './uploads/'); // Directorio donde se almacenarán los archivos
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + path.extname(file.originalname)); // Nombrar los archivos con un timestamp
  },
});

// Inicializar multer
const upload = multer({ storage: storage });
