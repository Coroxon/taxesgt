const formcobro = document.querySelector('#formcobro');
const formlineacobro = document.querySelector('#formlineacobro');
var dynamicTextElement = document.getElementById("dynamicText");
var dynamicTextElement1 = document.getElementById("dynamicText1");

let cobros = [];
let lineascobro = [];
let clientes = [];
let productos = [];
let editar = false;
let editar1 = false;
let cobroId = null;
let lineacobroId = null;
let clienteEncontrado;
let productoEncontrado;
let actcobro
var textoAntes = "Detalle Cobro  ";

// Función para mostrar el popup
function mostrarPopup1() {
    document.getElementById('miPopup').style.display = 'block';
    dynamicTextElement1.textContent = textoAntes + dynamicTextElement1.textContent;
}
// Función para cerrar el popup
function cerrarPopup1() {
    document.getElementById('miPopup').style.display = 'none';
    dynamicTextElement1.textContent = null;
    actualizarcobromonto(actcobro);
    //formproducto.reset();
}

// Función para mostrar el popup
function mostrarPopup() {
    document.getElementById('miPopup2').style.display = 'block';
    dynamicTextElement.textContent = "Nuevo Cobro";
}
// Función para cerrar el popup
function cerrarPopup() {
    document.getElementById('miPopup2').style.display = 'none';
    //formproducto.reset();
}

window.addEventListener('DOMContentLoaded', async () => {
    const response = await fetch("/api/cobros");
    const data = await response.json();
    cobros = data;
    rendercobro(cobros);
    console.log(cobros);
});

window.addEventListener('DOMContentLoaded', async () => {
    const response = await fetch("/api/clientes");
    const data = await response.json();
    clientes = data;
    console.log(clientes);
});

window.addEventListener('DOMContentLoaded', async () => {
    const response = await fetch("/api/productos");
    const data = await response.json();
    productos = data;
    console.log(productos);
}); 

function buscarClientePorNIT() {
    const nitCUIInput = formcobro['nit/cui'].value;

    clienteEncontrado = clientes.find(cliente => cliente.nit === nitCUIInput);

    if (clienteEncontrado) {

        formcobro['nombre'].value = clienteEncontrado.nombre_comercial;
        formcobro['direccion'].value = clienteEncontrado.direccion;
        formcobro['telefono'].value = clienteEncontrado.telefono;
    } else {
        
    }
}

const numeroInput = formcobro['nit/cui'];

// Evento keyup (cuando se suelta una tecla)
numeroInput.addEventListener('keyup', () => {
    // Llamar a la función buscarClientePorNIT
    buscarClientePorNIT();
});

// Evento change (cuando se sale del campo o cambia su valor)
numeroInput.addEventListener('change', () => {
    // Llamar a la función buscarClientePorNIT
    buscarClientePorNIT();
});

formcobro.addEventListener('submit', async (e) => {
    e.preventDefault()
    const numero = formcobro['numero'].value
    const fecha_emision = formcobro['emision'].value
    const monto = formcobro['total'].value
    const id_tipo_documento = parseInt(formcobro['tp_doc'].value, 10)
    const id_cliente = clienteEncontrado.id
    console.log(clienteEncontrado.id)

    if (!editar) {
        const response = await fetch('/api/cobros', {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({
                numero,
                fecha_emision,
                id_tipo_documento,
                id_cliente,
            }),
        });

        const data = await response.json();
        cobros.push(data);
        actcobro = data.id;
        console.log(actcobro);
        rendercobro(cobros);
        dynamicTextElement1.textContent = data.numero;
        mostrarPopup1();
    } else {
        const response = await fetch(`/api/cobros/${cobroId}`, {
            method: "PUT",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({
                numero,
                fecha_emision,
                monto,
                id_tipo_documento,
                id_cliente,
            }),
        });
        const updcobro = await response.json();
        cobros = cobros.map((cobro) => cobro.id === updcobro[0].id ? updcobro[0] : cobro);
        rendercobro(cobros);
        editar = false;
        productoId = null;

    }

    cerrarPopup();
    formcobro.reset();

});

function rendercobro(cobros) {
    const cobroslista = document.querySelector('#cobroslista');
    cobroslista.innerHTML = '';

    cobros.forEach((cobro) => {
        const cobroItem = document.createElement('li');
        cobroItem.classList = 'list-group-item my-2';
        let tipoTexto = '';
        switch (cobro.id_tipo_documento) {
            case 1:
                tipoTexto = 'Recibo';
                break;
            case 2:
                tipoTexto = 'Factura';
                break;
            default:
                tipoTexto = 'Valor Desconocido';
        }
        const fechaOriginal = new Date(cobro.fecha_emision);
        const año = fechaOriginal.getFullYear();
        const mes = (fechaOriginal.getMonth() + 1).toString().padStart(2, '0');
        const dia = fechaOriginal.getDate().toString().padStart(2, '0');
        const fechaFormateada = `${año}-${mes}-${dia}`;
        cobroItem.innerHTML = `
        <label class="cliente-item">${cobro.numero}</label>
        <label class="cliente-item">${fechaFormateada}</label>
        <label class="cliente-item">${tipoTexto}</label>
        <label class="cliente-item">${cobro.monto}</label>
        <button class="btn-edit"><i class="fa-solid fa-pen-to-square" style="color: #06204b;"></i></button>
        `;
        cobroslista.appendChild(cobroItem);

        const btnEdit = cobroItem.querySelector('.btn-edit')

        btnEdit.addEventListener('click', async (e) => {
            const response = await fetch(`/api/cobros/${cobro.id}`);
            const data = await response.json();
            console.log(data);
            mostrarPopup();
            dynamicTextElement.textContent = "Cobro " + data.numero;
            formcobro['nit/cui'].value = data.nit;
            formcobro['nombre'].value = data.nombre_comercial;
            formcobro['direccion'].value = data.direccion;
            formcobro['telefono'].value = data.telefono;
            formcobro['tp_doc'].value = data.id_tipo_documento;
            var foriginal = new Date(data.fecha_emision);
            var año = foriginal.getFullYear();
            var mes = (foriginal.getMonth() + 1).toString().padStart(2, '0'); // Agrega ceros al mes si es necesario
            var dia = foriginal.getDate().toString().padStart(2, '0'); // Agrega ceros al día si es necesario
            var fcorrecto = `${año}-${mes}-${dia}`;
            formcobro['emision'].value = fcorrecto;
            formcobro['numero'].value = data.numero;
            formcobro['total'].value = data.monto;
            
            editar = true;
            cobroId = data.id;
        });

    });

}

