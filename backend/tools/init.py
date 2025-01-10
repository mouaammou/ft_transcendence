import os
import sys
import django
import time
from django.core.management import call_command
from redis import Redis
from psycopg2 import connect, OperationalError
from django.contrib.auth import get_user_model

# Check for required environment variables
REQUIRED_ENV_VARS = [
    "DOCKER_REDIS_HOSTNAME", "DOCKER_REDIS_PORT", "DJANGO_SETTINGS_MODULE",
    "DJANGO_SUPERUSER_USERNAME", "DJANGO_SUPERUSER_EMAIL", "DJANGO_SUPERUSER_PASSWORD",
    "DOCKER_POSTGRES_PORT", "DOCKER_POSTGRES_HOSTNAME","POSTGRES_DB", "POSTGRES_USER", "POSTGRES_PASSWORD"
]

def check_environment_variables():
    for var in REQUIRED_ENV_VARS:
        if var not in os.environ:
            sys.exit(1)

# Wait for PostgreSQL to be ready
def wait_for_postgres():
    while True:
        try:
            conn = connect(
                dbname=os.getenv("POSTGRES_DB"),
                user=os.getenv("POSTGRES_USER"),
                password=os.getenv("POSTGRES_PASSWORD"),
                host=os.getenv("DOCKER_POSTGRES_HOSTNAME"),
                port=os.getenv("DOCKER_POSTGRES_PORT"),
            )
            conn.close()
            break
        except OperationalError:
            time.sleep(2)

# Wait for Redis to be ready
def wait_for_redis():
    DOCKER_REDIS_HOSTNAME=os.getenv('DOCKER_REDIS_HOSTNAME', '') #REDIS_HOST
    DOCKER_REDIS_PORT=os.getenv('DOCKER_REDIS_PORT', '') #REDIS_PORT
    redis_url = "redis://redis:6379"  # Update default URL
    if DOCKER_REDIS_HOSTNAME and DOCKER_REDIS_PORT:
        redis_url = f"redis://{DOCKER_REDIS_HOSTNAME}:{DOCKER_REDIS_PORT}"
    redis_client = Redis.from_url(redis_url)
    for attempt in range(10):
        try:
            redis_client.ping()
            return
        except Exception as e:
            time.sleep(2)
    sys.exit(1)

# Initialize Django
def initialize_django():

    # Ensure the environment is set up
    os.environ.setdefault("DJANGO_SETTINGS_MODULE", "core.settings")
    django.setup() # This will load the Django settings

    wait_for_postgres()

    wait_for_redis()

    try:
        call_command("makemigrations", "authentication")
        call_command("makemigrations", "chat")
        call_command("makemigrations", "game")
        call_command("makemigrations", "pong")
        call_command("migrate")
    except Exception as e:
        sys.exit(1)
    call_command("collectstatic", "--noinput") # the --noinput flag will prevent the command from asking for confirmation

def run_server():
    os.system("daphne -b 0.0.0.0 -p 8000 core.asgi:application")
    # os.system("python3 manage.py runserver 0.0.0.0:8000")

# Create a default superuser if none exists

def create_superuser():
    User = get_user_model()
    username = os.getenv("DJANGO_SUPERUSER_USERNAME", "admin")
    email = os.getenv("DJANGO_SUPERUSER_EMAIL", "admin@example.com")
    password = os.getenv("DJANGO_SUPERUSER_PASSWORD", "admin123")

    try:
        print("Creating default superuser...")
        if not User.objects.filter(username=username).exists():
            User.objects.create_superuser(
                username=username,
                email=email,
                password=password
            )
            print(f"Superuser '{username}' created successfully!")
        else:
            print(f"Superuser '{username}' already exists!")
    except Exception as e:
        print(f"Error creating superuser: {e}")


# Main function
def main():
    check_environment_variables()
    initialize_django()
    create_superuser()
    run_server()


if __name__ == "__main__":
    for var in REQUIRED_ENV_VARS:
        if var not in os.environ:
            raise RuntimeError(f"Required environment variable {var} is missing")
    main()