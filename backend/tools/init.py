import os
import sys
import django
import time
from django.core.management import call_command
from redis import Redis
from psycopg2 import connect, OperationalError
import psycopg2

# Check for required environment variables
REQUIRED_ENV_VARS = ["DATABASE_URL", "REDIS_URL", "DJANGO_SETTINGS_MODULE"]

def check_environment_variables():
    for var in REQUIRED_ENV_VARS:
        if var not in os.environ:
            print(f"Error: {var} is not set.")
            sys.exit(1)

# Wait for PostgreSQL to be ready
def wait_for_postgres():
    while True:
        try:
            conn = connect(
                dbname="ft_transcendence",
                user="mouad",
                password="mouad",
                host="postgres",
                port="5432",
            )
            conn.close()
            print("PostgreSQL is ready!")
            break
        except OperationalError:
            print("Waiting for PostgreSQL...")
            time.sleep(2)

# Wait for Redis to be ready
def wait_for_redis():
    redis_url = os.environ.get("REDIS_URL", "redis://localhost:6379/0")
    redis_client = Redis.from_url(redis_url)
    for attempt in range(10):  # Retry for 10 attempts
        try:
            print("Checking Redis connection...")
            redis_client.ping()
            print("Redis is ready!")
            return
        except Exception as e:
            print(f"Redis is not ready. Attempt {attempt + 1}/10. Retrying in 2 seconds...")
            time.sleep(2)
    print("Error: Redis did not become ready in time.")
    sys.exit(1)

# Initialize Django
def initialize_django():
    print("Initializing Django...")

    # Ensure the environment is set up
    os.environ.setdefault("DJANGO_SETTINGS_MODULE", "core.settings")
    django.setup()

    print("Checking PostgreSQL connection...")
    wait_for_postgres()

    print("Checking Redis connection...")
    wait_for_redis()

    try:
        print("Making migrations for 'authentication' app...")
        call_command("makemigrations", "authentication")

        print("Applying all migrations...")
        call_command("migrate")
        print("Migrations applied successfully!")
    except Exception as e:
        print(f"Error during migrations: {e}")
        sys.exit(1)

# Create a default superuser if none exists
def create_superuser():
    try:
        from django.contrib.auth import get_user_model

        User = get_user_model()
        if not User.objects.filter(is_superuser=True).exists():
            print("Creating default superuser...")
            User.objects.create_superuser(
                username=os.getenv("DJANGO_SUPERUSER_USERNAME", "admin"),
                email=os.getenv("DJANGO_SUPERUSER_EMAIL", "admin@example.com"),
                password=os.getenv("DJANGO_SUPERUSER_PASSWORD", "admin123"),
            )
            print("Superuser created successfully!")
    except Exception as e:
        print(f"Error creating superuser: {e}")

# Main function
def main():
    check_environment_variables()
    initialize_django()
    create_superuser()
    print("Initialization complete.")

if __name__ == "__main__":
    for var in REQUIRED_ENV_VARS:
        if var not in os.environ:
            raise RuntimeError(f"Required environment variable {var} is missing")
    main()
