const formusuario = document.querySelector('#formusuario');
var dynamicTextElement = document.getElementById("dynamicText");

let usuarios = [];
let editar = false;
let usuarioId = null;

// Función para mostrar el popup
function mostrarPopup() {
    document.getElementById('miPopup').style.display = 'block';
    dynamicTextElement.textContent = "Nuevo Usuario";
}
// Función para cerrar el popup
function cerrarPopup() {
    document.getElementById('miPopup').style.display = 'none';
    formusuario.reset();
}
const checkbox = document.getElementById('desactivado');

let valorCheckbox;

// Agrega un event listener para el evento "change" del checkbox
checkbox.addEventListener('change', function () {
    // Cuando el checkbox cambia de estado, actualiza el valor de la variable
    valorCheckbox = this.checked;
});



window.addEventListener('DOMContentLoaded', async () => {
    const response = await fetch("/api/usuarios");
    const data = await response.json();
    usuarios = data;
    renderusuario(usuarios);
});

formusuario.addEventListener('submit', async (e) => {
    e.preventDefault()

    const estado = formusuario['desactivado'].checked
    const usuario = formusuario['usuario'].value
    const nombre = formusuario['nombre'].value
    const correo = formusuario['correo'].value
    const telefono = formusuario['telefono'].value
    const credencial = formusuario['contra'].value
    const rol = parseInt(formusuario['rol'].value, 10)

    if (!editar) {
        const response = await fetch('/api/usuarios', {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({
                usuario,
                nombre,
                correo,
                telefono,
                credencial,
                rol,
                estado,
            }),
        });

        const data = await response.json();
        usuarios.push(data);
        renderusuario(usuarios);
    } else {
        const response = await fetch(`/api/usuarios/${usuarioId}`, {
            method: "PUT",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({
                usuario,
                nombre,
                correo,
                telefono,
                credencial,
                rol,
                estado,
            }),
        });
        const updusuario = await response.json();
        usuarios = usuarios.map((usuario) => usuario.id === updusuario[0].id ? updusuario[0] : usuario);
        renderusuario(usuarios);
        console.log(usuarios)
        editar = false;
        usuarioId = null;

    }

    cerrarPopup();
    formusuario.reset();

});

function renderusuario(usuarios) {
    const usuarioslista = document.querySelector('#usuarioslista');
    usuarioslista.innerHTML = '';

    usuarios.forEach((usuario) => {
        const usuarioItem = document.createElement('li');
        usuarioItem.classList = 'list-group-item my-2';
        let tipoTexto = '';
        switch (usuario.id_rol) {
            case 1:
                tipoTexto = 'Contador General';
                break;
            case 2:
                tipoTexto = 'Contador Auxiliar';
                break;
            default:
                tipoTexto = 'Valor Desconocido';
        }

        usuarioItem.innerHTML = `
        <label class="cliente-item">${usuario.nombre}</label>
        <label class="cliente-item">${usuario.usuario}</label>
        <label class="cliente-item">${usuario.correo}</label>
        <label class="cliente-item">${usuario.telefono}</label>
        <label class="cliente-item">${tipoTexto}</label>
        <button class="btn-edit"><i class="fa-solid fa-pen-to-square" style="color: #06204b;"></i></button>
        `;
        usuarioslista.appendChild(usuarioItem);

        const btnEdit = usuarioItem.querySelector('.btn-edit')

        btnEdit.addEventListener('click', async (e) => {
            const response = await fetch(`/api/usuarios/${usuario.id}`);
            const data = await response.json();
            console.log(data);
            mostrarPopup()
            dynamicTextElement.textContent = data.usuario;
            formusuario['desactivado'].checked = data.desactivado;
            formusuario['usuario'].value = data.usuario;
            formusuario['nombre'].value = data.nombre;
            formusuario['correo'].value = data.correo;
            formusuario['telefono'].value = data.telefono;
            formusuario['contra'].value = data.contra;
            formusuario['valcontra'].value = data.contra;
            formusuario['rol'].value = data.id_rol;
            editar = true;
            usuarioId = data.id;
        });

    });

}