from django.shortcuts import render, get_object_or_404
from django.conf import settings
from rest_framework import viewsets, permissions, status, generics, filters, authentication
from rest_framework.response import Response
from rest_framework.decorators import action
from rest_framework.parsers import MultiPartParser, FormParser
from django.views.decorators.csrf import csrf_exempt
from django.utils.decorators import method_decorator
from rest_framework.views import APIView
from django.db.models import Q
from urllib.parse import urlencode
from urllib.request import urlopen, Request
from urllib.error import URLError, HTTPError
import json
from backend.security import clean_mapping, clean_text
from .models import (
    Content, BlogPost, Video, Document, Course, CourseModule, Comment
)
from .serializers import (
    ContentSerializer, BlogPostSerializer, VideoSerializer, DocumentSerializer,
    CourseSerializer, CourseModuleSerializer,
    CommentSerializer, BlogPostCreateSerializer, VideoCreateSerializer, DocumentCreateSerializer,
    CourseCreateSerializer
)

class ContentListView(generics.ListAPIView):
    """
    View for listing content with filtering options
    This view specifically handles the /list/ endpoint
    """
    serializer_class = ContentSerializer
    permission_classes = [permissions.IsAuthenticatedOrReadOnly]
    filter_backends = [filters.SearchFilter]
    search_fields = ['title', 'description', 'tags']
    
    def get_queryset(self):
        queryset = Content.objects.all()
        
        # Filter by content_type (primary filter used by the frontend)
        content_type = self.request.query_params.get('content_type', None)
        if content_type:
            queryset = queryset.filter(content_type=content_type)
            # For non-course content types, also ensure we're not showing any course content
            if content_type != 'course':
                queryset = queryset.exclude(content_type='course')
        
        # Filter by category
        category = self.request.query_params.get('category', None)
        if category:
            queryset = queryset.filter(category=category)
        
        # Filter by tag
        tag = self.request.query_params.get('tag', None)
        if tag:
            queryset = queryset.filter(tags__icontains=tag)
            
        # Filter by search query
        query = self.request.query_params.get('q', None)
        if query:
            queryset = queryset.filter(
                Q(title__icontains=query) | 
                Q(description__icontains=query) | 
                Q(tags__icontains=query)
            )
        
        return queryset
    
    def list(self, request, *args, **kwargs):
        """Override the list method to safely handle serialization"""
        queryset = self.filter_queryset(self.get_queryset())
        
        try:
            page = self.paginate_queryset(queryset)
            if page is not None:
                serializer = self.get_serializer(page, many=True)
                return self.get_paginated_response(serializer.data)
                
            serializer = self.get_serializer(queryset, many=True)
            return Response(serializer.data)
        except Exception as e:
            # Fallback to a simpler representation if full serialization fails
            simple_data = []
            for item in queryset:
                item_data = {
                    'id': item.id,
                    'title': item.title,
                    'description': item.description,
                    'category': item.category,
                    'content_type': item.content_type,
                    'slug': item.slug,
                    'upload_date': item.upload_date,
                    'thumbnail': str(item.thumbnail) if item.thumbnail else None,
                }
                
                # Include contributor information if available
                if hasattr(item, 'contributor') and item.contributor:
                    item_data['contributor'] = {
                        'id': item.contributor.id,
                        'username': item.contributor.username,
                        'name': getattr(item.contributor, 'name', '')
                    }
                
                simple_data.append(item_data)
            
            return Response(simple_data)

