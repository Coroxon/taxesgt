from flask import Flask, request, jsonify, render_template, redirect,url_for
from psycopg2 import connect, extras
from cryptography.fernet import Fernet
from werkzeug.security import generate_password_hash, check_password_hash
from dotenv import load_dotenv
from os import environ

load_dotenv()
app = Flask(__name__)
#key = Fernet.generate_key()
#fernet = Fernet(key)

#cofiguracion de la base de datos
host =  environ.get('DB_HOST')
port =  environ.get('DB_PORT')
dbname =  environ.get('DB_NAME')
user =  environ.get('DB_USER')
password =  environ.get('DB_PASSWORD')


def get_connection():
    conn = connect(host=host, port=port, dbname=dbname,
                   user=user, password=password)
    return conn

# rutas para usuarios -------------------------------------------------------------------------
@app.get('/api/usuarios')
def buscar_usuarios():
    conn = get_connection()
    cur = conn.cursor(cursor_factory=extras.RealDictCursor)
    cur.execute('SELECT * FROM usuarios where id_rol != 3')
    usuarios = cur.fetchall()

    cur.close()
    conn.close()

    return jsonify(usuarios)

@app.post('/api/usuarios')
def crear_usuarios():
    nuevo_usuario = request.get_json()
    usuario = nuevo_usuario['usuario']
    nombre = nuevo_usuario['nombre']
    correo = nuevo_usuario['correo']
    telefono = nuevo_usuario['telefono']
    credencial = nuevo_usuario['credencial']
    credencial_encrypt = generate_password_hash(credencial)
    rol = nuevo_usuario['rol']
    estado = nuevo_usuario['estado']

    conn = get_connection()
    cur = conn.cursor(cursor_factory=extras.RealDictCursor)
    cur.execute('INSERT INTO usuarios (usuario, nombre, correo, telefono, credencial, id_rol, desactivado) VALUES (%s, %s, %s, %s, %s, %s, %s) RETURNING *',
                (usuario, nombre, correo, telefono, credencial_encrypt, rol, estado))
    nuevo_usuario_creado = cur.fetchone()
    print(nuevo_usuario_creado)
    conn.commit()
    cur.close()
    conn.close()
    return jsonify(nuevo_usuario_creado)

@app.get('/api/usuarios/<id>')  # ruta para consultar un usuario
def buscar_usuario(id):  # crear una funcion consultar un usuario y le envia el el calos de la variable id
    conn = get_connection()
    cur = conn.cursor(cursor_factory=extras.RealDictCursor)

    cur.execute('SELECT*FROM usuarios WHERE id = %s', (id,))
    usuario = cur.fetchone()

    if usuario is None:  # condicion para validar si el usuario existe
        # mensaje si el usuario no existe
        return jsonify({'message': 'User not found'}), 404
    
    return jsonify(usuario)

@app.put('/api/usuarios/<id>')
def actualizar_usuario(id):
    conn = get_connection()
    cur = conn.cursor(cursor_factory=extras.RealDictCursor)
    actualizar_usuario = request.get_json()
    usuario = actualizar_usuario['usuario']
    nombre = actualizar_usuario['nombre']
    correo = actualizar_usuario['correo']
    telefono = actualizar_usuario['telefono']
    credencial = actualizar_usuario['credencial']
    credencial_encrypt = generate_password_hash(credencial)
    rol = actualizar_usuario['rol']
    estado = actualizar_usuario['estado']

    cur.execute('UPDATE usuarios SET usuario =%s, nombre =%s, correo =%s, telefono =%s, credencial =%s, id_rol =%s, desactivado =%s WHERE id =%s RETURNING *',
                (usuario, nombre, correo, telefono, credencial_encrypt, rol, estado, id))
    actualizar_usuario = cur.fetchall()
    conn.commit()
    cur.close()
    conn.close()

    if actualizar_usuario is None:
        return jsonify({'message': 'No se encontro el usuario'}), 404
    return jsonify(actualizar_usuario)

