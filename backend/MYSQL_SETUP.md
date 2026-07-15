# KalaShaala MySQL Setup

This project can now run on MySQL by setting `DB_ENGINE=mysql` in your `.env` file.

## 1. Install backend dependencies

```powershell
cd backend
pip install -r requirements.txt
```

## 2. Create the MySQL database and user

Open MySQL as an admin user:

```powershell
mysql -u root -p
```

Then run the setup file:

```sql
SOURCE C:/Users/Sanchet/Downloads/KalaShala-master/KalaShala-master/backend/mysql_setup.sql;
```

You can also copy the SQL from `mysql_setup.sql` and run it manually.

Or run the PowerShell helper from the backend folder:

```powershell
.\create_mysql_database.ps1
```

## 3. Configure `.env`

Copy `.env.example` to `.env` in the project root and update the MySQL password:

```env
DB_ENGINE=mysql
MYSQL_DATABASE=kalashala
MYSQL_USER=kalashala_user
MYSQL_PASSWORD=change-this-password
MYSQL_HOST=127.0.0.1
MYSQL_PORT=3306
```

The password in `.env` must match the password used in `mysql_setup.sql`.

## 4. Create Django tables in MySQL

```powershell
cd backend
python manage.py migrate
```

## 5. Run the backend

```powershell
python manage.py runserver
```

If you need to keep using SQLite temporarily, set `DB_ENGINE=sqlite` or remove `DB_ENGINE` from `.env`.
