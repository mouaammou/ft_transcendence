import redis
import logging
from django.conf import settings

redis_conn = redis.StrictRedis(host=settings.REDIS_HOST, port=settings.REDIS_PORT, db=0)

try:
	redis_conn.flushdb()
except redis.ConnectionError:
	logging.error("\nFailed to connect to Redis.\n")