#!/bin/bash

all:
	cd frontend && npm run dev

back:
	cd backend && source .venv/bin/activate &&  python manage.py runserver


redis:
	/Users/moouaamm/.brew/opt/redis/bin/redis-server /Users/moouaamm/.brew/etc/redis.conf
