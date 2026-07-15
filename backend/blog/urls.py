from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import (
    ContentViewSet, BlogPostCreateView, VideoCreateView, 
    DocumentCreateView, CommentViewSet, CourseCreateView,
    ContentListView, ContentDetailView, CourseModulesView,
    CourseModuleDetailView, ModuleNavigationView, ModuleProgressView,
    SchemeListView, CourseListView, ChatbotContextView, ArtisanInquiryView,
    GovernmentSchemesProxyView, GovernmentArtisanBenefitsProxyView,
)

# Create a router for ViewSets
router = DefaultRouter()
router.register(r'content', ContentViewSet)
router.register(r'comments', CommentViewSet)

urlpatterns = [
    path('', include(router.urls)),
    path('list/', ContentListView.as_view(), name='content-list'),
    path('detail/<int:pk>/', ContentDetailView.as_view(), name='content-detail'),
    path('create/blog/', BlogPostCreateView.as_view(), name='create-blog'),
    path('create/video/', VideoCreateView.as_view(), name='create-video'),
    path('create/document/', DocumentCreateView.as_view(), name='create-document'),
    path('create/course/', CourseCreateView.as_view(), name='create-course'),
    path('course/<int:course_id>/modules/', CourseModulesView.as_view(), name='course-modules'),
    path('course_modules/<int:course_id>/', CourseModulesView.as_view(), name='course-modules-alt'),
    path('module/<int:module_id>/', CourseModuleDetailView.as_view(), name='module-detail'),
    path('module/<int:module_id>/navigation/', ModuleNavigationView.as_view(), name='module-navigation'),
    path('module/<int:module_id>/progress/', ModuleProgressView.as_view(), name='module-progress'),
    
    # Add new URL patterns for schemes and courses
    path('schemes/', SchemeListView.as_view(), name='schemes-list'),
    path('government-schemes/', GovernmentSchemesProxyView.as_view(), name='government-schemes-proxy'),
    path('government-artisan-benefits/', GovernmentArtisanBenefitsProxyView.as_view(), name='government-artisan-benefits-proxy'),
    path('courses/', CourseListView.as_view(), name='courses-list'),
    
    # New endpoint for chatbot context
    path('chatbot/context/', ChatbotContextView.as_view(), name='chatbot-context'),
    path('artisan-inquiries/', ArtisanInquiryView.as_view(), name='artisan-inquiries'),
]
