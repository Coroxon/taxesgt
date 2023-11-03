var dynamicTextElementnombre = document.getElementById("dynamicTextnombre");
var dynamicTextElementingreso = document.getElementById("dynamicTextingreso");
var dynamicTextElementegreso = document.getElementById("dynamicTextegreso");
var dynamicTextElementingreso1 = document.getElementById("dynamicTextingreso1");
var dynamicTextElementegreso1 = document.getElementById("dynamicTextegreso1");
var dynamicTextElementnegativo = document.getElementById("dynamicTextnegativo");
var dynamicTextElementpositivo = document.getElementById("dynamicTextpositivo");
var dynamicTextElementimpuesto = document.getElementById("dynamicTextimpuesto");
var dynamicTextElementtipo = document.getElementById("dynamicTexttipo");

let cliente = []
let ingresos = []
let egresos = []
let ingresototal;
let egresototal;
// Recupera los datos de localStorage
const datosClienteString = localStorage.getItem('datosCliente');

// Convierte de nuevo a un objeto JavaScript
if (datosClienteString) {
    const datosCliente = JSON.parse(datosClienteString);
    
    // Usa los datos como desees
    // Por ejemplo, para acceder a data.nombre_comercial
    console.log(datosCliente)
    cliente = datosCliente
    dynamicTextElementnombre.textContent = datosCliente.nombre_comercial;

    // Limpia los datos guardados en localStorage
    //localStorage.removeItem('datosCliente');
}

// Función para mostrar el popup
function mostrarPopup() {
    document.getElementById('miPopup').style.display = 'block';
    dynamicTextElement.textContent = "Nuevo Movimiento";
}

// Función para cerrar el popup
function cerrarPopup() {
    document.getElementById('miPopup').style.display = 'none';
    formmovimiento.reset();
}

document.addEventListener('DOMContentLoaded', async () => {
    // Coloca aquí la lógica para obtener el ID del cliente
    let id = cliente.id; // Suponiendo que ya tienes la variable cliente.id definida

    // Llama a la función para obtener los movimientos del cliente una vez que se haya cargado la página
    await obtenermovimientocliente(id);
    await obteneregresoscliente(id);
    await obteneringresoscliente(id);
    await obteneregresostotalcliente(id)
    await obteneringresostotalcliente(id)

    let balance = parseInt(ingresototal.total_monto) - parseInt(egresototal.total_monto);
    if (balance > 0) {
        // Si el balance es positivo
        dynamicTextElementpositivo.textContent = `${balance}`;
        dynamicTextElementnegativo.textContent = ''; // Borra el contenido anterior
    } else if (balance < 0) {
        // Si el balance es negativo
        dynamicTextElementnegativo.textContent = `${balance}`;
        dynamicTextElementpositivo.textContent = ''; // Borra el contenido anterior
    } else {
        // Si el balance es cero
        dynamicTextElementpositivo.textContent = 'El balance es cero';
        dynamicTextElementnegativo.textContent = ''; // Borra el contenido anterior
    }

    let porcentaje = 0;

    if (cliente.id_tipo_cliente === 3) {
        porcentaje = 0.05; // 5%
    } else if (cliente.id_tipo_cliente === 2) {
        porcentaje = 0.04; // 4%
    }
    if (porcentaje !== 0) {
        balance *= porcentaje;
        dynamicTextElementimpuesto.textContent = `${impuesto}`;
    } else {
        dynamicTextElementimpuesto.textContent = '';
    }

    switch (cliente.id_tipo_cliente) {
        case 1:
            dynamicTextElementtipo.textContent = 'Caja chica';
            break;
        case 2:
            dynamicTextElementtipo.textContent = 'Contribuyente digital';
            break;
        case 3:
            dynamicTextElementtipo.textContent = 'Contribuyente normal';
            break;
        default:
            dynamicTextElementtipo.textContent = '';
            break;
    }
});



async function obtenermovimientocliente(id) {
    const response = await fetch(`/api/movimientos/${id}`);
    const data = await response.json();
    movimientos = data;
    // Luego puedes hacer uso de la variable lineascobro o realizar alguna acción con los datos recibidos.
    //rendermovimiento(movimientos);
    console.log(movimientos)
}
async function obteneringresoscliente(id) {
    const response = await fetch(`/api/movimientosingreso/${id}`);
    const data = await response.json();
    ingresos = data;
    // Luego puedes hacer uso de la variable lineascobro o realizar alguna acción con los datos recibidos.
    renderingresos(ingresos)
    console.log(ingresos)
}

async function obteneregresoscliente(id) {
    const response = await fetch(`/api/movimientosegreso/${id}`);
    const data = await response.json();
    egresos = data;
    renderegresos(egresos)
    // Luego puedes hacer uso de la variable lineascobro o realizar alguna acción con los datos recibidos.
    console.log(egresos)
}
async function obteneregresostotalcliente(id) {
    const response = await fetch(`/api/movimientosegresostotal/${id}`);
    const data = await response.json();
    egresototal = data;
    dynamicTextElementegreso.textContent = egresototal.total_monto;
    dynamicTextElementegreso1.textContent = egresototal.total_monto;
    // Luego puedes hacer uso de la variable lineascobro o realizar alguna acción con los datos recibidos.
    console.log(egresototal)
}
async function obteneringresostotalcliente(id) {
    const response = await fetch(`/api/movimientosingresostotal/${id}`);
    const data = await response.json();
    ingresototal = data;
    dynamicTextElementingreso.textContent = ingresototal.total_monto;
    dynamicTextElementingreso1.textContent = ingresototal.total_monto;
    // Luego puedes hacer uso de la variable lineascobro o realizar alguna acción con los datos recibidos.
    console.log(ingresototal)
}


function renderingresos(ingresos){
    const ingresoslista = document.querySelector('#ingresoslista');
    ingresoslista.innerHTML = '';

    ingresos.forEach(ingreso => {
        const ingresoItem = document.createElement('li');
        
        ingresoItem.classList = 'list-group-item my-2' ;

        ingresoItem.innerHTML = `
        <div style="display: flex; justify-content: space-between;">
            <label style="font-weight: bold;" class="cliente-item">${ingreso.cuenta}</label>
            <label style="font-weight: bold;" class="cliente-item">${ingreso.monto}</label>
        </div>
        `;
        ingresoslista.appendChild(ingresoItem);        
    });

}
function renderegresos(egresos){
    const egresoslista = document.querySelector('#egresoslista');
    egresoslista.innerHTML = '';

    egresos.forEach(egreso => {
        const egresoItem = document.createElement('li');
        
        egresoItem.classList = 'list-group-item my-2' ;

        egresoItem.innerHTML = `
        <div style="display: flex; justify-content: space-between;">
            <label style="font-weight: bold;" class="cliente-item">${egreso.cuenta}</label>
            <label style="font-weight: bold;" class="cliente-item">${egreso.monto}</label>
        </div>
        `;
        egresoslista.appendChild(egresoItem);        
    });

}