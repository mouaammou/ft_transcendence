import redis
import logging

# Initialize Redis connection
redis_conn = redis.StrictRedis(host='localhost', port=6379, db=0) # means db 0, the default database, can be changed to any other database
# redis_conn = redis.StrictRedis(host='redis', port=6379, db=0)

# Test the connection
try:
	# redis_conn.flushdb(): for testing purposes, it clears the database, use with caution
	# redis_conn.ping()
	redis_conn.flushdb()
except redis.ConnectionError:
	logging.error("\nFailed to connect to Redis.\n")