from django.http import JsonResponse
from django.views.decorators.csrf import ensure_csrf_cookie
from django.contrib.auth import authenticate, login, logout
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from rest_framework.permissions import IsAuthenticated, AllowAny
from rest_framework.authentication import SessionAuthentication, BasicAuthentication
from django.middleware.csrf import get_token
from django.utils.decorators import method_decorator
from django.views.decorators.csrf import csrf_exempt
from django.contrib.auth import get_user_model
from django.conf import settings
from django.core.validators import validate_email
from django.core.exceptions import ValidationError
from backend.security import clean_mapping, clean_text
from .models import CustomUser, Portfolio
from .serializers import PortfolioSerializer, CustomUserSerializer
from .throttles import LoginRateThrottle
from urllib import request as urlrequest
from urllib.error import HTTPError, URLError
import base64
import json
import time

User = get_user_model()

SUBSCRIPTION_PLANS = {
    "art-lover": {"name": "Art Lover", "amount": 9900},
    "event-access": {"name": "Event Access", "amount": 19900},
    "artist-pro": {"name": "Artist Pro", "amount": 29900},
}

@ensure_csrf_cookie
def get_csrf_token(request):
    return JsonResponse({'csrfToken': 'CSRF cookie set'})

class SignupView(APIView):
    permission_classes = [AllowAny]

    def post(self, request):
        try:
            data = clean_mapping(request.data, ["name", "email", "password", "user_type"], max_length=200)
        except ValueError as exc:
            return Response({"error": str(exc)}, status=status.HTTP_400_BAD_REQUEST)
        name = data.get("name")
        email = data.get("email", "").lower()
        password = data.get("password")
        user_type = data.get("user_type")

        try:
            validate_email(email)
        except ValidationError:
            return Response({"error": "Invalid email address"}, status=status.HTTP_400_BAD_REQUEST)

        if not password or len(password) > 128:
            return Response({"error": "Invalid password length"}, status=status.HTTP_400_BAD_REQUEST)

        if User.objects.filter(email=email).exists():
            return Response({"error": "Email already registered"}, status=status.HTTP_400_BAD_REQUEST)

        user = User.objects.create_user(
            username=email,
            email=email,
            name=name,
            password=password,
            user_type=user_type
        )
        return Response({"message": "User created successfully"}, status=status.HTTP_201_CREATED)

