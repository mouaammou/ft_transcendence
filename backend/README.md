# backend structure here needed

python3 -m venv .venv
source .venv/bin/activate

pip install Django==5.0
pip install djangorestframework
pip install channels

django-admin startproject core .

goto core/settings.py scroll down to INSTALLED_APPS
and append this to the list.
INSTALLED_APPS = [
  ....,
  'rest_framework',
  'channels',
]

....
