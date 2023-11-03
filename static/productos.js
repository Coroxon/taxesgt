const formusuario = document.querySelector('#formproducto');
var dynamicTextElement = document.getElementById("dynamicText");

let productos = [];
let editar = false;
let productoId = null;

// Función para mostrar el popup
function mostrarPopup() {
    document.getElementById('miPopup').style.display = 'block';
    dynamicTextElement.textContent = "Nuevo producto";
}
// Función para cerrar el popup
function cerrarPopup() {
    document.getElementById('miPopup').style.display = 'none';
    formproducto.reset();
}

const checkbox = document.getElementById('desactivado');

let valorCheckbox;

// Agrega un event listener para el evento "change" del checkbox
checkbox.addEventListener('change', function () {
    // Cuando el checkbox cambia de estado, actualiza el valor de la variable
    valorCheckbox = this.checked;
});

window.addEventListener('DOMContentLoaded', async () => {
    const response = await fetch("/api/productos");
    const data = await response.json();
    productos = data;
    renderproducto(productos);
});

formproducto.addEventListener('submit', async (e) => {
    e.preventDefault()

    const codigo = formproducto['codigo'].value
    const nombre = formproducto['nombre'].value
    const precio = formproducto['precio'].value
    const descripcion = formproducto['descripcion'].value
    const id_tipo_producto = parseInt(formproducto['rol'].value, 10)

    if (!editar) {
        const response = await fetch('/api/productos', {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({
                codigo,
                nombre,
                precio,
                descripcion,
                id_tipo_producto,
            }),
        });

        const data = await response.json();
        productos.push(data);
        renderproducto(productos);
    } else {
        const response = await fetch(`/api/productos/${productoId}`, {
            method: "PUT",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({
                codigo,
                nombre,
                precio,
                descripcion,
                id_tipo_producto,
            }),
        });
        const updproducto = await response.json();
        productos = productos.map((producto) => producto.id === updproducto[0].id ? updproducto[0] : producto);
        renderproducto(productos);
        editar = false;
        productoId = null;

    }

    cerrarPopup();
    formproducto.reset();

});

function renderproducto(productos) {
    const productoslista = document.querySelector('#productoslista');
    productoslista.innerHTML = '';

    productos.forEach((producto) => {
        const productoItem = document.createElement('li');
        productoItem.classList = 'list-group-item my-2';
        let tipoTexto = '';
        switch (producto.id_tipo_producto) {
            case 1:
                tipoTexto = 'Producto';
                break;
            case 2:
                tipoTexto = 'Servicio';
                break;
            default:
                tipoTexto = 'Valor Desconocido';
        }
        
        productoItem.innerHTML = `
        <label class="cliente-item">${producto.codigo}</label>
        <label class="cliente-item">${producto.nombre}</label>
        <label class="cliente-item">${tipoTexto}</label>
        <label class="cliente-item">${producto.precio}</label>
        <button class="btn-edit"><i class="fa-solid fa-pen-to-square" style="color: #06204b;"></i></button>
        `;
        productoslista.appendChild(productoItem);

        const btnEdit = productoItem.querySelector('.btn-edit')

        btnEdit.addEventListener('click', async (e) => {
            const response = await fetch(`/api/productos/${producto.id}`);
            const data = await response.json();
            console.log(data);
            mostrarPopup();
            dynamicTextElement.textContent = data.nombre;
            formusuario['codigo'].value = data.codigo;
            formusuario['nombre'].value = data.nombre;
            formusuario['descripcion'].value = data.descripcion;
            formusuario['precio'].value = data.precio;
            formusuario['rol'].value = data.id_tipo_producto;
            editar = true;
            productoId = data.id;
        });

    });

}