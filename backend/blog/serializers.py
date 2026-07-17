from rest_framework import serializers
from .models import (
    Content, BlogPost, Video, Document, Course, CourseModule, Comment
)
from django.conf import settings
from django.contrib.auth import get_user_model

class UserSerializer(serializers.ModelSerializer):
    class Meta:
        model = get_user_model()
        fields = ['id', 'username', 'email', 'name']

class CommentSerializer(serializers.ModelSerializer):
    user = UserSerializer(read_only=True)
    replies = serializers.SerializerMethodField()
    
    class Meta:
        model = Comment
        fields = ['id', 'user', 'text', 'created_at', 'parent', 'replies']
        read_only_fields = ['created_at']
    
    def get_replies(self, obj):
        if obj.replies.exists():
            return CommentSerializer(obj.replies.all(), many=True).data
        return []

class BlogPostSerializer(serializers.ModelSerializer):
    class Meta:
        model = BlogPost
        fields = ['id', 'text_content', 'summary']

class VideoSerializer(serializers.ModelSerializer):
    class Meta:
        model = Video
        fields = ['id', 'video_file', 'video_url', 'duration']

class DocumentSerializer(serializers.ModelSerializer):
    class Meta:
        model = Document
        fields = ['id', 'document_file', 'page_count', 'file_size']

class CourseModuleSerializer(serializers.ModelSerializer):
    class Meta:
        model = CourseModule
        fields = [
            'id', 'title', 'description', 'order', 'content_type',
            'text_content', 'summary', 'video_url', 'video_file',
            'document_file', 'duration', 'page_count', 'file_size'
        ]

class EnhancedCourseModuleSerializer(serializers.ModelSerializer):
    content_type = serializers.ChoiceField(choices=[choice[0] for choice in CourseModule._meta.get_field('content_type').choices])
    blog_post_id = serializers.IntegerField(required=False, allow_null=True)
    video_id = serializers.IntegerField(required=False, allow_null=True)
    document_id = serializers.IntegerField(required=False, allow_null=True)
    
    class Meta:
        model = CourseModule
        fields = ['id', 'title', 'description', 'order', 'content_type', 
                 'blog_post_id', 'video_id', 'document_id']
    
    def validate(self, data):
        content_type = data.get('content_type')
        
        # Check that the appropriate content ID is provided based on content_type
        if content_type == 'blog' and not data.get('blog_post_id'):
            raise serializers.ValidationError("blog_post_id is required when content_type is 'blog'")
        elif content_type == 'video' and not data.get('video_id'):
            raise serializers.ValidationError("video_id is required when content_type is 'video'")
        elif content_type == 'pdf' and not data.get('document_id'):
            raise serializers.ValidationError("document_id is required when content_type is 'pdf'")
            
        return data

class CourseSerializer(serializers.ModelSerializer):
    modules = CourseModuleSerializer(many=True, read_only=True)
    
    class Meta:
        model = Course
        fields = ['id', 'price', 'is_free', 'duration', 'modules']

