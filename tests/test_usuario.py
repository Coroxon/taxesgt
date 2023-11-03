import unittest
from app import app  # Asegúrate de que esta importación sea la correcta

class TestProductos(unittest.TestCase):
    def setUp(self):
        app.config['TESTING'] = True
        self.app = app.test_client()

    def tearDown(self):
        pass

    def test_actualizar_producto(self):
        # Definir los datos de prueba
        id = 1
        producto = {
            'codigo': '123',
            'nombre': 'Pago de Targeta',
            'precio': 50,
            'descripcion': 'Pagro de targeta de circulación',
            'id_tipo_producto': 1
        }

        # Realizar una solicitud PUT a la ruta '/api/productos/<id>'
        response = self.app.put(f'/api/productos/{id}', json=producto)

        if response.status_code == 404:
            print(f"El producto con ID {id} no existe.")
        elif response.status_code == 200:
            print(f"El producto con ID {id} se actualizó exitosamente.")
        else:
            print("Otro mensaje o manejo de errores aquí si es necesario.")

        # Verificar que la respuesta sea 200 (éxito)
        self.assertEqual(response.status_code, 200)

        # Agrega más aserciones para verificar el comportamiento deseado

if __name__ == '__main__':
    unittest.main()