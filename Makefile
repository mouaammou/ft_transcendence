#!/bin/bash

all:
	npx kill-port 3000
	cd frontend && npm run dev

back:
	cd backend && source venv/bin/activate &&  python manage.py runserver

clear_db:
	cd backend && source venv/bin/activate &&  python manage.py clear_db

redis:
<<<<<<< HEAD
	/Users/samjaabo/.brew/opt/redis/bin/redis-server /Users/samjaabo/.brew/etc/redis.conf
=======
	/Users/moouaamm/.brew/opt/redis/bin/redis-server /Users/moouaamm/.brew/etc/redis.conf

>>>>>>> 6d38ae8dd9c71535994a7b58e902408ccc6dbd47