#rutas para producto-------------------------------------------------------------------------
@app.get('/api/productos')
def buscar_productos():
    conn = get_connection()
    cur = conn.cursor(cursor_factory=extras.RealDictCursor)
    cur.execute('SELECT * FROM productos')
    productos = cur.fetchall()

    cur.close()
    conn.close()

    return jsonify(productos)

@app.post('/api/productos')
def crear_producto():
    nuevo_producto = request.get_json()
    codigo = nuevo_producto['codigo']
    nombre = nuevo_producto['nombre']
    precio = nuevo_producto['precio']
    descripcion = nuevo_producto['descripcion']
    id_tipo_producto = nuevo_producto['id_tipo_producto']

    conn = get_connection()
    cur = conn.cursor(cursor_factory=extras.RealDictCursor)
    cur.execute('INSERT INTO productos (codigo, nombre, precio, descripcion, id_tipo_producto) VALUES (%s, %s, %s, %s, %s) RETURNING *',
                (codigo, nombre, precio, descripcion, id_tipo_producto))
    nuevo_producto_creado = cur.fetchone()
    print(nuevo_producto_creado)
    conn.commit()
    cur.close()
    conn.close()
    return jsonify(nuevo_producto_creado)

@app.get('/api/productos/<id>')  # ruta para consultar un producto
def buscar_producto(id):  # crear una función para consultar un producto y le envía el valor de la variable id
    conn = get_connection()
    cur = conn.cursor(cursor_factory=extras.RealDictCursor)

    cur.execute('SELECT * FROM productos WHERE id = %s', (id,))
    producto = cur.fetchone()

    if producto is None:  # condición para validar si el producto no existe
        # mensaje si el producto no existe
        return jsonify({'message': 'Product not found'}), 404

    return jsonify(producto)


@app.put('/api/productos/<id>')
def actualizar_producto(id):
    conn = get_connection()
    cur = conn.cursor(cursor_factory=extras.RealDictCursor)
    actualizar_producto = request.get_json()
    codigo = actualizar_producto['codigo']
    nombre = actualizar_producto['nombre']
    precio = actualizar_producto['precio']
    descripcion = actualizar_producto['descripcion']
    id_tipo_producto = actualizar_producto['id_tipo_producto']

    cur.execute('UPDATE productos SET codigo = %s, nombre = %s, precio = %s, descripcion = %s, id_tipo_producto = %s WHERE id = %s RETURNING *',
                (codigo, nombre, precio, descripcion, id_tipo_producto, id))
    producto_actualizado = cur.fetchall()
    conn.commit()
    cur.close()
    conn.close()

    if not producto_actualizado:
        return jsonify({'message': 'No se encontró el producto'}), 404

    return jsonify(producto_actualizado)

#rutas para cliente

@app.get('/api/clientes')
def buscar_clientes():
    conn = get_connection()
    cur = conn.cursor(cursor_factory=extras.RealDictCursor)
    cur.execute('SELECT * FROM clientes ORDER BY id ASC')
    clientes = cur.fetchall()
    cur.close()
    conn.close()
    return jsonify(clientes)

@app.post('/api/clientes')
def crear_clientes():
    nuevo_cliente = request.get_json()
    nacimiento = nuevo_cliente['nacimiento']
    r_social = nuevo_cliente['r_social']
    n_comercial = nuevo_cliente['n_comercial']
    dpi = nuevo_cliente['dpi']
    nit = nuevo_cliente['nit']
    telefono = nuevo_cliente['telefono']
    correo = nuevo_cliente['correo']
    c_correo = nuevo_cliente['c_correo']
    c_agen_virt = nuevo_cliente['c_agen_virt']
    direccion = nuevo_cliente['direccion']
    ini_taxes = nuevo_cliente['ini_taxes']
    estado = nuevo_cliente['estado']
    tipo_cliente = nuevo_cliente['tipo_cliente']
    conn = get_connection()
    cur = conn.cursor(cursor_factory=extras.RealDictCursor)
    cur.execute('INSERT INTO clientes (fecha_nacimiento, razon_social, nombre_comercial, dpi, nit, telefono, correo, cont_correo, cont_agen_virtual, direccion, inicio_taxes, desactivado, id_tipo_cliente) VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s) RETURNING *',
                (nacimiento, r_social, n_comercial, dpi, nit, telefono, correo, c_correo, c_agen_virt, direccion, ini_taxes, estado, tipo_cliente))
    nuevo_cliente_creado = cur.fetchone()
    print(nuevo_cliente_creado)
    conn.commit()
    cur.close()
    conn.close()
    return jsonify(nuevo_cliente_creado)

