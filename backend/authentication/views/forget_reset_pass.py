from rest_framework import status
from rest_framework.response import Response
from rest_framework.views import APIView
from authentication.serializers import ForgotPasswordSerializer, ResetPasswordSerializer

class ForgotPasswordView(APIView):
    def post(self, request):
        serializer = ForgotPasswordSerializer(data=request.data)
        if serializer.is_valid():
            serializer.save()
            return Response({
                "message": "Password reset email has been sent."
            })
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

class ResetPasswordView(APIView):
    def post(self, request):
        serializer = ResetPasswordSerializer(data=request.data)
        if serializer.is_valid():
            serializer.save()
            return Response({
                "message": "Password has been reset successfully."
            })
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)