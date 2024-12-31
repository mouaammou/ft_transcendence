import os
from dotenv import load_dotenv
from pathlib import Path
from datetime import timedelta
import sys

load_dotenv()
import certifi


os.environ['SSL_CERT_FILE'] = certifi.where()
# Build paths inside the project like this: BASE_DIR / 'subdir'.
BASE_DIR = Path(__file__).resolve().parent.parent

# all env variables used in the project
ALL_USED_ENV_VARS = [
	"DOMAIN_NAME",
	"DOCKER_REDIS_HOSTNAME",
	"DOCKER_REDIS_PORT",
    "SECRET_KEY",
    "DEBUG",
    "OAUTH42_CLIENT_ID",
    "OAUTH42_CLIENT_SECRET",
    "OAUTH42_REDIRECT_URI",
    "OAUTH42_AUTH_URL",
    "OAUTH42_TOKEN_URL",
    "OAUTH42_USER_URL",
    "EMAIL_HOST_USER",
    "EMAIL_HOST_PASSWORD",
    "POSTGRES_DB",
	"POSTGRES_USER",
	"POSTGRES_PASSWORD",
    "DOCKER_POSTGRES_PORT",
    "DOCKER_POSTGRES_HOSTNAME",
    "DOCKER_BACKEND_PORT",
    "DOCKER_BACKEND_HOSTNAME",
]

missing_vars = [var for var in ALL_USED_ENV_VARS if os.getenv(var) is None]

if missing_vars:
    print(f"Error: The following environment variables are not set: {', '.join(missing_vars)}", file=sys.stderr)
    sys.exit(1)


DOMAIN_NAME = os.getenv("DOMAIN_NAME")
DOCKER_REDIS_HOSTNAME=os.getenv('DOCKER_REDIS_HOSTNAME')
DOCKER_REDIS_PORT=os.getenv('DOCKER_REDIS_PORT')
SECRET_KEY = os.getenv("SECRET_KEY")
DEBUG = os.getenv("DEBUG", False)
# Set your 42 OAuth credentials
OAUTH42_CLIENT_ID = os.getenv("OAUTH42_CLIENT_ID")
OAUTH42_CLIENT_SECRET = os.getenv("OAUTH42_CLIENT_SECRET")
OAUTH42_REDIRECT_URI = os.getenv("OAUTH42_REDIRECT_URI")
OAUTH42_AUTH_URL = os.getenv("OAUTH42_AUTH_URL")
OAUTH42_TOKEN_URL = os.getenv("OAUTH42_TOKEN_URL")
OAUTH42_USER_URL = os.getenv("OAUTH42_USER_URL")

EMAIL_HOST_USER = os.getenv("EMAIL_HOST_USER")
EMAIL_HOST_PASSWORD = os.getenv("EMAIL_HOST_PASSWORD")

POSTGRES_DB=os.getenv("POSTGRES_DB")
POSTGRES_USER=os.getenv("POSTGRES_USER")
POSTGRES_PASSWORD=os.getenv("POSTGRES_PASSWORD")
DOCKER_POSTGRES_PORT=os.getenv("DOCKER_POSTGRES_PORT")
DOCKER_POSTGRES_HOSTNAME=os.getenv("DOCKER_POSTGRES_HOSTNAME")

DOCKER_BACKEND_PORT=os.getenv("DOCKER_BACKEND_PORT") #frontend will use this port to connect to backend
DOCKER_BACKEND_HOSTNAME=os.getenv("DOCKER_BACKEND_HOSTNAME") #frontend will use this hostname to connect to backend



SECURE_PROXY_SSL_HEADER = ('HTTP_X_FORWARDED_PROTO', 'https') # its is a https request from the client but it is forwarded to the backend as http request
# Ensure that cookies are only sent over HTTPS
SESSION_COOKIE_SECURE = True
CSRF_COOKIE_SECURE = True

ALLOWED_HOSTS = [
	DOMAIN_NAME,
    f"{DOCKER_BACKEND_HOSTNAME}",
]



AUTH_USER_MODEL = "authentication.CustomUser"

AUTHENTICATION_BACKENDS = [
	"django.contrib.auth.backends.ModelBackend",
]

# rest framework: simple jwt

# REST_FRAMEWORK = {
#     'DEFAULT_AUTHENTICATION_CLASSES': (
#         "rest_framework_simplejwt.authentication.JWTAuthentication",  # or JWTAuthentication if using JWT
#         'rest_framework.authentication.SessionAuthentication',
#     ),
#     'DEFAULT_PERMISSION_CLASSES': (
#         'rest_framework.permissions.IsAuthenticated',
#     ),
# }


REST_FRAMEWORK = {
	"DEFAULT_AUTHENTICATION_CLASSES": (
		"rest_framework_simplejwt.authentication.JWTAuthentication",
	),
	'DEFAULT_PAGINATION_CLASS': 'rest_framework.pagination.PageNumberPagination',
    'PAGE_SIZE': 10,
}

SIMPLE_JWT = {
	"AUTH_COOKIE": "jwt",
	"AUTH_COOKIE_SECURE": True,  # Change to True in production
	"AUTH_COOKIE_HTTP_ONLY": True,
	"AUTH_COOKIE_PATH": "/",
	"AUTH_COOKIE_SAMESITE": "Strict",  # Change to 'Strict' or 'None' as needed
	"ROTATE_REFRESH_TOKENS": True,
	'BLACKLIST_AFTER_ROTATION': True,
	'SIGNING_KEY': SECRET_KEY,
	"ALGORITHM": "HS256",
	"ACCESS_TOKEN_LIFETIME": timedelta(days=1),  # 1 hour
	"REFRESH_TOKEN_LIFETIME": timedelta(days=7),  # 1 week
}