@app.put('/api/clientes/<id>')
def actualizar_cliente(id):
    conn = get_connection()
    cur = conn.cursor(cursor_factory=extras.RealDictCursor)
    actualizar_cliente = request.get_json()
    nacimiento = actualizar_cliente['nacimiento']
    r_social = actualizar_cliente['r_social']
    n_comercial = actualizar_cliente['n_comercial']
    dpi = actualizar_cliente['dpi']
    nit = actualizar_cliente['nit']
    telefono = actualizar_cliente['telefono']
    correo = actualizar_cliente['correo']
    c_correo = actualizar_cliente['c_correo']
    c_agen_virt = actualizar_cliente['c_agen_virt']
    direccion = actualizar_cliente['direccion']
    ini_taxes = actualizar_cliente['ini_taxes']
    estado = actualizar_cliente['estado']
    tipo_cliente = actualizar_cliente['tipo_cliente']

    cur.execute('UPDATE clientes SET fecha_nacimiento =%s, razon_social =%s, nombre_comercial =%s, dpi =%s, nit =%s, telefono =%s, correo =%s, cont_correo =%s, cont_agen_virtual =%s, direccion =%s, inicio_taxes =%s, desactivado =%s, id_tipo_cliente =%s WHERE id =%s RETURNING *',
                (nacimiento, r_social, n_comercial, dpi, nit, telefono, correo, c_correo, c_agen_virt, direccion, ini_taxes, estado, tipo_cliente, id))
    actualizar_cliente = cur.fetchall()
    conn.commit()
    cur.close()
    conn.close()

    if actualizar_cliente is None:
        return jsonify({'message': 'No se encontro el cliente'}), 404
    return jsonify(actualizar_cliente)

@app.get('/api/clientes/<id>')  # Ruta para consultar un cliente
def buscar_cliente(id):
    conn = get_connection()
    cur = conn.cursor(cursor_factory=extras.RealDictCursor)

    cur.execute('SELECT * FROM clientes WHERE id = %s', (id,))
    cliente = cur.fetchone()

    if cliente is None:
        # Mensaje si el cliente no existe
        return jsonify({'message': 'Cliente not found'}), 404

    return jsonify(cliente)

#rutas para cobro

@app.get('/api/cobros')
def buscar_cobros():
    conn = get_connection()
    cur = conn.cursor(cursor_factory=extras.RealDictCursor)
    cur.execute('SELECT * FROM cobros ORDER BY id ASC')
    cobros = cur.fetchall()
    cur.close()
    conn.close()
    return jsonify(cobros)

@app.post('/api/cobros')
def crear_cobros():
    nuevo_cobro = request.get_json()
    numero = nuevo_cobro['numero']
    fecha_emision = nuevo_cobro['fecha_emision']
    id_tipo_documento = nuevo_cobro['id_tipo_documento']
    id_cliente = nuevo_cobro['id_cliente']

    # Verificar si 'monto' está presente en el JSON, si no, asignar None
    if 'monto' in nuevo_cobro:
        monto = nuevo_cobro['monto']
    else:
        monto = None

    conn = get_connection()
    cur = conn.cursor(cursor_factory=extras.RealDictCursor)

    # Preparar la consulta SQL considerando los campos opcionales (monto, fechaoperacion)
    if 'fechaoperacion' in nuevo_cobro:
        cur.execute('INSERT INTO cobros (numero, fecha_emision, monto, id_tipo_documento, id_cliente, fecha_operacion) VALUES (%s, %s, %s, %s, %s, current_date) RETURNING *',
                    (numero, fecha_emision, monto, id_tipo_documento, id_cliente))
    else:
        cur.execute('INSERT INTO cobros (numero, fecha_emision, monto, id_tipo_documento, id_cliente) VALUES (%s, %s, %s, %s, %s) RETURNING *',
                    (numero, fecha_emision, monto, id_tipo_documento, id_cliente))

    nuevo_cobro_creado = cur.fetchone()
    conn.commit()
    cur.close()
    conn.close()

    return jsonify(nuevo_cobro_creado)

