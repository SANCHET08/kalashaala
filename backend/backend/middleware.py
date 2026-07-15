# This file can be used to define custom middleware for the KalaShala application
# Currently no custom middleware is in use

# Example middleware template for future use if needed:
# 
# class CustomMiddleware:
#     def __init__(self, get_response):
#         self.get_response = get_response
# 
#     def __call__(self, request):
#         # Code to be executed before the view (and other middleware) is called
#         response = self.get_response(request)
#         # Code to be executed after the view is called
#         return response