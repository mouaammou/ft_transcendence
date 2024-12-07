#!/bin/bash

all:
	npx kill-port 3000
	cd frontend && npm run dev

back:
	cd backend && source venv/bin/activate &&  python manage.py runserver

clear_db:
	cd backend && source venv/bin/activate &&  python manage.py clear_db


redis:
	/Users/moouaamm/.brew/opt/redis/bin/redis-server /Users/moouaamm/.brew/etc/redis.conf

