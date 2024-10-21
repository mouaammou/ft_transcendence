import redis
import logging

# Initialize Redis connection
redis_conn = redis.StrictRedis(host='localhost', port=6379, db=0)

def reset_redis_cache():
	try:
		redis_conn.flushdb()
		logging.info("Redis cache has been reset.")
	except redis.ConnectionError as e:
		logging.error(f"Failed to reset Redis cache: {e}")

if __name__ == "__main__":
	reset_redis_cache()