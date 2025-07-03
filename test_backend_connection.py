import requests
import sys

def test_connection():
    urls = [
        "http://127.0.0.1:8000/api/",
        "http://127.0.0.1:8000/admin/",
        "http://127.0.0.1:8000"
    ]
    
    for url in urls:
        try:
            print(f"\nTest de connexion à {url}")
            response = requests.get(url, timeout=5)
            print(f"✅ Statut: {response.status_code}")
            print(f"En-têtes CORS:")
            for header in ['Access-Control-Allow-Origin', 'Access-Control-Allow-Credentials']:
                print(f"  {header}: {response.headers.get(header, 'Non défini')}")
                
        except requests.ConnectionError:
            print(f"❌ Impossible de se connecter à {url}")
            print("Vérifiez que le serveur Django est en cours d'exécution avec la commande:")
            print("cd Backend && python manage.py runserver")
        except Exception as e:
            print(f"❌ Erreur lors de la connexion à {url}: {str(e)}")

if __name__ == "__main__":
    print("=== Test de connexion au backend Django ===\n")
    test_connection()