@method_decorator(csrf_exempt, name='dispatch')
class LoginView(APIView):
    permission_classes = [AllowAny]
    authentication_classes = []  # No authentication for login endpoint
    throttle_classes = [LoginRateThrottle]
    
    def post(self, request):
        try:
            data = clean_mapping(request.data, ["username", "password"], max_length=200)
            username = data.get('username')
            password = data.get('password')
            
            if username is None or password is None:
                return Response({'error': 'Please provide both username and password'},
                                status=status.HTTP_400_BAD_REQUEST)
            
            user = authenticate(username=username, password=password)
            
            if user is not None:
                login(request, user)
                return Response({'success': 'User authenticated'}, status=status.HTTP_200_OK)
            
            return Response({'error': 'Invalid credentials'}, status=status.HTTP_401_UNAUTHORIZED)
        except json.JSONDecodeError:
            return Response({'error': 'Invalid JSON format'}, status=status.HTTP_400_BAD_REQUEST)
        except Exception as e:
            print(f"Login error: {str(e)}")
            return Response({'error': 'An unexpected error occurred'}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

class LogoutView(APIView):
    def post(self, request):
        logout(request)
        return Response({'success': 'User logged out'}, status=status.HTTP_200_OK)

class RegisterView(APIView):
    permission_classes = [AllowAny]
    
    def post(self, request):
        try:
            data = clean_mapping(request.data, ["username", "email", "password", "name", "userType"], max_length=200)
        except ValueError as exc:
            return Response({"error": str(exc)}, status=status.HTTP_400_BAD_REQUEST)
        username = data.get('username')
        email = data.get('email', '').lower()
        password = data.get('password')
        name = data.get('name')
        user_type = data.get('userType', 'user')
        
        if not username or not email or not password:
            return Response({'error': 'Please provide username, email, and password'},
                            status=status.HTTP_400_BAD_REQUEST)

        try:
            validate_email(email)
        except ValidationError:
            return Response({"error": "Invalid email address"}, status=status.HTTP_400_BAD_REQUEST)

        if len(password) > 128:
            return Response({"error": "Invalid password length"}, status=status.HTTP_400_BAD_REQUEST)
        
        if CustomUser.objects.filter(username=username).exists():
            return Response({'error': 'Username already exists'}, status=status.HTTP_400_BAD_REQUEST)
        
        if CustomUser.objects.filter(email=email).exists():
            return Response({'error': 'Email already exists'}, status=status.HTTP_400_BAD_REQUEST)
        
        user = CustomUser.objects.create_user(
            username=username,
            email=email,
            password=password,
            name=name,
            user_type=user_type
        )
        
        return Response({'success': 'User created successfully'}, status=status.HTTP_201_CREATED)

class UserView(APIView):
    """Get current user information"""
    authentication_classes = [SessionAuthentication, BasicAuthentication]
    permission_classes = [IsAuthenticated]
    
    def get(self, request):
        user = request.user
        return Response({
            'id': user.id,
            'username': user.username,
            'email': user.email,
            'name': user.name,
            'user_type': user.user_type
        })

class GetCSRFToken(APIView):
    def get(self, request):
        csrf_token = get_token(request)
        return JsonResponse({'csrfToken': csrf_token})

@method_decorator(csrf_exempt, name='dispatch')
class RazorpayOrderView(APIView):
    permission_classes = [AllowAny]
    authentication_classes = []

    def post(self, request):
        try:
            data = clean_mapping(request.data, ["plan_id", "email", "payment_method"], max_length=200)
        except ValueError as exc:
            return Response({"error": str(exc)}, status=status.HTTP_400_BAD_REQUEST)

        plan_id = data.get("plan_id")
        email = data.get("email", "").lower()
        payment_method = data.get("payment_method", "razorpay")
        plan = SUBSCRIPTION_PLANS.get(plan_id)

        if not plan:
            return Response({"error": "Invalid subscription plan"}, status=status.HTTP_400_BAD_REQUEST)

        try:
            validate_email(email)
        except ValidationError:
            return Response({"error": "Invalid email address"}, status=status.HTTP_400_BAD_REQUEST)

        if payment_method not in {"razorpay", "card"}:
            return Response({"error": "Invalid payment method"}, status=status.HTTP_400_BAD_REQUEST)

        if not settings.RAZORPAY_KEY_ID or not settings.RAZORPAY_KEY_SECRET:
            return Response({
                "configured": False,
                "message": "Razorpay keys are not configured on the backend.",
                "key_id": "",
                "order_id": "",
                "amount": plan["amount"],
                "currency": "INR",
                "plan": {"id": plan_id, "name": plan["name"]},
            }, status=status.HTTP_200_OK)

        payload = json.dumps({
            "amount": plan["amount"],
            "currency": "INR",
            "receipt": f"kalashaala-{plan_id}-{int(time.time())}",
            "notes": {
                "email": email,
                "plan_id": plan_id,
                "payment_method": payment_method,
            },
        }).encode("utf-8")

        credentials = f"{settings.RAZORPAY_KEY_ID}:{settings.RAZORPAY_KEY_SECRET}".encode("utf-8")
        auth_header = base64.b64encode(credentials).decode("ascii")
        req = urlrequest.Request(
            "https://api.razorpay.com/v1/orders",
            data=payload,
            method="POST",
            headers={
                "Authorization": f"Basic {auth_header}",
                "Content-Type": "application/json",
            },
        )

        try:
            with urlrequest.urlopen(req, timeout=15) as response:
                order = json.loads(response.read().decode("utf-8"))
        except HTTPError as exc:
            detail = exc.read().decode("utf-8", errors="replace")
            return Response({"error": "Razorpay order creation failed", "detail": detail}, status=status.HTTP_502_BAD_GATEWAY)
        except URLError:
            return Response({"error": "Unable to reach Razorpay"}, status=status.HTTP_502_BAD_GATEWAY)

        return Response({
            "configured": True,
            "key_id": settings.RAZORPAY_KEY_ID,
            "order_id": order.get("id"),
            "amount": order.get("amount", plan["amount"]),
            "currency": order.get("currency", "INR"),
            "plan": {"id": plan_id, "name": plan["name"]},
        }, status=status.HTTP_201_CREATED)

class PortfolioListCreateView(APIView):
    """API view to list and create portfolio items"""
    authentication_classes = [SessionAuthentication, BasicAuthentication]
    permission_classes = [IsAuthenticated]
    
    def get(self, request):
        """Get portfolio items for the current authenticated user"""
        # By default, get the current user's portfolio
        user_id = request.query_params.get('user_id', None)
        
        if user_id and user_id != str(request.user.id):
            # If a specific user's portfolio is requested, check that user exists
            try:
                user = User.objects.get(id=user_id)
                # Only retrieve portfolio if the requested user is an artist
                if user.user_type != 'artist':
                    return Response(
                        {"error": "The requested user is not an artist"}, 
                        status=status.HTTP_400_BAD_REQUEST
                    )
                portfolio_items = Portfolio.objects.filter(user=user)
            except User.DoesNotExist:
                return Response(
                    {"error": "User not found"}, 
                    status=status.HTTP_404_NOT_FOUND
                )
        else:
            # Get the current user's portfolio
            portfolio_items = Portfolio.objects.filter(user=request.user)
        
        serializer = PortfolioSerializer(portfolio_items, many=True)
        return Response(serializer.data)
    
    def post(self, request):
        """Create a new portfolio item for the current user"""
        # Check if user is an artist
        if request.user.user_type != 'artist':
            return Response(
                {"error": "Only artists can create portfolio items"}, 
                status=status.HTTP_403_FORBIDDEN
            )
        
        # Add the user to the data
        data = request.data.copy()
        serializer = PortfolioSerializer(data=data)
        
        if serializer.is_valid():
            serializer.save(user=request.user)
            return Response(serializer.data, status=status.HTTP_201_CREATED)
        
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


class PortfolioDetailView(APIView):
    """API view to retrieve, update and delete individual portfolio items"""
    authentication_classes = [SessionAuthentication, BasicAuthentication]
    permission_classes = [IsAuthenticated]
    
    def get_object(self, pk, user):
        """Helper method to get portfolio item and check permissions"""
        try:
            portfolio = Portfolio.objects.get(pk=pk)
            # Check if the portfolio belongs to the user or is public (anyone can view)
            if portfolio.user != user and user.user_type != 'artist':
                return None, Response(
                    {"error": "You don't have permission to access this portfolio item"}, 
                    status=status.HTTP_403_FORBIDDEN
                )
            return portfolio, None
        except Portfolio.DoesNotExist:
            return None, Response(
                {"error": "Portfolio item not found"}, 
                status=status.HTTP_404_NOT_FOUND
            )
    
    def get(self, request, pk):
        """Get a specific portfolio item"""
        portfolio, error_response = self.get_object(pk, request.user)
        if error_response:
            return error_response
        
        serializer = PortfolioSerializer(portfolio)
        return Response(serializer.data)
    
    def put(self, request, pk):
        """Update a specific portfolio item"""
        portfolio, error_response = self.get_object(pk, request.user)
        if error_response:
            return error_response
        
        # Only the owner can update their portfolio
        if portfolio.user != request.user:
            return Response(
                {"error": "You don't have permission to update this portfolio item"}, 
                status=status.HTTP_403_FORBIDDEN
            )
        
        serializer = PortfolioSerializer(portfolio, data=request.data, partial=True)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data)
        
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
    
    def delete(self, request, pk):
        """Delete a specific portfolio item"""
        portfolio, error_response = self.get_object(pk, request.user)
        if error_response:
            return error_response
        
        # Only the owner can delete their portfolio
        if portfolio.user != request.user:
            return Response(
                {"error": "You don't have permission to delete this portfolio item"}, 
                status=status.HTTP_403_FORBIDDEN
            )
        
        portfolio.delete()
        return Response(status=status.HTTP_204_NO_CONTENT)

