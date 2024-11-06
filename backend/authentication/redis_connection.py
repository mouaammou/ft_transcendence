import redis
import logging

# Initialize Redis connection
redis_conn = redis.StrictRedis(host='localhost', port=6379, db=0)

# Test the connection
try:
	redis_conn.flushdb()
	redis_conn.ping()
except redis.ConnectionError:
	logging.error("\nFailed to connect to Redis.\n")