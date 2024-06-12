# from django.test import TestCase

# def test_kargs(*args, **kwargs):
# 	for key, value in kwargs.items():
# 		print(f"{key} = {value}")
# 	for arg in args:
# 		print(arg)

# test_kargs(2,3,a="slala")

# def decorator(func):
# 	def wrapper(request, *args, **kwargs):
# 		print("Before function")
# 		# resutl = func(*args, **kwargs)
# 		# print(f"Result: {resutl}")
# 		for key, value in kwargs.items():
# 			print(f"{key} = {value}")
# 		print(f"request: {request}")
# 		print("After function")
# 	return wrapper

# @decorator
# def test_kargs(request):
# 	return True

# test_kargs("this is the requsest asi hemad")