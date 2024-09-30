#!/bin/bash

all:
	cd frontend && npm run dev  &
	cd backend && python manage.py runserver

