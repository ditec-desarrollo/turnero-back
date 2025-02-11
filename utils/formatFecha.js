const formatDate = (fechaEnFormatoDate) => {

    const fecha = new Date(fechaEnFormatoDate);
    const fechaFormateada = fecha.toLocaleDateString('es-AR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    });

    return fechaFormateada;
}

const formatDateOrder = (fechaString)=>{

const [anio, mes, dia] = fechaString.split("-");
const fechaFormateada = `${dia}/${mes}/${anio}`;

return fechaFormateada

}


module.exports = {formatDate,formatDateOrder}