@app.put('/api/cobros/<id>')
def actualizar_cobro(id):
    conn = get_connection()
    cur = conn.cursor(cursor_factory=extras.RealDictCursor)
    actualizar_cobro = request.get_json()
    numero = actualizar_cobro['numero']
    fecha_emision = actualizar_cobro['fecha_emision']
    monto = actualizar_cobro['monto']
    id_tipo_documento = actualizar_cobro['id_tipo_documento']
    id_cliente = actualizar_cobro['id_cliente']

    cur.execute('UPDATE cobros SET numero = %s, fecha_emision = %s, monto = %s, id_tipo_documento = %s, id_cliente = %s WHERE id = %s RETURNING *',
                (numero, fecha_emision, monto, id_tipo_documento, id_cliente, id))
    actualizar_cobro = cur.fetchall()
    conn.commit()
    cur.close()
    conn.close()

    if not actualizar_cobro:
        return jsonify({'message': 'No se encontró el cobro'}), 404
    return jsonify(actualizar_cobro)

@app.put('/api/cobros_monto/<id>')
def actualizar_cobro_monto(id):
    conn = get_connection()
    cur = conn.cursor(cursor_factory=extras.RealDictCursor)

    # Obtener los datos a actualizar del JSON recibido
    actualizar_cobro = request.get_json()
    monto = actualizar_cobro['monto']

    # Realizar la actualización solo del campo monto
    cur.execute('UPDATE cobros SET monto = %s WHERE id = %s RETURNING *', (monto, id))
    cobro_actualizado = cur.fetchone()
    conn.commit()
    cur.close()
    conn.close()

    # Verificar si se encontró el cobro y se actualizó
    if not cobro_actualizado:
        return jsonify({'message': 'No se encontró el cobro'}), 404

    return jsonify(cobro_actualizado)

@app.get('/api/cobros/<id>')  # Ruta para consultar un cobro
def buscar_cobro(id):
    conn = get_connection()
    cur = conn.cursor(cursor_factory=extras.RealDictCursor)

    cur.execute('''
        SELECT c.nit, c.nombre_comercial, c.direccion, c.telefono, co.id_tipo_documento, co.numero, co.fecha_emision, co.monto, co.id
        FROM cobros co
        JOIN clientes c ON co.id_cliente = c.id
        WHERE co.id = %s
    ''', (id,))
    
    cobro_info = cur.fetchone()

    if cobro_info is None:
        return jsonify({'message': 'Cobro no encontrado'}), 404

    return jsonify(cobro_info)

#rutas para linea de cobro

@app.get('/api/lineas_cobro')
def buscar_lineas_cobro():
    conn = get_connection()
    cur = conn.cursor(cursor_factory=extras.RealDictCursor)
    cur.execute('SELECT * FROM lineas_cobro ORDER BY id ASC')
    lineas_cobro = cur.fetchall()
    cur.close()
    conn.close()
    return jsonify(lineas_cobro)



