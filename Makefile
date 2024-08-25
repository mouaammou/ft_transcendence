#!/bin/bash

all:
	cd frontend && npm run dev > /dev/null 2>&1 &
	cd backend && python manage.py runserver