class ContentViewSet(viewsets.ModelViewSet):
    """
    ViewSet for listing and retrieving all content types
    """
    queryset = Content.objects.all()
    serializer_class = ContentSerializer
    permission_classes = [permissions.IsAuthenticatedOrReadOnly]
    filter_backends = [filters.SearchFilter]
    search_fields = ['title', 'description', 'tags']
    
    def get_queryset(self):
        queryset = Content.objects.all()
        
        # Filter by content_type (primary filter used by the frontend)
        content_type = self.request.query_params.get('content_type', None)
        if content_type:
            queryset = queryset.filter(content_type=content_type)
            # For non-course content types, also ensure we're not showing any course content
            if content_type != 'course':
                queryset = queryset.exclude(content_type='course')
                
        # Filter by category
        category = self.request.query_params.get('category', None)
        if category:
            queryset = queryset.filter(category=category)
        
        # Featured content
        is_featured = self.request.query_params.get('featured', None)
        if is_featured == 'true':
            queryset = queryset.filter(is_featured=True)
        
        # Filter by tag
        tag = self.request.query_params.get('tag', None)
        if tag:
            queryset = queryset.filter(tags__icontains=tag)
        
        return queryset
    
    def list(self, request, *args, **kwargs):
        """Override the list method to safely handle serialization"""
        queryset = self.filter_queryset(self.get_queryset())
        
        try:
            page = self.paginate_queryset(queryset)
            if page is not None:
                serializer = self.get_serializer(page, many=True)
                return self.get_paginated_response(serializer.data)
                
            serializer = self.get_serializer(queryset, many=True)
            return Response(serializer.data)
        except Exception as e:
            # Fallback to a simpler representation if full serialization fails
            simple_data = []
            for item in queryset:
                item_data = {
                    'id': item.id,
                    'title': item.title,
                    'description': item.description,
                    'category': item.category,
                    'content_type': item.content_type,
                    'slug': item.slug,
                    'upload_date': item.upload_date,
                    'thumbnail': str(item.thumbnail) if item.thumbnail else None,
                }
                
                # Include contributor information if available
                if hasattr(item, 'contributor') and item.contributor:
                    item_data['contributor'] = {
                        'id': item.contributor.id,
                        'username': item.contributor.username,
                        'name': item.contributor.name
                    }
                
                simple_data.append(item_data)
            
            return Response(simple_data)
    
    def retrieve(self, request, *args, **kwargs):
        """Override the retrieve method to safely handle serialization of individual content items"""
        instance = self.get_object()
        
        try:
            serializer = self.get_serializer(instance)
            return Response(serializer.data)
        except Exception as e:
            # Fallback to a simpler representation if full serialization fails
            simple_data = {
                'id': instance.id,
                'title': instance.title,
                'description': instance.description,
                'category': instance.category,
                'content_type': instance.content_type,
                'slug': instance.slug,
                'upload_date': instance.upload_date,
                'last_updated': instance.last_updated,
                'tags': instance.tags,
                'is_featured': instance.is_featured,
                'view_count': instance.view_count,
                'download_count': instance.download_count,
                'thumbnail': str(instance.thumbnail) if instance.thumbnail else None,
            }
            
            # Add content-specific data based on content type
            if instance.content_type == 'blog':
                try:
                    blog_post = instance.blog_details.first()
                    if blog_post:
                        simple_data['text_content'] = blog_post.text_content
                        simple_data['summary'] = blog_post.summary
                except:
                    pass
                    
            elif instance.content_type == 'video':
                try:
                    video = instance.video_details.first()
                    if video:
                        simple_data['video_url'] = video.video_url
                        simple_data['video_file'] = str(video.video_file) if video.video_file else None
                except:
                    pass
                    
            elif instance.content_type == 'pdf':
                try:
                    document = instance.document_details.first()
                    if document:
                        simple_data['document_file'] = str(document.document_file) if document.document_file else None
                except:
                    pass
            
            # Add contributor information if available
            try:
                simple_data['contributor'] = {
                    'id': instance.contributor.id,
                    'username': instance.contributor.username,
                    'name': instance.contributor.name
                }
            except:
                pass
                
            return Response(simple_data)
    
    @method_decorator(csrf_exempt)
    @action(detail=True, methods=['post'], authentication_classes=[], permission_classes=[])
    def increment_view(self, request, pk=None):
        content = self.get_object()
        content.view_count += 1
        content.save()
        return Response({'status': 'view count incremented'})
    
    @method_decorator(csrf_exempt)
    @action(detail=True, methods=['post'], authentication_classes=[], permission_classes=[])
    def increment_download(self, request, pk=None):
        content = self.get_object()
        content.download_count += 1
        content.save()
        return Response({'status': 'download count incremented'})

