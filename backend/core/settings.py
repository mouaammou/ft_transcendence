import os
from dotenv import load_dotenv
from pathlib import Path
from datetime import timedelta

load_dotenv()
import certifi

os.environ['SSL_CERT_FILE'] = certifi.where()
# Build paths inside the project like this: BASE_DIR / 'subdir'.
BASE_DIR = Path(__file__).resolve().parent.parent

BACKEND_BASE_URL = os.environ.get('BACKEND_BASE_URL', 'http://localhost:8000')


# Quick-start development settings - unsuitable for production
# See https://docs.djangoproject.com/en/5.0/howto/deployment/checklist/

# SECURITY WARNING: keep the secret key used in production secret!
SECRET_KEY = os.getenv("SECRET_KEY")

# SECURITY WARNING: don't run with debug turned on in production!
DEBUG = True

ALLOWED_HOSTS = ['*']

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
	"AUTH_COOKIE_SECURE": False,  # Change to True in production
	"AUTH_COOKIE_HTTP_ONLY": True,
	"AUTH_COOKIE_PATH": "/",
	"AUTH_COOKIE_SAMESITE": "Lax",  # Change to 'Strict' or 'None' as needed
	"ROTATE_REFRESH_TOKENS": True,
	'BLACKLIST_AFTER_ROTATION': True,
	'SIGNING_KEY': SECRET_KEY,
	"ALGORITHM": "HS256",
	"ACCESS_TOKEN_LIFETIME": timedelta(days=1),  # 1 hour
	"REFRESH_TOKEN_LIFETIME": timedelta(days=7),  # 1 week
}

# Set your 42 OAuth credentials
OAUTH42_CLIENT_ID = os.getenv("OAUTH42_CLIENT_ID")
OAUTH42_CLIENT_SECRET = os.getenv("OAUTH42_CLIENT_SECRET")
OAUTH42_REDIRECT_URI = os.getenv("OAUTH42_REDIRECT_URI")
OAUTH42_AUTH_URL = os.getenv("OAUTH42_AUTH_URL")
OAUTH42_TOKEN_URL = os.getenv("OAUTH42_TOKEN_URL")
OAUTH42_USER_URL = os.getenv("OAUTH42_USER_URL")

## Email settings
EMAIL_BACKEND = 'django.core.mail.backends.smtp.EmailBackend'
EMAIL_HOST = 'smtp.gmail.com'
EMAIL_USE_TLS = True
EMAIL_PORT = 587
EMAIL_HOST_USER = os.getenv("EMAIL_HOST_USER")
EMAIL_HOST_PASSWORD = os.getenv("EMAIL_HOST_PASSWORD")

# Frontend URL for reset link
FRONTEND_URL = os.getenv('FRONTEND_URL', default='http://localhost:3000')
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
			# "hosts": [('redis', 6379)],
			"hosts": [('localhost', 6379)],
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
MEDIA_URL = '/media/'
MEDIA_ROOT = os.path.join(BASE_DIR, 'media')


# Database
# https://docs.djangoproject.com/en/5.0/ref/settings/#databases

# DATABASES = {
#     'default': {
#         'ENGINE': 'django.db.backends.postgresql',
#         'NAME': "ft_transcendence",
#         'USER': os.getenv('POSTGRES_USER'),
#         'PASSWORD': os.getenv('POSTGRES_PASSWORD'),
#         'HOST': 'postgres',  # Use the service name defined in docker-compose.yml
#         'PORT': os.getenv('POSTGRES_PORT'),
#     }
# }

DATABASES = {
	
	'default': {
		'ENGINE': 'django.db.backends.sqlite3',
		'NAME': BASE_DIR / 'db.sqlite3',
	}
}

CORS_ALLOWED_ORIGINS = [
    "https://localhost",
    "http://localhost",
    "http://frontend:3000",
    "https://frontend:3000",
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

STATIC_URL = '/static/'
# STATIC_ROOT = os.path.join(BASE_DIR, 'staticfiles')

# Default primary key field type
# https://docs.djangoproject.com/en/5.0/ref/settings/#default-auto-field

DEFAULT_AUTO_FIELD = 'django.db.models.BigAutoField'

CORS_ALLOW_CREDENTIALS = True
# CORS_ALLOW_ALL_ORIGINS = True
# CORS_ALLOW_ALL_ORIGINS = True


# CORS_ALLOW_HEADERS = [
#     'content-type',
#     'x-csrftoken',
#     'authorization',  # Allow Authorization header if needed
# ]

# CORS_EXPOSE_HEADERS = [
#     'X-CSRFToken',
#     'Set-Cookie',  # Expose the Set-Cookie header if you're using session cookies
# ]