@app.put('/api/lineas_cobro/<id>')
def actualizar_linea_cobro(id):
    conn = get_connection()
    cur = conn.cursor(cursor_factory=extras.RealDictCursor)
    actualizar_linea_cobro = request.get_json()
    id_cobro = actualizar_linea_cobro['id_cobro']
    id_producto = actualizar_linea_cobro['id_producto']
    cantidad = actualizar_linea_cobro['cantidad']
    subtotal = actualizar_linea_cobro['subtotal']

    cur.execute('UPDATE lineas_cobro SET id_cobro = %s, id_producto = %s, cantidad = %s, subtotal = %s WHERE id = %s RETURNING *',
                (id_cobro, id_producto, cantidad, subtotal, id))
    actualizar_linea_cobro = cur.fetchall()
    conn.commit()
    cur.close()
    conn.close()

    if not actualizar_linea_cobro:
        return jsonify({'message': 'No se encontró la línea de cobro'}), 404
    return jsonify(actualizar_linea_cobro)

@app.post('/api/lineas_cobro')
def crear_linea_cobro():
    nueva_linea_cobro = request.get_json()
    id_cobro = nueva_linea_cobro['id_cobro']
    id_producto = nueva_linea_cobro['id_producto']
    cantidad = nueva_linea_cobro['cantidad']
    subtotal = nueva_linea_cobro['subtotal']

    conn = get_connection()
    cur = conn.cursor(cursor_factory=extras.RealDictCursor)

    # Insertar la nueva línea de cobro
    cur.execute('INSERT INTO lineas_cobro (id_cobro, id_producto, cantidad, subtotal) VALUES (%s, %s, %s, %s) RETURNING *',
                (id_cobro, id_producto, cantidad, subtotal))
    nueva_linea_cobro_creada = cur.fetchone()
    conn.commit()

    # Actualizar el monto en la tabla cobros basado en el id_cobro recién insertado
    cur.execute('''
        UPDATE cobros
        SET monto = COALESCE(
            (SELECT SUM(subtotal) 
             FROM lineas_cobro
             WHERE id_cobro = %s
            ), 0
        )
        WHERE id = %s;
        ''', (id_cobro, id_cobro))
    conn.commit()

    # Realizar la consulta para obtener los datos con JOIN
    cur.execute('''
        SELECT p.codigo, p.nombre, p.precio, lc.id_cobro, lc.cantidad, lc.subtotal
        FROM lineas_cobro lc
        JOIN productos p ON lc.id_producto = p.id
        WHERE lc.id = %s
    ''', (nueva_linea_cobro_creada['id'],))  # Usar el ID de la nueva línea creada

    linea_con_producto = cur.fetchone()

    cur.close()
    conn.close()

    return jsonify(linea_con_producto)


@app.get('/api/lineas_cobro/<id>')  # Ruta para consultar una línea de cobro
def buscar_linea_cobro(id):
    conn = get_connection()
    cur = conn.cursor(cursor_factory=extras.RealDictCursor)

    cur.execute('''
        SELECT p.codigo, p.nombre, p.precio, lc.id_cobro, lc.cantidad, lc.subtotal
        FROM lineas_cobro lc
        JOIN productos p ON lc.id_producto = p.id
        WHERE lc.id_cobro = %s
    ''', (id,))
    
    linea_cobro = cur.fetchone()

    if linea_cobro is None:
        return jsonify({'message': 'Línea de cobro no encontrada'}), 404

    return jsonify(linea_cobro)

#rutas para movimientos
@app.route('/api/movimientos/<id>')  # Ruta para consultar los movimientos de un cliente específico
def buscar_movimientos(id):
    conn = get_connection()
    cur = conn.cursor(cursor_factory=extras.RealDictCursor)
    cur.execute('SELECT * FROM movimientos WHERE id_cliente = %s ORDER BY id ASC', (id,))
    movimientos = cur.fetchall()
    cur.close()
    conn.close()
    return jsonify(movimientos)



