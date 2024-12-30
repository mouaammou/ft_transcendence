import redis
import logging
from django.conf import settings

redis_conn = redis.StrictRedis(host=settings.DOCKER_REDIS_HOSTNAME, port=settings.DOCKER_REDIS_PORT, db=0)

try:
	redis_conn.flushdb()
except redis.ConnectionError:
	logging.error("\nFailed to connect to Redis.\n")