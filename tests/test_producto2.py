import unittest
from app import app

class TestProductos(unittest.TestCase):
    def setUp(self):
        app.config['TESTING'] = True
        self.app = app.test_client()

    def tearDown(self):
        pass

    def test_actualizar_producto(self):
        id = 1
        producto = {
            'codigo': '001',
            'nombre': 'Pago de Calcomania',
            'precio': 99.50,
            'descripcion': 'Pago de calcomania de moto',
            'id_tipo_producto': 1
        }

        response = self.app.put(f'/api/productos/{id}', json=producto)

        if response.status_code == 404:
            print(f"El producto con ID {id} no existe.")
        elif response.status_code == 200:
            print(f"El producto con ID {id} se actualizó exitosamente.")
            
            # Verificar que los datos se actualizaron correctamente en la base de datos
            # Agregar más aserciones para verificar el comportamiento deseado
            updated_product = self.app.get(f'/api/productos/{id}').get_json()
            self.assertEqual(updated_product['nombre'], producto['nombre'])
            self.assertEqual(updated_product['precio'], producto['precio'])
            # Agregar más verificaciones según sea necesario

        else:
            print("Otro mensaje o manejo de errores aquí si es necesario.")

        # Verificar el código de estado de la respuesta
        self.assertIn(response.status_code, [200, 404])  # Se espera 200 o 404

if __name__ == '__main__':
    unittest.main()