@app.post('/api/movimientos')
def crear_movimiento():
    nuevo_movimiento = request.get_json()
    referencia = nuevo_movimiento['referencia']
    numero = nuevo_movimiento['numero']
    proveedor = nuevo_movimiento['proveedor']
    cuenta = nuevo_movimiento['cuenta']
    responsable = nuevo_movimiento['responsable']
    monto = nuevo_movimiento['monto']
    fecha_emision = nuevo_movimiento['fecha_emision']
    id_tipo_movimiento = nuevo_movimiento['id_tipo_movimiento']
    id_cliente = nuevo_movimiento['id_cliente']

    conn = get_connection()
    cur = conn.cursor(cursor_factory=extras.RealDictCursor)

    if 'fechaoperacion' in nuevo_movimiento:
        cur.execute('INSERT INTO movimientos (referencia, numero, proveedor, cuenta, responsable, monto, fecha_emision, id_tipo_movimiento, id_cliente, fecha_operacion) VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s, current_date) RETURNING *',
                    (referencia, numero, proveedor, cuenta, responsable, monto, fecha_emision, id_tipo_movimiento, id_cliente))
    else:   
        cur.execute('INSERT INTO movimientos (referencia, numero, proveedor, cuenta, responsable, monto, fecha_emision, id_tipo_movimiento, id_cliente) VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s) RETURNING *',
            (referencia, numero, proveedor, cuenta, responsable, monto, fecha_emision, id_tipo_movimiento, id_cliente))

    nuevo_movimiento_creado = cur.fetchone()
    conn.commit()
    cur.close()
    conn.close()

    return jsonify(nuevo_movimiento_creado)

@app.put('/api/movimientos/<id>')
def actualizar_movimiento(id):
    conn = get_connection()
    cur = conn.cursor(cursor_factory=extras.RealDictCursor)
    actualizar_movimiento = request.get_json()
    referencia = actualizar_movimiento['referencia']
    numero = actualizar_movimiento['numero']
    proveedor = actualizar_movimiento['proveedor']
    cuenta = actualizar_movimiento['cuenta']
    responsable = actualizar_movimiento['responsable']
    monto = actualizar_movimiento['monto']
    fecha_emision = actualizar_movimiento['fecha_emision']
    id_tipo_movimiento = actualizar_movimiento['id_tipo_movimiento']
    id_cliente = actualizar_movimiento['id_cliente']

    cur.execute('UPDATE movimientos SET referencia = %s, numero = %s, proveedor = %s, cuenta = %s, responsable = %s, monto = %s, fecha_emision = %s, id_tipo_movimiento = %s, id_cliente = %s WHERE id = %s RETURNING *',
                (referencia, numero, proveedor, cuenta, responsable, monto, fecha_emision, id_tipo_movimiento, id_cliente, id))
    actualizar_movimiento = cur.fetchall()
    conn.commit()
    cur.close()
    conn.close()

    if not actualizar_movimiento:
        return jsonify({'message': 'No se encontró el movimiento'}), 404
    return jsonify(actualizar_movimiento)

@app.get('/api/movimientos1/<id>')  # Ruta para consultar un movimiento
def buscar_movimiento(id):
    conn = get_connection()
    cur = conn.cursor(cursor_factory=extras.RealDictCursor)

    cur.execute('SELECT * FROM movimientos WHERE id = %s', (id,))
    movimiento = cur.fetchone()

    if movimiento is None:
        # Mensaje si el movimiento no existe
        return jsonify({'message': 'Movimiento not found'}), 404

    return jsonify(movimiento)

@app.route('/api/movimientosegreso/<id>')
def buscar_movimientoegreso(id):
    conn = get_connection()
    cur = conn.cursor(cursor_factory=extras.RealDictCursor)

    cur.execute('SELECT * FROM movimientos WHERE id_tipo_movimiento = 2 AND id_cliente = %s', (id,))
    movimientos = cur.fetchall()

    if not movimientos:
        # Mensaje si no hay movimientos para ese cliente con el tipo de movimiento 2
        return jsonify({'message': 'No movements found for this client and movement type 2'}), 404

    return jsonify(movimientos)

@app.route('/api/movimientosingreso/<id>')
def buscar_movimientoingreso(id):
    conn = get_connection()
    cur = conn.cursor(cursor_factory=extras.RealDictCursor)

    cur.execute('SELECT * FROM movimientos WHERE id_tipo_movimiento = 1 AND id_cliente = %s', (id,))
    movimientos = cur.fetchall()

    if not movimientos:
        # Mensaje si no hay movimientos para ese cliente con el tipo de movimiento 2
        return jsonify({'message': 'No movements found for this client and movement type 2'}), 404

    return jsonify(movimientos)

