const { Router } = require("express");
const auth = require("../middlewares/auth");
const validateFields = require("../middlewares/validateFields");
const { check } = require("express-validator");

const {getAuthStatus} = require("../controllers/usuariosControllers");

const verifyRole = require("../middlewares/verifyRole");

const router = Router();

router.get("/authStatus", auth, getAuthStatus);


module.exports = router;
