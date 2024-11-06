# import redis
# import logging

# # Initialize Redis connection
# redis_conn = redis.StrictRedis(host='localhost', port=6379, db=0)

# # Test the connection
# try:
# 	# redis_conn.flushdb(): for testing purposes, it clears the database, use with caution
# 	redis_conn.flushdb()
# 	redis_conn.ping() # for testing purposes, it pings the server
# 	logging.info("\nConnected to Redis successfully.")
# except redis.ConnectionError:
# 	logging.error("\nFailed to connect to Redis.")