## Email settings
EMAIL_BACKEND = 'django.core.mail.backends.smtp.EmailBackend'
EMAIL_HOST = 'smtp.gmail.com'
EMAIL_USE_TLS = True
EMAIL_PORT = 587



# Create token expiry time
PASSWORD_RESET_TIMEOUT = 3600  # 1 hour in seconds

INSTALLED_APPS = [
    'daphne',
    'channels',
    'django.contrib.admin',
    'django.contrib.auth',
    'django.contrib.contenttypes',
    'django.contrib.sessions',
    'django.contrib.messages',
    'django.contrib.staticfiles',
    'pong',
    'game',
    # 'game.apps.GameConfig',
    "authentication.apps.AuthenticationConfig",
    "rest_framework",
    "rest_framework_simplejwt",
    "corsheaders",
    "rest_framework_simplejwt.token_blacklist",
    "chat",
    "connect_four",
]

MIDDLEWARE = [
	"corsheaders.middleware.CorsMiddleware",
	'django.middleware.security.SecurityMiddleware',
	'django.contrib.sessions.middleware.SessionMiddleware',
	'django.middleware.common.CommonMiddleware',
	'django.middleware.csrf.CsrfViewMiddleware',
	'django.contrib.auth.middleware.AuthenticationMiddleware',
	'django.contrib.messages.middleware.MessageMiddleware',
	'django.middleware.clickjacking.XFrameOptionsMiddleware',
	"authentication.middleware.TokenVerificationMiddleWare",
	# "authentication.totp.middleware.TwoFactorAuthenticationMiddleware", 2fa middleware
]

ROOT_URLCONF = 'core.urls'

TEMPLATES = [
	{
		'BACKEND': 'django.template.backends.django.DjangoTemplates',
		'DIRS': [],
		'APP_DIRS': True,
		'OPTIONS': {
				'context_processors': [
					'django.template.context_processors.debug',
					'django.template.context_processors.request',
					'django.contrib.auth.context_processors.auth',
					'django.contrib.messages.context_processors.messages',
				],
		},
	},
]

WSGI_APPLICATION = 'core.wsgi.application'
ASGI_APPLICATION = 'core.asgi.application'

CHANNEL_LAYERS = {
	'default': {
		'BACKEND': 'channels_redis.core.RedisChannelLayer',
		'CONFIG': {
			"hosts": [(DOCKER_REDIS_HOSTNAME, DOCKER_REDIS_PORT)],
		},
	},
#  'default': {
# 		'BACKEND': 'channels_redis.core.RedisChannelLayer',
# 		'CONFIG': {
# 			"hosts": [('redis', 6379)],
# 		},
# 	},
	# 'default': {
	# 	'BACKEND': 'channels.layers.InMemoryChannelLayer',
	# },
}

#images settings
MEDIA_URL = 'backend-media/'
MEDIA_ROOT = os.path.join(BASE_DIR, 'media')


# Database
# https://docs.djangoproject.com/en/5.0/ref/settings/#databases

DATABASES = {
    'default': {
        'ENGINE': 'django.db.backends.postgresql',
        'NAME': POSTGRES_DB,
        'USER': POSTGRES_USER,
        'PASSWORD': POSTGRES_PASSWORD,
        'HOST': DOCKER_POSTGRES_HOSTNAME,  # Use the service name defined in docker-compose.yml
        'PORT': DOCKER_POSTGRES_PORT,
    }
}



# DATABASES = {
	
# 	'default': {
# 		'ENGINE': 'django.db.backends.sqlite3',
# 		'NAME': BASE_DIR / 'db.sqlite3',
# 	}
# }

CORS_ALLOWED_ORIGINS = [
	"https://" + DOMAIN_NAME,
]


CORS_ALLOW_METHODS = [
	'DELETE',
	'GET',
	'OPTIONS',
	'PATCH',
	'POST',
	'PUT',
]


# Password validation
# https://docs.djangoproject.com/en/5.0/ref/settings/#auth-password-validators

AUTH_PASSWORD_VALIDATORS = [
	{
		'NAME': 'django.contrib.auth.password_validation.UserAttributeSimilarityValidator',
	},
	{
		'NAME': 'django.contrib.auth.password_validation.MinimumLengthValidator',
	},
	{
		'NAME': 'django.contrib.auth.password_validation.CommonPasswordValidator',
	},
	{
		'NAME': 'django.contrib.auth.password_validation.NumericPasswordValidator',
	},
]


# Internationalization
# https://docs.djangoproject.com/en/5.0/topics/i18n/

LANGUAGE_CODE = 'en-us'

TIME_ZONE = "Africa/Casablanca"

USE_I18N = True

USE_TZ = True


# Static files (CSS, JavaScript, Images)
# https://docs.djangoproject.com/en/5.0/howto/static-files/

STATIC_URL = '/backend-static/'
# STATIC_ROOT = os.path.join(BASE_DIR, 'staticfiles')

# Default primary key field type
# https://docs.djangoproject.com/en/5.0/ref/settings/#default-auto-field

DEFAULT_AUTO_FIELD = 'django.db.models.BigAutoField'

CORS_ALLOW_CREDENTIALS = True
