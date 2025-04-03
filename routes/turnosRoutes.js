const { Router } = require("express");
const auth = require("../middlewares/auth");
const verifyRole = require("../middlewares/verifyRole");
const { obtenerTramites, obtenerProcedimientos, obtenerFunciones, existeTurno, obtenerTurnosDisponiblesPorDia, obtenerTurnosDisponiblesPorHora, confirmarTurno, anularTurno, confirmarTurnoFichaMedica, anularTurnoFichaMedica, obtenerPerfilPorCuil, obtenerTipoTramite, obtenerTurnosAsignados, liberarTurno } = require("../controllers/turnosControllers");
const router = Router();

router.get("/listarTramites",auth, obtenerTramites);
router.get("/listarProcedimientos",auth, obtenerProcedimientos);
router.get("/listarFunciones",auth, obtenerFunciones);
router.get("/existeTurno",auth, existeTurno);
router.post("/confirmarTurno",auth, confirmarTurno)
router.get("/anularTurno",auth, anularTurno)
router.get("/buscarTurnosDisponiblesPorDia",auth, obtenerTurnosDisponiblesPorDia)
router.get("/buscarTurnosDisponiblesPorHora",auth, obtenerTurnosDisponiblesPorHora)

router.post("/confirmarTurnoFichaMedica",auth, confirmarTurnoFichaMedica)
router.get("/anularTurnoFichaMedica",auth, anularTurnoFichaMedica)
router.get('/perfil/:cuil', obtenerPerfilPorCuil);
router.get("/listarTipoTramite/:reparticion_id",auth, obtenerTipoTramite);
router.get("/listarTurnosAsignados",auth, obtenerTurnosAsignados);
router.put("/liberarTurno",auth, liberarTurno)

module.exports = router;