class CourseCreateSerializer(serializers.Serializer):
    # Course content fields
    title = serializers.CharField(max_length=255)
    description = serializers.CharField()
    thumbnail = serializers.ImageField(required=False, allow_null=True)
    category = serializers.ChoiceField(choices=[choice[0] for choice in Content._meta.get_field('category').choices])
    tags = serializers.CharField(required=False, allow_blank=True)
    
    # Course specific fields
    price = serializers.DecimalField(max_digits=10, decimal_places=2, default=0, required=False)
    is_free = serializers.BooleanField(default=False, required=False)
    duration = serializers.CharField(max_length=100, required=False, allow_blank=True)
    
    # Course modules - will be processed in create method
    modules = serializers.JSONField(required=False)
    
    def validate_modules(self, value):
        """
        Validate the modules data to ensure it's in the correct format.
        """
        # If value is None or empty, return empty list
        if not value:
            return []
            
        if isinstance(value, str):
            try:
                import json
                value = json.loads(value)
            except json.JSONDecodeError as e:
                print(f"JSON decode error in validate_modules: {str(e)}")
                raise serializers.ValidationError(f"Invalid JSON format for modules: {str(e)}")
        
        if not isinstance(value, list):
            print(f"Modules is not a list, got: {type(value)}")
            raise serializers.ValidationError(f"Modules must be provided as a list, got {type(value).__name__}")
        
        return value
    
    def validate(self, data):
        """Additional validation to ensure proper data structure"""
        # Validate modules data if provided
        if 'modules' in data and data['modules']:
            # If modules is a string, try to parse it as JSON
            if isinstance(data['modules'], str):
                try:
                    import json
                    data['modules'] = json.loads(data['modules'])
                except json.JSONDecodeError as e:
                    raise serializers.ValidationError(f"Invalid JSON format for modules: {str(e)}")
            
            # Ensure modules is a list
            if not isinstance(data['modules'], list):
                raise serializers.ValidationError("Modules must be provided as a list")
            
            for i, module in enumerate(data['modules']):
                if not isinstance(module, dict):
                    raise serializers.ValidationError(f"Module at position {i} must be an object")
                
                if 'title' not in module:
                    raise serializers.ValidationError(f"Module at position {i} is missing a title")
                
                if 'content_type' in module:
                    content_type = module['content_type']
                    if content_type not in ['blog', 'video', 'pdf']:
                        raise serializers.ValidationError(
                            f"Invalid content_type '{content_type}' for module at position {i}. "
                            "Valid types are: 'blog', 'video', 'pdf'"
                        )
                    
                    # For blog content, text content is required
                    if content_type == 'blog' and ('text_content' not in module or not module['text_content']):
                        raise serializers.ValidationError(
                            f"Module at position {i} is missing text_content for blog type"
                        )
                    # For video, either URL or file should be available (checking file in create method)
                    elif content_type == 'video':
                        # We'll check for video_file in request.FILES in create method
                        video_file_key = f"module_{i}_video_file"
                        if video_file_key not in self.context['request'].FILES and 'video_url' not in module:
                            raise serializers.ValidationError(
                                f"Module at position {i} is missing both video_file and video_url for video type"
                            )
                    # For PDF, check if document_file exists in FILES (will verify in create method)
                    elif content_type == 'pdf':
                        document_file_key = f"module_{i}_document_file"
                        if document_file_key not in self.context['request'].FILES:
                            raise serializers.ValidationError(
                                f"Module at position {i} is missing document_file for pdf type"
                            )
        
        return data
    
    def create(self, validated_data):
        request = self.context['request']
        user = request.user
        
        # Extract modules_data and ensure it's a list
        modules_data = validated_data.pop('modules', [])
        if isinstance(modules_data, str):
            import json
            try:
                modules_data = json.loads(modules_data)
            except json.JSONDecodeError as e:
                # This should rarely happen since validate() should catch it,
                # but let's handle it just in case
                print(f"JSON decode error in create method: {str(e)}")
                modules_data = []
        
        # If modules_data is not a list, convert it to an empty list
        if not isinstance(modules_data, list):
            modules_data = []
                
        # Create the base content
        content_data = {
            'title': validated_data.get('title'),
            'description': validated_data.get('description'),
            'thumbnail': validated_data.get('thumbnail'),
            'category': validated_data.get('category'),
            'tags': validated_data.get('tags', ''),
            'content_type': 'course',
            'contributor': user
        }
        content = Content.objects.create(**content_data)
        
        # Create the course
        course_data = {
            'content': content,
            'price': validated_data.get('price', 0),
            'is_free': validated_data.get('is_free', False),
            'duration': validated_data.get('duration', '')
        }
        course = Course.objects.create(**course_data)
        
        # Process and create modules
        for i, module_data in enumerate(modules_data):
            # Create course module with basic data
            module = CourseModule(
                course=course,
                title=module_data.get('title', f"Module {i+1}"),
                description=module_data.get('description', ''),
                order=i,
                content_type=module_data.get('content_type', 'blog')
            )
            
            content_type = module_data.get('content_type', 'blog')
            
            # Store content directly in the CourseModule based on content_type
            if content_type == 'blog':
                module.text_content = module_data.get('text_content', '')
                module.summary = module_data.get('summary', '')
                
            elif content_type == 'video':
                module.video_url = module_data.get('video_url', '')
                
                # Check if video file is in request.FILES with module-specific key
                video_file_key = f"module_{i}_video_file"
                if video_file_key in request.FILES:
                    module.video_file = request.FILES[video_file_key]
                
                # Set duration if provided
                if 'duration' in module_data:
                    from datetime import timedelta
                    duration_seconds = int(module_data['duration'])
                    module.duration = timedelta(seconds=duration_seconds)
                
            elif content_type == 'pdf':
                # Check if document file is in request.FILES with module-specific key
                document_file_key = f"module_{i}_document_file"
                if document_file_key in request.FILES:
                    module.document_file = request.FILES[document_file_key]
                
                # Set page count and file size if provided
                if 'page_count' in module_data:
                    module.page_count = int(module_data['page_count'])
                    
                if 'file_size' in module_data:
                    module.file_size = int(module_data['file_size'])
            
            module.save()
        
        return content

