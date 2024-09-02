#!/bin/bash

all:
	cd frontend && npm run dev > /dev/null  &
	cd backend && python manage.py runserver