function buscarProductoPorCodigo() {
    const codigoInput = formlineacobro['codigo'].value;

    productoEncontrado = productos.find(producto => producto.codigo === codigoInput);

    if (productoEncontrado) {

        formlineacobro['nombre'].value = productoEncontrado.nombre;
        formlineacobro['precio'].value = productoEncontrado.precio;
    } else {
        
    }
}

const codigoInput = formlineacobro['codigo'];

// Evento keyup (cuando se suelta una tecla)
codigoInput.addEventListener('keyup', () => {
    // Llamar a la función buscarClientePorNIT
    buscarProductoPorCodigo();
});

// Evento change (cuando se sale del campo o cambia su valor)
codigoInput.addEventListener('change', () => {
    // Llamar a la función buscarClientePorNIT
    buscarProductoPorCodigo();
});

formlineacobro.addEventListener('submit', async (e) => {
    e.preventDefault()
    const cantidad = parseFloat(formlineacobro['cantidad'].value)
    const subtotal = cantidad * productoEncontrado.precio
    formlineacobro['subtotal'].value = subtotal
    const id_producto = productoEncontrado.id
    const id_cobro  = actcobro
    //console.log(actcobro.id)

    if (!editar) {
        const response = await fetch('/api/lineas_cobro', {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({
                id_producto,
                id_cobro,   
                cantidad,
                subtotal,
            }),
        });

        const data = await response.json();
        lineascobro.push(data);
        // Calcular el monto total
        const montoTotal = lineascobro.reduce((total, linea) => total + linea.subtotal, 0);

        // Actualizar el monto en la tabla "cobros"
        const responseCobros = await fetch(`/api/cobros_monto/${id_cobro}`, {
            method: "PUT",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({
                monto: montoTotal,
            }),
        });

        const dataCobros = await responseCobros.json();
        console.log(dataCobros)
        console.log(lineascobro)
        renderlineascobro(lineascobro);
    } else {
        const response = await fetch(`/api/lineas_cobro/${cobroId}`, {
            method: "PUT",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({
                id_producto,
                id_cobro,   
                cantidad,
                subtotal,
            }),
        });
        const updlineacobro = await response.json();
        lineascobro = lineascobro.map((lineacobro) => lineacobro.id === updlineacobro[0].id ? updlineacobro[0] : lineacobro);
        rendercobro(cobros);
        editar = false;
        productoId = null;

    }

    cerrarPopup();
    formlineacobro.reset();

});

const id = actcobro
// Realizar la solicitud fetch con el ID
async function obtenerDatosLineasCobro(id) {
    const response = await fetch(`/api/lineas_cobro/${id}`);
    const data = await response.json();
    lineascobro = data;
    // Luego puedes hacer uso de la variable lineascobro o realizar alguna acción con los datos recibidos.
    renderlineascobro(lineascobro);
    console.log(lineascobro)
}

// Llamar a la función para obtener los datos de línea de cobro
//obtenerDatosLineasCobro();
//obtenerDatosLineasCobro();

async function actualizarcobromonto(id) {
    const montoTotal = lineascobro.reduce((subtotal, linea) => subtotal + linea.monto, 0);
    const monto = montoTotal
    const response = await fetch(`/api/cobros_monto/${id}`, {
        method: "PUT",
        headers: {
            "Content-Type": "application/json",
        },
        body: JSON.stringify({
           monto
        }),
    });
    const data = await response.json()
}   

function renderlineascobro(lineascobro) {
    console.log(lineascobro)
    const lineascobrolista = document.querySelector('#lineacobrolista');
    lineascobrolista.innerHTML = '';

    lineascobro.forEach((lineacobro) => {
        const lineacobroItem = document.createElement('li');
        lineacobroItem.classList = 'list-group-item my-2';
        
        lineacobroItem.innerHTML = `
        <label class="cliente-item">${lineacobro.codigo}</label>
        <label class="cliente-item">${lineacobro.nombre}</label>
        <label class="cliente-item">${lineacobro.precio}</label>
        <label class="cliente-item">${lineacobro.cantidad}</label>
        <label class="cliente-item">${lineacobro.subtotal}</label>
        <button class="btn-edit"><i class="fa-solid fa-pen-to-square" style="color: #06204b;"></i></button>
        `;

        lineascobrolista.appendChild(lineacobroItem);

        const btnEdit = lineacobroItem.querySelector('.btn-edit')

        btnEdit.addEventListener('click', async (e) => {
            const response = await fetch(`/api/lineas_cobros/${lineacobro.id}`);
            const data = await response.json();
            console.log(data);
            formlineacobro['codigo'].value = data.codigo;
            formlineacobro['nombre'].value = data.codigo;
            formlineacobro['precio'].value = data.codigo;
            formlineacobro['cantidad'].value = data.codigo;
            formlineacobro['subtotal'].value = data.codigo;
            
            
            editar = true;
            cobroId = data.id;
        });

    });


}