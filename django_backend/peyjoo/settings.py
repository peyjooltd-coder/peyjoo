import os
from pathlib import Path

BASE_DIR = Path(__file__).resolve().parent.parent

SECRET_KEY = os.environ.get(
    'DJANGO_SECRET_KEY',
    'peyjoo-django-admin-key-change-in-env',
)
DEBUG = os.environ.get('DJANGO_DEBUG', '1') == '1'
ALLOWED_HOSTS = [
    '127.0.0.1',
    'localhost',
    'peyjoo.com',
    'www.peyjoo.com',
]

INSTALLED_APPS = [
    'django.contrib.admin',
    'django.contrib.auth',
    'django.contrib.contenttypes',
    'django.contrib.sessions',
    'django.contrib.messages',
    'django.contrib.staticfiles',
    'core.apps.CoreConfig',
]

MIDDLEWARE = [
    'django.middleware.security.SecurityMiddleware',
    'django.contrib.sessions.middleware.SessionMiddleware',
    'django.middleware.common.CommonMiddleware',
    'django.middleware.csrf.CsrfViewMiddleware',
    'django.contrib.auth.middleware.AuthenticationMiddleware',
    'django.contrib.messages.middleware.MessageMiddleware',
    'django.middleware.clickjacking.XFrameOptionsMiddleware',
]

ROOT_URLCONF = 'peyjoo.urls'
WSGI_APPLICATION = 'peyjoo.wsgi.application'

TEMPLATES = [
    {
        'BACKEND': 'django.template.backends.django.DjangoTemplates',
        'DIRS': [],
        'APP_DIRS': True,
        'OPTIONS': {
            'context_processors': [
                'django.template.context_processors.request',
                'django.contrib.auth.context_processors.auth',
                'django.contrib.messages.context_processors.messages',
                'core.context.panel',
            ],
        },
    },
]

DATABASES = {
    'default': {
        'ENGINE': 'django.db.backends.sqlite3',
        'NAME': BASE_DIR / 'admin.sqlite3',
    },
    'app': {
        'ENGINE': 'django.db.backends.sqlite3',
        'NAME': BASE_DIR.parent / 'server' / 'data' / 'divar.db',
        'OPTIONS': {'timeout': 20},
    },
}

DATABASE_ROUTERS = ['core.router.AppDataRouter']

AUTH_PASSWORD_VALIDATORS = [
    {'NAME': 'django.contrib.auth.password_validation.UserAttributeSimilarityValidator'},
    {'NAME': 'django.contrib.auth.password_validation.MinimumLengthValidator'},
]

LANGUAGE_CODE = 'fa'
TIME_ZONE = 'America/Vancouver'
USE_I18N = True
USE_TZ = False

STATIC_URL = '/manage/static/'
DEFAULT_AUTO_FIELD = 'django.db.models.AutoField'

LOGIN_URL = '/manage/login/'
LOGIN_REDIRECT_URL = '/manage/'
LOGOUT_REDIRECT_URL = '/manage/login/'

SESSION_COOKIE_NAME = 'peyjoo_admin'
CSRF_COOKIE_NAME = 'peyjoo_csrf'
CSRF_TRUSTED_ORIGINS = [
    'https://peyjoo.com',
    'https://www.peyjoo.com',
    'http://127.0.0.1:8000',
    'http://localhost:8000',
]