class BlogPostCreateView(generics.CreateAPIView):
    """
    View for creating blog posts
    """
    serializer_class = BlogPostCreateSerializer
    parser_classes = [MultiPartParser, FormParser]
    permission_classes = [permissions.IsAuthenticated]
    
    def create(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        content = serializer.save()
        
        # Use ContentSerializer to serialize the response
        # Make sure we pass the actual model instance, not a string or other type
        content_serializer = ContentSerializer(instance=content)
        
        # Return a simple response with just the ID for now to avoid serialization issues
        return Response({"id": content.id, "message": "Blog post created successfully"}, 
                        status=status.HTTP_201_CREATED)

class VideoCreateView(generics.CreateAPIView):
    """
    View for creating video content
    """
    serializer_class = VideoCreateSerializer
    parser_classes = [MultiPartParser, FormParser]
    permission_classes = [permissions.IsAuthenticated]
    
    def create(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        content = serializer.save()
        
        # Return a simple response to avoid serialization issues
        return Response({"id": content.id, "message": "Video content created successfully"}, 
                        status=status.HTTP_201_CREATED)

class DocumentCreateView(generics.CreateAPIView):
    """
    View for creating document/PDF content
    """
    serializer_class = DocumentCreateSerializer
    parser_classes = [MultiPartParser, FormParser]
    permission_classes = [permissions.IsAuthenticated]
    
    def create(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        content = serializer.save()
        
        # Return a simple response to avoid serialization issues
        return Response({"id": content.id, "message": "Document content created successfully"}, 
                        status=status.HTTP_201_CREATED)

class CourseCreateView(generics.CreateAPIView):
    """
    View for creating courses with modules
    """
    serializer_class = CourseCreateSerializer
    parser_classes = [MultiPartParser, FormParser]
    permission_classes = [permissions.IsAuthenticated]
    
    def create(self, request, *args, **kwargs):
        # Log the request data for debugging
        print("Course Create Request Data:", request.data)
        print("Course Create Files:", request.FILES)

        # Check if modules is provided as a string and attempt to parse it
        if 'modules' in request.data and isinstance(request.data['modules'], str):
            try:
                import json
                print("Attempting to parse modules JSON")
                json_data = json.loads(request.data['modules'])
                print("Parsed modules JSON successfully:", json_data)
            except json.JSONDecodeError as e:
                print("Error parsing modules JSON:", str(e))
                return Response({"error": "Invalid modules JSON format"}, status=status.HTTP_400_BAD_REQUEST)
                
        # Process the request with the serializer
        serializer = self.get_serializer(data=request.data)
        
        try:
            serializer.is_valid(raise_exception=True)
        except Exception as e:
            print("Serializer validation error:", str(e))
            return Response({"error": str(e)}, status=status.HTTP_400_BAD_REQUEST)
            
        try:
            content = serializer.save()
            # Return a simple response
            return Response({
                "id": content.id, 
                "message": "Course created successfully",
                "course_id": content.course_details.first().id if content.course_details.first() else None
            }, status=status.HTTP_201_CREATED)
        except Exception as e:
            print("Error creating course:", str(e))
            return Response({"error": str(e)}, status=status.HTTP_400_BAD_REQUEST)

class CommentViewSet(viewsets.ModelViewSet):
    """
    ViewSet for handling comments on content
    """
    queryset = Comment.objects.all()
    serializer_class = CommentSerializer
    permission_classes = [permissions.IsAuthenticatedOrReadOnly]
    
    def get_queryset(self):
        # Only return top-level comments (without a parent)
        return Comment.objects.filter(parent=None)
    
    def perform_create(self, serializer):
        content_id = self.request.data.get('content')
        content = get_object_or_404(Content, id=content_id)
        serializer.save(user=self.request.user, content=content)

class ContentDetailView(generics.RetrieveAPIView):
    """
    View for retrieving a single content item by ID
    """
    queryset = Content.objects.all()
    serializer_class = ContentSerializer
    permission_classes = [permissions.IsAuthenticatedOrReadOnly]
    
    def retrieve(self, request, *args, **kwargs):
        """Override the retrieve method to safely handle serialization of individual content items"""
        instance = self.get_object()
        
        try:
            serializer = self.get_serializer(instance)
            return Response(serializer.data)
        except Exception as e:
            # Fallback to a simpler representation if full serialization fails
            simple_data = {
                'id': instance.id,
                'title': instance.title,
                'description': instance.description,
                'category': instance.category,
                'content_type': instance.content_type,
                'slug': instance.slug,
                'upload_date': instance.upload_date,
                'thumbnail': str(instance.thumbnail) if instance.thumbnail else None,
            }
            
            # Include contributor information if available
            if hasattr(instance, 'contributor') and instance.contributor:
                simple_data['contributor'] = {
                    'id': instance.contributor.id,
                    'username': instance.contributor.username,
                    'name': getattr(instance.contributor, 'name', '')
                }
            
            # Include specific content type data based on the content type
            if instance.content_type == 'course':
                try:
                    # Fix: Use content=instance instead of content_ptr=instance.id
                    course = Course.objects.get(content=instance)
                    simple_data['price'] = course.price
                    simple_data['duration'] = course.duration
                    simple_data['is_free'] = course.is_free
                    
                    # Include modules if they exist
                    modules = CourseModule.objects.filter(course=course)
                    simple_data['modules'] = []
                    for module in modules:
                        module_data = {
                            'id': module.id,
                            'title': module.title,
                            'description': module.description,
                            'order': module.order,
                            'duration': module.duration
                        }
                        simple_data['modules'].append(module_data)
                except Course.DoesNotExist:
                    pass
            
            return Response(simple_data)

class CourseModulesView(generics.ListAPIView):
    """
    View for retrieving all modules for a specific course
    """
    serializer_class = CourseModuleSerializer
    permission_classes = [permissions.IsAuthenticatedOrReadOnly]
    
    def get_queryset(self):
        course_id = self.kwargs.get('course_id')
        try:
            # First try to get the course directly using the ID
            course = Course.objects.filter(id=course_id).first()
            if course:
                return CourseModule.objects.filter(course=course).order_by('order')
                
            # If course not found by ID, try to get by content ID
            content = Content.objects.filter(id=course_id).first()
            if content:
                print(f"Found content with ID {course_id}, title: {content.title}")
                course = Course.objects.filter(content=content).first()
                if course:
                    print(f"Found related course with ID: {course.id}")
                    return CourseModule.objects.filter(course=course).order_by('order')
                else:
                    print(f"No course found for content ID {course_id}")
            
            # If we get here, no course was found
            from django.http import Http404
            raise Http404(f"Course not found for id {course_id}")
                
        except Exception as e:
            print(f"Error in CourseModulesView: {str(e)}")
            from django.http import Http404
            raise Http404(f"Error retrieving course modules: {str(e)}")

class CourseModuleDetailView(generics.RetrieveAPIView):
    """
    View for retrieving a specific course module with all its content details
    """
    serializer_class = CourseModuleSerializer
    permission_classes = [permissions.IsAuthenticatedOrReadOnly]
    
    def get_object(self):
        module_id = self.kwargs.get('module_id')
        return get_object_or_404(CourseModule, id=module_id)
    
    def retrieve(self, request, *args, **kwargs):
        instance = self.get_object()
        
        try:
            serializer = self.get_serializer(instance)
            data = serializer.data
            
            # Add detailed content based on content_type
            if instance.content_type == 'video':
                if instance.video_url:
                    data['video_url'] = instance.video_url
                if instance.video_file:
                    data['video_file'] = request.build_absolute_uri(instance.video_file.url) if instance.video_file else None
            elif instance.content_type == 'blog':
                # Include both blog_content and text_content for compatibility
                if instance.text_content:
                    data['blog_content'] = instance.text_content
                    data['text_content'] = instance.text_content
            elif instance.content_type == 'pdf':
                if instance.document_file:
                    data['document_file'] = request.build_absolute_uri(instance.document_file.url) if instance.document_file else None
            
            return Response(data)
        except Exception as e:
            return Response({
                'error': str(e),
                'id': instance.id,
                'title': instance.title,
                'description': instance.description,
                'content_type': instance.content_type
            }, status=status.HTTP_200_OK)

class ModuleNavigationView(generics.RetrieveAPIView):
    """
    View for getting navigation information (previous and next modules) for a given module
    """
    permission_classes = [permissions.IsAuthenticatedOrReadOnly]
    
    def retrieve(self, request, *args, **kwargs):
        module_id = self.kwargs.get('module_id')
        current_module = get_object_or_404(CourseModule, id=module_id)
        course = current_module.course
        
        # Get all modules for the course ordered by 'order' field
        all_modules = CourseModule.objects.filter(course=course).order_by('order')
        
        # Find previous and next modules
        previous_module = None
        next_module = None
        
        for i, module in enumerate(all_modules):
            if module.id == current_module.id:
                if i > 0:
                    previous_module = {
                        'id': all_modules[i-1].id,
                        'title': all_modules[i-1].title
                    }
                if i < len(all_modules) - 1:
                    next_module = {
                        'id': all_modules[i+1].id,
                        'title': all_modules[i+1].title
                    }
                break
        
        return Response({
            'previous_module': previous_module,
            'next_module': next_module,
            'current_index': list(all_modules).index(current_module) + 1,
            'total_modules': len(all_modules),
        })

class ModuleProgressView(generics.RetrieveUpdateAPIView):
    """
    View for retrieving and updating user progress on a specific module
    """
    permission_classes = [permissions.IsAuthenticated]
    
    def get(self, request, *args, **kwargs):
        module_id = self.kwargs.get('module_id')
        module = get_object_or_404(CourseModule, id=module_id)
        
        # Create a simple progress response
        # In a real application, you would store and retrieve this from a database
        # For now we'll return default values
        progress_data = {
            'position': 0,
            'time_spent': 0,
            'completed': False
        }
        
        return Response(progress_data)
    
    def post(self, request, *args, **kwargs):
        module_id = self.kwargs.get('module_id')
        module = get_object_or_404(CourseModule, id=module_id)
        
        # In a real application, you would save this progress data to a database
        # For now, we'll just acknowledge receipt
        return Response({
            'status': 'success',
            'message': 'Progress updated successfully'
        })

class SchemeListView(generics.ListAPIView):
    """
    View for retrieving government schemes with limit and pagination
    """
    serializer_class = ContentSerializer
    permission_classes = [permissions.AllowAny]
    
    def get_queryset(self):
        queryset = Content.objects.filter(category='government_scheme')
        
        # Get limit parameter if provided
        limit = self.request.query_params.get('limit', None)
        if limit and limit.isdigit():
            queryset = queryset[:int(limit)]
        
        return queryset


class GovernmentSchemesProxyView(APIView):
    """
    Proxies the public government schemes API so GOV_API_KEY remains server-side.
    """
    authentication_classes = []
    permission_classes = [permissions.AllowAny]

    def get(self, request):
        if not settings.GOV_API_KEY:
            return Response(
                {"error": "Government schemes API is not configured"},
                status=status.HTTP_503_SERVICE_UNAVAILABLE,
            )

        try:
            offset = max(0, int(request.query_params.get("offset", 0)))
            limit = min(max(1, int(request.query_params.get("limit", 10))), 50)
        except ValueError:
            return Response({"error": "Invalid pagination values"}, status=status.HTTP_400_BAD_REQUEST)

        query = urlencode({
            "api-key": settings.GOV_API_KEY,
            "format": "json",
            "offset": offset,
            "limit": limit,
        })
        url = f"https://api.data.gov.in/resource/{settings.GOV_SCHEMES_RESOURCE_ID}?{query}"

        try:
            request_obj = Request(url, headers={"User-Agent": "KalaShaala/1.0"})
            with urlopen(request_obj, timeout=8) as response:
                payload = json.loads(response.read().decode("utf-8"))
        except (HTTPError, URLError, TimeoutError, json.JSONDecodeError):
            return Response(
                {"error": "Unable to fetch government schemes right now"},
                status=status.HTTP_502_BAD_GATEWAY,
            )

        return Response(payload, status=status.HTTP_200_OK)


ARTISAN_BENEFITS_FALLBACK = [
    {"state": "Andhra Pradesh", "beneficiaries": {"2019-20": 150, "2020-21": 0, "2021-22": 112, "2022-23": 0}},
    {"state": "Assam", "beneficiaries": {"2019-20": 352, "2020-21": 0, "2021-22": 93, "2022-23": 0}},
    {"state": "Bihar", "beneficiaries": {"2019-20": 45, "2020-21": 0, "2021-22": 0, "2022-23": 0}},
    {"state": "Chhattisgarh", "beneficiaries": {"2019-20": 0, "2020-21": 0, "2021-22": 92, "2022-23": 0}},
    {"state": "Delhi", "beneficiaries": {"2019-20": 180, "2020-21": 0, "2021-22": 0, "2022-23": 0}},
    {"state": "Gujarat", "beneficiaries": {"2019-20": 0, "2020-21": 0, "2021-22": 318, "2022-23": 0}},
    {"state": "Haryana", "beneficiaries": {"2019-20": 110, "2020-21": 0, "2021-22": 0, "2022-23": 0}},
    {"state": "Jammu and Kashmir", "beneficiaries": {"2019-20": 0, "2020-21": 0, "2021-22": 119, "2022-23": 0}},
    {"state": "Karnataka", "beneficiaries": {"2019-20": 0, "2020-21": 0, "2021-22": 208, "2022-23": 0}},
    {"state": "Kerala", "beneficiaries": {"2019-20": 89, "2020-21": 0, "2021-22": 0, "2022-23": 0}},
    {"state": "Madhya Pradesh", "beneficiaries": {"2019-20": 246, "2020-21": 0, "2021-22": 75, "2022-23": 0}},
    {"state": "Maharashtra", "beneficiaries": {"2019-20": 214, "2020-21": 0, "2021-22": 0, "2022-23": 0}},
    {"state": "Odisha", "beneficiaries": {"2019-20": 0, "2020-21": 0, "2021-22": 325, "2022-23": 0}},
    {"state": "Rajasthan", "beneficiaries": {"2019-20": 344, "2020-21": 0, "2021-22": 185, "2022-23": 0}},
    {"state": "Tamil Nadu", "beneficiaries": {"2019-20": 96, "2020-21": 0, "2021-22": 0, "2022-23": 0}},
    {"state": "Uttar Pradesh", "beneficiaries": {"2019-20": 0, "2020-21": 0, "2021-22": 411, "2022-23": 0}},
    {"state": "West Bengal", "beneficiaries": {"2019-20": 286, "2020-21": 0, "2021-22": 147, "2022-23": 0}},
]


def _number_from_record(record, candidates):
    for key in candidates:
        value = record.get(key)
        if value not in (None, ""):
            try:
                return int(str(value).replace(",", "").strip())
            except ValueError:
                return 0
    return 0


def _normalize_artisan_benefit_record(record):
    state = (
        record.get("states_uts")
        or record.get("states_ut")
        or record.get("states__uts")
        or record.get("state_ut")
        or record.get("state")
        or record.get("States/UTs")
        or "Unknown"
    )
    beneficiaries = {
        "2019-20": _number_from_record(record, ["no_of_beneficiaries___2019_20", "no_of_beneficiaries_2019_20", "2019_20"]),
        "2020-21": _number_from_record(record, ["no_of_beneficiaries___2020_21", "no_of_beneficiaries_2020_21", "2020_21"]),
        "2021-22": _number_from_record(record, ["no_of_beneficiaries___2021_22", "no_of_beneficiaries_2021_22", "2021_22"]),
        "2022-23": _number_from_record(record, ["no_of_beneficiaries___2022_23_up_to_february_2023", "no_of_beneficiaries_2022_23_up_to_february_2023", "2022_23"]),
    }

    return {
        "state": str(state).strip(),
        "beneficiaries": beneficiaries,
        "total": sum(beneficiaries.values()),
    }


class GovernmentArtisanBenefitsProxyView(APIView):
    """
    Proxies the Data.gov.in artisan benefits dataset and normalizes it for charts.
    """
    authentication_classes = []
    permission_classes = [permissions.AllowAny]

    def get(self, request):
        payload = None
        source = "fallback"

        if settings.GOV_API_KEY:
            query = urlencode({
                "api-key": settings.GOV_API_KEY,
                "format": "json",
                "limit": 100,
            })
            url = f"https://api.data.gov.in/resource/{settings.GOV_ARTISAN_BENEFITS_RESOURCE_ID}?{query}"

            try:
                request_obj = Request(url, headers={"User-Agent": "KalaShaala/1.0"})
                with urlopen(request_obj, timeout=8) as response:
                    payload = json.loads(response.read().decode("utf-8"))
                source = "data.gov.in"
            except (HTTPError, URLError, TimeoutError, json.JSONDecodeError):
                payload = None

        if payload and isinstance(payload.get("records"), list):
            records = [_normalize_artisan_benefit_record(record) for record in payload["records"]]
            records = [record for record in records if record["state"] and record["state"].lower() != "total"]
            title = payload.get("title") or "Handicraft artisans benefitted from Marketing Support and Services Scheme"
            updated_date = payload.get("updated_date") or "30/10/2023"
        else:
            records = [
                {**record, "total": sum(record["beneficiaries"].values())}
                for record in ARTISAN_BENEFITS_FALLBACK
            ]
            title = "Handicraft artisans benefitted from Marketing Support and Services Scheme"
            updated_date = "30/10/2023"

        totals_by_year = {
            year: sum(record["beneficiaries"].get(year, 0) for record in records)
            for year in ["2019-20", "2020-21", "2021-22", "2022-23"]
        }

        return Response({
            "title": title,
            "description": "State/UT-wise number of handicraft artisans benefitted from Marketing Support and Services Scheme from 2019-20 to 2022-23.",
            "source": source,
            "source_url": "https://www.data.gov.in/resource/stateut-wise-details-number-handicraft-artisans-benefitted-marketing-support-and-services",
            "updated_date": updated_date,
            "records": records,
            "totals_by_year": totals_by_year,
            "grand_total": sum(record["total"] for record in records),
        }, status=status.HTTP_200_OK)


class CourseListView(generics.ListAPIView):
    """
    View for retrieving courses with limit and pagination
    """
    serializer_class = ContentSerializer
    permission_classes = [permissions.AllowAny]
    
    def get_queryset(self):
        queryset = Content.objects.filter(content_type='course')
        
        # Get limit parameter if provided
        limit = self.request.query_params.get('limit', None)
        if limit and limit.isdigit():
            queryset = queryset[:int(limit)]
        
        return queryset
        
    def list(self, request, *args, **kwargs):
        """Override the list method to safely handle serialization"""
        queryset = self.filter_queryset(self.get_queryset())
        
        try:
            page = self.paginate_queryset(queryset)
            if page is not None:
                serializer = self.get_serializer(page, many=True)
                return self.get_paginated_response(serializer.data)
                
            serializer = self.get_serializer(queryset, many=True)
            return Response(serializer.data)
        except Exception as e:
            # Fallback to a simplified course representation
            simple_data = []
            for item in queryset:
                course_data = {
                    'id': item.id,
                    'title': item.title,
                    'description': item.description,
                    'category': item.category,
                    'content_type': item.content_type,
                    'slug': item.slug,
                    'upload_date': item.upload_date,
                    'thumbnail': str(item.thumbnail) if item.thumbnail else None,
                }
                
                # Include contributor information safely
                if hasattr(item, 'contributor') and item.contributor:
                    course_data['contributor'] = {
                        'id': item.contributor.id,
                        'username': item.contributor.username,
                        'name': getattr(item.contributor, 'name', '')
                    }
                
                # Try to include course-specific details
                try:
                    if hasattr(item, 'course_details') and item.course_details.exists():
                        course = item.course_details.first()
                        if course:
                            course_data['price'] = course.price
                            course_data['duration'] = course.duration
                            course_data['is_free'] = course.is_free
                except Exception as inner_e:
                    print(f"Error getting course details: {str(inner_e)}")
                
                simple_data.append(course_data)
            
            return Response(simple_data)

class ChatbotContextView(APIView):
    """
    API view to provide relevant content for the chatbot based on query
    """
    permission_classes = [permissions.AllowAny]
    
    def get(self, request):
        query = request.query_params.get('query', '')
        
        print("ChatbotContextView received query:", query)
        
        # Prepare empty response structure
        context_data = {
            'schemes': [],
            'courses': [],
            'blogs': []
        }
        
        try:
            # Debug: Count total items in database
            total_content = Content.objects.count()
            print(f"Total content items in database: {total_content}")
            
            # Debug: Print all distinct categories and content types
            categories = Content.objects.values_list('category', flat=True).distinct()
            content_types = Content.objects.values_list('content_type', flat=True).distinct()
            print("Available categories:", list(categories))
            print("Available content types:", list(content_types))
            
            # Get schemes - use broader filter to catch all scheme-related content
            # Don't filter by specific category name, use content that contains 'scheme' anywhere
            schemes_query = Content.objects.filter(
                Q(category__icontains='scheme') | 
                Q(tags__icontains='scheme') |
                Q(title__icontains='scheme') |
                Q(description__icontains='scheme') |
                Q(category='government_schemes')
            )
            
            print(f"Found {schemes_query.count()} potential schemes")
            
            # Debug: Print scheme details
            for scheme in schemes_query:
                print(f"Scheme: {scheme.id} - {scheme.title} - Category: {scheme.category}")
            
            # Get all courses without filtering
            courses_query = Content.objects.filter(content_type='course')
            print(f"Found {courses_query.count()} courses")
            
            # Debug: Print course details
            for course in courses_query:
                print(f"Course: {course.id} - {course.title}")
            
            # Get all blogs without filtering
            blogs_query = Content.objects.filter(content_type='blog')
            print(f"Found {blogs_query.count()} blogs")
            
            # Debug: Print blog details
            for blog in blogs_query:
                print(f"Blog: {blog.id} - {blog.title}")
            
            # Create simple representations for efficient serialization
            context_data['schemes'] = [{
                'id': scheme.id,
                'title': scheme.title,
                'description': scheme.description,
                'category': scheme.category,
                'tags': scheme.tags
            } for scheme in schemes_query]
            
            context_data['courses'] = [{
                'id': course.id,
                'title': course.title,
                'description': course.description,
                'price': course.course_details.first().price if hasattr(course, 'course_details') and course.course_details.exists() else 'N/A',
                'is_free': course.course_details.first().is_free if hasattr(course, 'course_details') and course.course_details.exists() else False,
                'duration': course.course_details.first().duration if hasattr(course, 'course_details') and course.course_details.exists() else 'N/A',
                'tags': course.tags
            } for course in courses_query]
            
            context_data['blogs'] = [{
                'id': blog.id,
                'title': blog.title,
                'description': blog.description,
                'content': blog.blog_details.first().text_content if hasattr(blog, 'blog_details') and blog.blog_details.exists() else '',
                'summary': blog.blog_details.first().summary if hasattr(blog, 'blog_details') and blog.blog_details.exists() else '',
                'tags': blog.tags
            } for blog in blogs_query]
            
            print(f"Returning data with {len(context_data['schemes'])} schemes, {len(context_data['courses'])} courses, {len(context_data['blogs'])} blogs")
            return Response(context_data, status=status.HTTP_200_OK)
            
        except Exception as e:
            print(f"Error in ChatbotContextView: {str(e)}")
            import traceback
            traceback.print_exc()
            return Response(
                {"error": f"Error retrieving chatbot context: {str(e)}"},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )


class ArtisanInquiryView(APIView):
    """
    Receives inquiry form submissions from the artisan discovery page.
    """
    authentication_classes = []
    permission_classes = []

    def post(self, request):
        required_fields = ["name", "email", "message", "artisanName", "artStyle"]
        try:
            cleaned = clean_mapping(
                request.data,
                required_fields + ["artisanId"],
                max_length=500,
            )
            cleaned["message"] = clean_text(request.data.get("message"), max_length=2_000)
        except ValueError as exc:
            return Response({"error": str(exc)}, status=status.HTTP_400_BAD_REQUEST)

        missing_fields = [field for field in required_fields if not cleaned.get(field)]

        if missing_fields:
            return Response(
                {
                    "error": "Missing required fields",
                    "missing_fields": missing_fields,
                },
                status=status.HTTP_400_BAD_REQUEST,
            )

        inquiry = {
            "name": cleaned.get("name"),
            "email": cleaned.get("email"),
            "message": cleaned.get("message"),
            "artisan_id": cleaned.get("artisanId"),
            "artisan_name": cleaned.get("artisanName"),
            "art_style": cleaned.get("artStyle"),
        }

        print("New artisan inquiry:", inquiry)

        return Response(
            {
                "message": "Inquiry received successfully",
                "inquiry": inquiry,
            },
            status=status.HTTP_201_CREATED,
        )
