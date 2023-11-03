const formmovimiento = document.querySelector('#formmovimiento')
var dynamicTextElement = document.getElementById("dynamicText");
var dynamicTextElementnombre = document.getElementById("dynamicTextnombre");
let cliente = []
let ingresos = []
let egresos = []
let movimientos = []
let editar = false;
let movimientoId = null;
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
});

async function obtenermovimientocliente(id) {
    const response = await fetch(`/api/movimientos/${id}`);
    const data = await response.json();
    movimientos = data;
    // Luego puedes hacer uso de la variable lineascobro o realizar alguna acción con los datos recibidos.
    rendermovimiento(movimientos);
    console.log(movimientos)
}
async function obteneringresoscliente(id) {
    const response = await fetch(`/api/movimientosingreso/${id}`);
    const data = await response.json();
    ingresos = data;
    // Luego puedes hacer uso de la variable lineascobro o realizar alguna acción con los datos recibidos.
    console.log(ingresos)
}

async function obteneregresoscliente(id) {
    const response = await fetch(`/api/movimientosegreso/${id}`);
    const data = await response.json();
    egresos = data;
    // Luego puedes hacer uso de la variable lineascobro o realizar alguna acción con los datos recibidos.
    console.log(egresos)
}


formmovimiento.addEventListener('submit', async e => {
    e.preventDefault()

    const referencia = formmovimiento['referencia'].value
    const numero = formmovimiento['numero'].value
    const proveedor = formmovimiento['proveedor'].value
    const cuenta = formmovimiento['cuenta'].value
    const responsable = formmovimiento['responsable'].value
    const monto = formmovimiento['monto'].value
    const fecha_emision = formmovimiento['fechaemision'].value
    const id_tipo_movimiento = parseInt(formmovimiento['tp_mov'].value, 10)
    const id_cliente = cliente.id

    if(!editar){
        const response = await fetch('/api/movimientos',{
            method: 'POST',
            headers: {
            'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                referencia,
                numero,
                proveedor,
                cuenta,
                responsable,
                monto,
                fecha_emision,
                id_tipo_movimiento,
                id_cliente,
            }),
        });
        const data = await response.json()
        movimientos.push(data);
        rendermovimiento(movimientos);

    } else {
        const response = await fetch(`/api/movimientos/${movimientoId}`,{
            method: 'PUT',
            headers: {
            'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                referencia,
                numero,
                proveedor,
                cuenta,
                responsable,
                monto,
                fecha_emision,
                id_tipo_movimiento,
                id_cliente: cliente.id,
            }),
        });
        const updmovimiento = await response.json()
        movimientos = movimientos.map((movimiento) => movimiento.id === updmovimiento[0].id ? updmovimiento[0] : movimiento);
        rendermovimiento(movimientos);
        editar = false;
        movimientoId = null;
    }
    
    cerrarPopup();
    formmovimiento.reset()

});

function rendermovimiento(movimientos){
    const movimientolista = document.querySelector('#movimientolista');
    movimientolista.innerHTML = '';

    movimientos.forEach(movimiento => {
        const movimientoItem = document.createElement('li');
        let colorFondo = '';

        if (movimiento.id_tipo_movimiento === 1) {
            colorFondo = 'lightgreen'; // Establece un fondo verde claro si el tipo es 1
        } else if (movimiento.id_tipo_movimiento === 2) {
            colorFondo = 'lightcoral'; // Establece un fondo rojo claro si el tipo es 2
        } else {
            colorFondo = ''; // Color predeterminado o lógica adicional si es necesario
        }
        movimientoItem.classList = 'list-group-item my-2' ;
        movimientoItem.style.backgroundColor = colorFondo;
        let tipoTexto = '';
        switch (movimiento.id_tipo_movimiento) {
          case 1:
            tipoTexto = 'Ingreso';
            break;
          case 2:
            tipoTexto = 'Egreso';
            break;
          default:
            tipoTexto = 'Valor Desconocido';
        }
        const fechaOriginal = new Date(movimiento.fecha_emision);
        const año = fechaOriginal.getFullYear();
        const mes = (fechaOriginal.getMonth() + 1).toString().padStart(2, '0');
        const dia = fechaOriginal.getDate().toString().padStart(2, '0');
        const fechaFormateada = `${dia}-${mes}-${año}`;

        movimientoItem.innerHTML = `
        <label class="cliente-item">${fechaFormateada}</label>
        <label class="cliente-item">${movimiento.numero}</label>
        <label class="cliente-item">${movimiento.referencia}</label>
        <label class="cliente-item">${movimiento.monto}</label>
        <button class="btn-mov"><i class="fa-solid fa-folder-plus" style="color: #021b45;"></i></button>
        <button class="btn-edit"><i class="fa-solid fa-pen-to-square" style="color: #06204b;"></i></i></button>
        `;
        movimientolista.appendChild(movimientoItem);

        
        

        const btnEdit = movimientoItem.querySelector('.btn-edit')

        btnEdit.addEventListener('click', async (e) => {
            const response = await fetch(`/api/movimientos1/${movimiento.id}`);
            const data = await response.json();
            console.log(data);
            mostrarPopup();
            dynamicTextElement.textContent = data.numero;
            console.log(data.numero)
            var foriginal = new Date(data.fecha_emision);
            var año = foriginal.getFullYear();
            var mes = (foriginal.getMonth() + 1).toString().padStart(2, '0'); // Agrega ceros al mes si es necesario
            var dia = foriginal.getDate().toString().padStart(2, '0'); // Agrega ceros al día si es necesario
            var fcorrecto = `${año}-${mes}-${dia}`;
            formmovimiento['referencia'].value = data.referencia;
            formmovimiento['numero'].value = data.numero;
            formmovimiento['proveedor'].value = data.proveedor;
            formmovimiento['cuenta'].value = data.cuenta;
            formmovimiento['responsable'].value = data.responsable;
            formmovimiento['monto'].value = data.monto;
            formmovimiento['fechaemision'].value = fcorrecto
            formmovimiento['tp_mov'].value = data.id_tipo_movimiento;
            editar = true;
            movimientoId = data.id;
        });
        
    });

}