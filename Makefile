#!/bin/bash

all:
	ps aux | grep 'T' 
	cd frontend && npm run dev  &
	cd backend && python manage.py runserver

