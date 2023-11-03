const formcliente = document.querySelector('#formcliente')
var dynamicTextElement = document.getElementById("dynamicText");
var dynamicTextElementnombre = document.getElementById("dynamicTextnombre");

let clientes = []
let editar = false;
let clienteId = null;

// Función para mostrar el popup
function mostrarPopup() {
    document.getElementById('miPopup').style.display = 'block';
    dynamicTextElement.textContent = "Nuevo Cliete";
}
// Función para cerrar el popup
function cerrarPopup() {
    document.getElementById('miPopup').style.display = 'none';
    formcliente.reset();
}

const checkbox = document.getElementById('desactivado');

let valorCheckbox;

// Agrega un event listener para el evento "change" del checkbox
checkbox.addEventListener('change', function () {
    // Cuando el checkbox cambia de estado, actualiza el valor de la variable
    valorCheckbox = this.checked;
});

window.addEventListener('DOMContentLoaded', async () => {
    const response = await fetch("/api/clientes");
    const data = await response.json()
    clientes = data
    rendercliente(clientes)
});

formcliente.addEventListener('submit', async e => {
    e.preventDefault()

    const estado = formcliente['desactivado'].checked
    const nacimiento = formcliente['fechanacimiento'].value
    const r_social = formcliente['razonsocial'].value
    const n_comercial = formcliente['nombrecomercial'].value
    const dpi = formcliente['dpi'].value
    const nit = formcliente['nit'].value
    const correo = formcliente['correo'].value
    const c_correo = formcliente['contracorreo'].value
    const c_agen_virt = formcliente['contravirtual'].value
    const telefono = formcliente['telefono'].value
    const ini_taxes = formcliente['initaxes'].value
    const direccion = formcliente['direccion'].value
    const tipo_cliente = parseInt(formcliente['tipocontribuyente'].value, 10)

    if(!editar){
        const response = await fetch('/api/clientes',{
            method: 'POST',
            headers: {
            'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                nacimiento,
                r_social,
                n_comercial,
                dpi,
                nit,
                telefono,
                correo,
                c_correo,
                c_agen_virt,
                direccion,
                ini_taxes,
                estado,
                tipo_cliente,
            }),
        });
        const data = await response.json()
        clientes.push(data);
        rendercliente(clientes);

    } else {
        const response = await fetch(`/api/clientes/${clienteId}`,{
            method: 'PUT',
            headers: {
            'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                nacimiento,
                r_social,
                n_comercial,
                dpi,
                nit,
                telefono,
                correo,
                c_correo,
                c_agen_virt,
                direccion,
                ini_taxes,
                estado,
                tipo_cliente,
            }),
        });
        const updcliente = await response.json()
        clientes = clientes.map((cliente) => cliente.id === updcliente[0].id ? updcliente[0] : cliente);
        rendercliente(clientes);
        editar = false;
        clienteId = null;
    }
    
    cerrarPopup();
    formcliente.reset()

});

function rendercliente(clientes){
    const clienteslista = document.querySelector('#clienteslista');
    clienteslista.innerHTML = '';

    clientes.forEach(cliente => {
        const clienteItem = document.createElement('li');
        clienteItem.classList = 'list-group-item my-2';
        let tipoTexto = '';
        switch (cliente.id_tipo_cliente) {
          case 1:
            tipoTexto = 'Caja Chica';
            break;
          case 2:
            tipoTexto = 'Pequeño Contribuyente Digital';
            break;
          case 3:
            tipoTexto = 'Pequeño Contribuyente Normal';
            break;
          default:
            tipoTexto = 'Valor Desconocido';
        }

        clienteItem.innerHTML = `
        <label class="cliente-item">${cliente.nombre_comercial}</label>
        <label class="cliente-item">${cliente.correo}</label>
        <label class="cliente-item">${cliente.telefono}</label>
        <label class="cliente-item">${cliente.dpi}</label>
        <label class="cliente-item">${tipoTexto}</label>
        <button class="btn-mov"><i class="fa-solid fa-folder-plus" style="color: #021b45;"></i></button>
        <button class="btn-edit"><i class="fa-solid fa-pen-to-square" style="color: #06204b;"></i></i></button>
        `;
        clienteslista.appendChild(clienteItem);

        const btnMov = clienteItem.querySelector('.btn-mov');

        btnMov.addEventListener('click', async (e) => {
            const response = await fetch(`/api/clientes/${cliente.id}`);
            const data = await response.json();
            console.log(data);
            
            // Almacena los datos completos en localStorage
            localStorage.setItem('datosCliente', JSON.stringify(data));
        
            // Redirige a la página "/movimientos"
            window.location.href = '/movimientos';
        });
        

        const btnEdit = clienteItem.querySelector('.btn-edit')

        btnEdit.addEventListener('click', async (e) => {
            const response = await fetch(`/api/clientes/${cliente.id}`);
            const data = await response.json();
            console.log(data);
            mostrarPopup();
            dynamicTextElement.textContent = data.nombre_comercial;
            formcliente['desactivado'].checked = data.desactivado;
            var foriginal = new Date(data.fecha_nacimiento);
            var año = foriginal.getFullYear();
            var mes = (foriginal.getMonth() + 1).toString().padStart(2, '0'); // Agrega ceros al mes si es necesario
            var dia = foriginal.getDate().toString().padStart(2, '0'); // Agrega ceros al día si es necesario
            var fcorrecto = `${año}-${mes}-${dia}`;
            formcliente['fechanacimiento'].value = fcorrecto;
            formcliente['razonsocial'].value = data.razon_social;
            formcliente['nombrecomercial'].value = data.nombre_comercial;
            formcliente['dpi'].value = data.dpi;
            formcliente['nit'].value = data.nit;
            formcliente['correo'].value = data.correo;
            formcliente['contracorreo'].value = data.contracorreo;
            formcliente['contravirtual'].value = data.contravirtual;
            formcliente['telefono'].value = data.telefono;
            var foriginal = new Date(data.inicio_taxes);
            var año = foriginal.getFullYear();
            var mes = (foriginal.getMonth() + 1).toString().padStart(2, '0'); // Agrega ceros al mes si es necesario
            var dia = foriginal.getDate().toString().padStart(2, '0'); // Agrega ceros al día si es necesario
            var fcorrecto = `${año}-${mes}-${dia}`;
            formcliente['initaxes'].value = fcorrecto;
            formcliente['direccion'].value = data.direccion;
            formcliente['tipocontribuyente'].value = data.id_tipo_cliente;
            editar = true;
            clienteId = data.id;
        });
        
    });

}