@app.route('/api/movimientosegresostotal/<id>')
def buscar_movimientoegresototal(id):
    conn = get_connection()
    cur = conn.cursor(cursor_factory=extras.RealDictCursor)

    cur.execute('SELECT SUM(monto) AS total_monto FROM movimientos WHERE id_tipo_movimiento = 2 AND id_cliente = %s', (id,))
    total_monto = cur.fetchone()

    if not total_monto or total_monto['total_monto'] is None:
        return jsonify({'total_monto': 0})  # En caso de que la suma sea nula o no haya movimientos

    return jsonify(total_monto)

@app.route('/api/movimientosingresostotal/<id>')
def buscar_movimientoingresototal(id):
    conn = get_connection()
    cur = conn.cursor(cursor_factory=extras.RealDictCursor)

    cur.execute('SELECT SUM(monto) AS total_monto FROM movimientos WHERE id_tipo_movimiento = 1 AND id_cliente = %s', (id,))
    total_monto = cur.fetchone()

    if not total_monto or total_monto['total_monto'] is None:
        return jsonify({'total_monto': 0})  # En caso de que la suma sea nula o no haya movimientos

    return jsonify(total_monto)

#rutas para acceder a las distintas paginas
@app.route('/login', methods=['GET', 'POST'])
def login():
    return render_template('login.html')

@app.route('/usuario', methods=['GET', 'POST'])
def usuario():
    return render_template('usuarios.html')

@app.route('/cobros')
def mostrar_cobros():
    return render_template('cobros.html')

@app.route('/productos')
def mostrar_productos():
    return render_template('productos.html')

@app.route('/clientes')
def mostrar_clientes():
    return render_template('clientes.html')

@app.route('/movimientos')
def mostrar_movimientos():
    return render_template('movimientos.html')

@app.route('/reportes')
def mostrar_reportes():
    return render_template('reportes.html')

@app.route('/home', methods=['GET', 'POST'])
def home():
    return render_template('home.html')

@app.route('/home_auxiliar', methods=['GET', 'POST'])
def home_auxiliar():
    return render_template('home_auxiliar.html')

@app.route('/', methods=['GET'])
def root():
    return redirect(url_for('login'))

@app.route('/validar', methods=['GET', 'POST'])
def validar_login():
    if request.method == 'POST':
        usuario = request.json['usuario']
        credencial = request.json['contrasenia']

        conn = get_connection()
        cur = conn.cursor()

        # Consulta SQL para verificar al usuario
        cur.execute("SELECT credencial, id_rol FROM usuarios WHERE desactivado = false and usuario = %s ", (usuario,))
        usuario_db = cur.fetchone()

        cur.close()
        conn.close()
        
        if usuario_db:
            credencial_descrypt = (check_password_hash(usuario_db[0], credencial))
            #Descifra la contrasenia almacenada en la base de datos
            if credencial_descrypt:
                # Usuario válido, redireccionar a la página de inicio
                if usuario_db[1] == 3:
                    return jsonify ({'status': 'success', 'redirect': '/usuario'})
                elif usuario_db[1] == 1:
                    return jsonify ({'status': 'success', 'redirect': '/home'})
                elif usuario_db[1] == 2:
                    return jsonify ({'status': 'success', 'redirect': '/home_auxiliar'})
                else:
                     return jsonify({'status': 'error', 'message': 'Usuario no tiene acceso o no está activo'})
            else:
                return jsonify({'status': 'error', 'message': 'Credenciales incorrectos'})
        else:
            return jsonify({'status': 'error', 'message': 'Usuario no encontrado'})
    # Este bloque nunca debería ejecutarse, pero si se accede con un GET, simplemente retorna un error
    return jsonify({'status': 'error', 'message': 'Acceso no permitido'})



if __name__ == '__main__':
    app.run(host="0.0.0.0", port=5000, debug=True)

    

