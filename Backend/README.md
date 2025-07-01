# BourseX Backend

Django REST Framework backend for the BourseX stock market application.

## Setup

1. **Create and activate a virtual environment**
   ```bash
   python -m venv venv
   .\venv\Scripts\activate  # On Windows
   source venv/bin/activate  # On macOS/Linux
   ```

2. **Install dependencies**
   ```bash
   pip install -r requirements.txt
   ```

3. **Run migrations**
   ```bash
   python manage.py migrate
   ```

4. **Create a superuser (admin)**
   ```bash
   python manage.py createsuperuser
   ```

5. **Import sample data**
   ```bash
   python manage.py import_sample_stocks
   ```

6. **Run the development server**
   ```bash
   python manage.py runserver
   ```

## API Endpoints

- `GET /api/stocks/` - List all stocks
- `GET /api/stocks/{id}/` - Get stock details
- `POST /api/stocks/{id}/update_price/` - Update stock price
- `GET /api/stocks/{id}/history/` - Get price history for a stock

## Admin Interface

Access the admin interface at `http://localhost:8000/admin/` using your superuser credentials.

## Environment Variables

Create a `.env` file in the project root with the following variables:

```
DEBUG=True
SECRET_KEY=your-secret-key-here
ALLOWED_HOSTS=localhost,127.0.0.1
CORS_ALLOWED_ORIGINS=http://localhost:3000
DATABASE_URL=sqlite:///db.sqlite3
```
