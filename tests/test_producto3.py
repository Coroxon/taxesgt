import unittest
from app import app

class TestCrearProducto(unittest.TestCase):
    def setUp(self):
        app.config['TESTING'] = True
        self.app = app.test_client()

    def tearDown(self):
        pass

    def test_crear_producto(self):
        nuevo_producto = {
            'codigo': '98765',
            'nombre': 'Nuevo Producto Test',
            'precio': 49.99,
            'descripcion': 'Descripción del nuevo producto de prueba',
            'id_tipo_producto': 3
        }

        response = self.app.post('/api/productos', json=nuevo_producto)

        if response.status_code == 200:
            print("Producto creado exitosamente.")
            
            # Verificar que se devuelva la información del nuevo producto creado
            created_product = response.get_json()
            self.assertEqual(created_product['codigo'], nuevo_producto['codigo'])
            self.assertEqual(created_product['nombre'], nuevo_producto['nombre'])
            # Agregar más aserciones según los datos que se desean verificar

        else:
            print("Otro mensaje o manejo de errores aquí si es necesario.")

        # Verificar el código de estado de la respuesta
        self.assertEqual(response.status_code, 200)

if __name__ == '__main__':
    unittest.main()