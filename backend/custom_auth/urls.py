from django.urls import path
from .views import SignupView, LoginView, LogoutView, GetCSRFToken, UserView, PortfolioListCreateView, PortfolioDetailView, ArtistListView, ArtistDetailView, RazorpayOrderView

urlpatterns = [
    path('signup/', SignupView.as_view(), name='signup'),
    path('login/', LoginView.as_view(), name='login'),
    path('logout/', LogoutView.as_view(), name='logout'),
    path('get-csrf-token/', GetCSRFToken.as_view(), name='get-csrf-token'),
    path('payments/razorpay-order/', RazorpayOrderView.as_view(), name='razorpay-order'),
    path('user/', UserView.as_view(), name='user'),
    
    # Portfolio endpoints
    path('portfolio/', PortfolioListCreateView.as_view(), name='portfolio-list-create'),
    path('portfolio/<int:pk>/', PortfolioDetailView.as_view(), name='portfolio-detail'),
    
    # Artists endpoints
    path('artists/', ArtistListView.as_view(), name='artists-list'),
    path('artists/<int:pk>/', ArtistDetailView.as_view(), name='artist-detail'),
]