class ContentSerializer(serializers.ModelSerializer):
    contributor = UserSerializer(read_only=True)
    
    # Use SerializerMethodField to safely handle related fields
    blog_details = serializers.SerializerMethodField()
    video_details = serializers.SerializerMethodField()
    document_details = serializers.SerializerMethodField()
    course_details = serializers.SerializerMethodField()
    
    comments = serializers.SerializerMethodField()
    
    class Meta:
        model = Content
        fields = [
            'id', 'title', 'description', 'thumbnail', 'upload_date', 'last_updated',
            'category', 'content_type', 'contributor', 'slug', 'tags', 
            'is_featured', 'view_count', 'download_count',
            'blog_details', 'video_details', 'document_details', 
            'course_details', 'comments'
        ]
        read_only_fields = ['upload_date', 'last_updated', 'slug', 'view_count', 'download_count']

    def get_blog_details(self, obj):
        try:
            if hasattr(obj, 'blog_details') and obj.blog_details.first():
                return BlogPostSerializer(obj.blog_details.first()).data
        except:
            pass
        return None
        
    def get_video_details(self, obj):
        try:
            if hasattr(obj, 'video_details') and obj.video_details.first():
                return VideoSerializer(obj.video_details.first()).data
        except:
            pass
        return None
        
    def get_document_details(self, obj):
        try:
            if hasattr(obj, 'document_details') and obj.document_details.first():
                return DocumentSerializer(obj.document_details.first()).data
        except:
            pass
        return None
        
    def get_course_details(self, obj):
        try:
            # Make sure obj.course_details.first() returns a model instance, not a string
            if hasattr(obj, 'course_details') and obj.course_details.exists():
                course_instance = obj.course_details.first()
                if course_instance and not isinstance(course_instance, str):
                    return CourseSerializer(course_instance).data
        except Exception as e:
            print(f"Error serializing course details: {str(e)}")
            pass
        return None
        
    def get_comments(self, obj):
        try:
            comments = obj.comments.filter(parent=None)
            return CommentSerializer(comments, many=True).data
        except:
            return []

# Specialized serializers for content creation
class BlogPostCreateSerializer(serializers.Serializer):
    title = serializers.CharField(max_length=255)
    description = serializers.CharField()
    thumbnail = serializers.ImageField(required=False)
    category = serializers.ChoiceField(choices=[choice[0] for choice in Content._meta.get_field('category').choices])
    tags = serializers.CharField(required=False, allow_blank=True)
    text_content = serializers.CharField()
    summary = serializers.CharField()
    
    def create(self, validated_data):
        user = self.context['request'].user
        
        # Create the base content
        content_data = {
            'title': validated_data.get('title'),
            'description': validated_data.get('description'),
            'thumbnail': validated_data.get('thumbnail'),
            'category': validated_data.get('category'),
            'tags': validated_data.get('tags', ''),
            'content_type': 'blog',
            'contributor': user
        }
        content = Content.objects.create(**content_data)
        
        # Create the blog post
        blog_data = {
            'content': content,
            'text_content': validated_data.get('text_content'),
            'summary': validated_data.get('summary')
        }
        BlogPost.objects.create(**blog_data)
        
        return content

class VideoCreateSerializer(serializers.Serializer):
    title = serializers.CharField(max_length=255)
    description = serializers.CharField()
    thumbnail = serializers.ImageField(required=False)
    category = serializers.ChoiceField(choices=[choice[0] for choice in Content._meta.get_field('category').choices])
    tags = serializers.CharField(required=False, allow_blank=True)
    video_file = serializers.FileField(required=False)
    video_url = serializers.URLField(required=False)
    
    def validate(self, data):
        if not data.get('video_file') and not data.get('video_url'):
            raise serializers.ValidationError("Either video file or video URL must be provided")
        return data
    
    def create(self, validated_data):
        user = self.context['request'].user
        
        # Create the base content
        content_data = {
            'title': validated_data.get('title'),
            'description': validated_data.get('description'),
            'thumbnail': validated_data.get('thumbnail'),
            'category': validated_data.get('category'),
            'tags': validated_data.get('tags', ''),
            'content_type': 'video',
            'contributor': user
        }
        content = Content.objects.create(**content_data)
        
        # Create the video
        video_data = {
            'content': content,
            'video_file': validated_data.get('video_file'),
            'video_url': validated_data.get('video_url', '')
        }
        Video.objects.create(**video_data)
        
        return content

class DocumentCreateSerializer(serializers.Serializer):
    title = serializers.CharField(max_length=255)
    description = serializers.CharField()
    thumbnail = serializers.ImageField(required=False)
    category = serializers.ChoiceField(choices=[choice[0] for choice in Content._meta.get_field('category').choices])
    tags = serializers.CharField(required=False, allow_blank=True)
    document_file = serializers.FileField()
    
    def create(self, validated_data):
        user = self.context['request'].user
        
        # Create the base content
        content_data = {
            'title': validated_data.get('title'),
            'description': validated_data.get('description'),
            'thumbnail': validated_data.get('thumbnail'),
            'category': validated_data.get('category'),
            'tags': validated_data.get('tags', ''),
            'content_type': 'pdf',
            'contributor': user
        }
        content = Content.objects.create(**content_data)
        
        # Create the document
        document_data = {
            'content': content,
            'document_file': validated_data.get('document_file')
        }
        Document.objects.create(**document_data)
        
        return content