class ArtistListView(APIView):
    """API view to list all artists with their portfolio items"""
    permission_classes = [AllowAny]  # Allow anyone to view artists
    
    def get(self, request):
        """Get all users with 'artist' user type and their portfolio items"""
        artists = User.objects.filter(user_type='artist')
        
        artists_data = []
        for artist in artists:
            # Get basic user data
            artist_data = {
                'id': artist.id,
                'name': artist.name or artist.username,
                'username': artist.username,
                'email': artist.email,
                'profile_image': None,  # You can add profile image later
                'location': '',  # Add location field to User model if needed
                'art_style': '',  # Add art_style field to User model if needed
            }
            
            # Get portfolio items for this artist
            portfolio_items = Portfolio.objects.filter(user=artist)
            serializer = PortfolioSerializer(portfolio_items, many=True)
            artist_data['portfolio_items'] = serializer.data
            
            # Add to results list
            artists_data.append(artist_data)
        
        return Response(artists_data)


class ArtistDetailView(APIView):
    """API view to get details of a specific artist with their portfolio"""
    permission_classes = [AllowAny]  # Allow anyone to view artist details
    
    def get(self, request, pk):
        """Get a specific artist by ID with their portfolio items"""
        try:
            artist = User.objects.get(pk=pk, user_type='artist')
        except User.DoesNotExist:
            return Response({"error": "Artist not found"}, status=status.HTTP_404_NOT_FOUND)
        
        # Get basic user data
        artist_data = {
            'id': artist.id,
            'name': artist.name or artist.username,
            'username': artist.username,
            'email': artist.email,
            'profile_image': None,  # You can add profile image later
            'location': '',  # Add location field to User model if needed
            'art_style': '',  # Add art_style field to User model if needed
        }
        
        # Get portfolio items for this artist
        portfolio_items = Portfolio.objects.filter(user=artist)
        serializer = PortfolioSerializer(portfolio_items, many=True)
        artist_data['portfolio_items'] = serializer.data
        
        return Response(artist_data)
