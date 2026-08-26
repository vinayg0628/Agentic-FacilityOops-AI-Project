import unittest
import os
import sys

sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), '..')))

from app.main import app

class TestAPIImports(unittest.TestCase):
    def test_fastapi_app_initialization(self):
        self.assertEqual(app.title, "Agentic AI For Smart Facility Operations And Optimizations")
        self.assertTrue(len(app.routes) > 0)

if __name__ == '__main__':
    unittest.main()
