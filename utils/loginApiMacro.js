const dotenv = require("dotenv");
dotenv.config();

const authMacroApi = async () => {
    try {
        const response = await fetch(
            "https://preprod.smt.ciudadana.ar/api/auth/login",
            {
              method: "POST",
              headers: {
                "x-api-key": process.env.HEADERS_API_KEY_MACRO,
                "Content-Type": "application/json",
              },
              body: JSON.stringify({
                identifier: process.env.IDENTIFIER_API_KEY_MACRO,
                password: process.env.PASSWORD_API_KEY_MACRO,
                tenantID: process.env.TENANT_ID_API_KEY_MACRO,
              }),
            }
          );
        
          if (!response.ok) {
            throw new Error(
              `Error en el logueo a API notificaciones: ${response.statusText}`
            );
          }
        
          const data = await response.json();
          return data;
    } catch (error) {
        console.log(error);
        return false;
    }
}

module.exports = {authMacroApi}