#!/bin/bash

all:
	cd frontend && npm run dev  &

back:
	cd backend && source venv/bin/activate &&  python manage.py runserver

