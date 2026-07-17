from django.db import models
from django.utils.text import slugify
from django.conf import settings

# Content categories
CATEGORY_CHOICES = [
    ('traditional_art', 'Traditional Art'),
    ('modern_techniques', 'Modern Techniques'),
    ('marketing_tips', 'Marketing Tips'),
    ('government_schemes', 'Government Schemes'),
    ('success_stories', 'Success Stories'),
    ('warli', 'Warli'),
    ('paithani_sarees', 'Paithani Sarees'),
    ('other', 'Other'),
]

# Content types
CONTENT_TYPE_CHOICES = [
    ('blog', 'Blog Post'),
    ('video', 'Video'),
    ('pdf', 'PDF'),
    ('presentation', 'Presentation'),
    ('course', 'Course'),
]

# Module content types
MODULE_CONTENT_TYPE_CHOICES = [
    ('blog', 'Blog Post'),
    ('video', 'Video'),
    ('pdf', 'PDF'),
]

class Content(models.Model):
    """Base model for all content types"""
    title = models.CharField(max_length=255)
    description = models.TextField()
    thumbnail = models.ImageField(upload_to='content_thumbnails/', null=True, blank=True)
    upload_date = models.DateTimeField(auto_now_add=True)
    last_updated = models.DateTimeField(auto_now=True)
    category = models.CharField(max_length=50, choices=CATEGORY_CHOICES)
    content_type = models.CharField(max_length=20, choices=CONTENT_TYPE_CHOICES)
    contributor = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='contents')
    slug = models.SlugField(unique=True, max_length=255, blank=True)
    tags = models.CharField(max_length=255, blank=True)  # Store as comma-separated values
    is_featured = models.BooleanField(default=False)
    view_count = models.PositiveIntegerField(default=0)
    download_count = models.PositiveIntegerField(default=0)

    def save(self, *args, **kwargs):
        if not self.slug:
            self.slug = slugify(self.title)
            # Check for duplicate slugs and append a unique identifier if needed
            original_slug = self.slug
            count = 1
            while Content.objects.filter(slug=self.slug).exists():
                self.slug = f"{original_slug}-{count}"
                count += 1
        super().save(*args, **kwargs)

    def __str__(self):
        return self.title

    class Meta:
        ordering = ['-upload_date']

class BlogPost(models.Model):
    """Model for text blog posts"""
    content = models.ForeignKey(Content, on_delete=models.CASCADE, related_name='blog_details')
    text_content = models.TextField()
    summary = models.TextField()

    def __str__(self):
        return f"Blog: {self.content.title}"

class Video(models.Model):
    """Model for video content"""
    content = models.ForeignKey(Content, on_delete=models.CASCADE, related_name='video_details')
    video_file = models.FileField(upload_to='videos/', null=True, blank=True)
    video_url = models.URLField(blank=True)  # For YouTube/Vimeo links
    duration = models.DurationField(null=True, blank=True)

    def __str__(self):
        return f"Video: {self.content.title}"

class Document(models.Model):
    """Model for PDF and document content"""
    content = models.ForeignKey(Content, on_delete=models.CASCADE, related_name='document_details')
    document_file = models.FileField(upload_to='documents/')
    page_count = models.PositiveIntegerField(null=True, blank=True)
    file_size = models.PositiveIntegerField(help_text="File size in KB", null=True, blank=True)

    def __str__(self):
        return f"Document: {self.content.title}"

class Course(models.Model):
    """Model for online courses"""
    content = models.ForeignKey(Content, on_delete=models.CASCADE, related_name='course_details')
    price = models.DecimalField(max_digits=10, decimal_places=2, default=0)
    is_free = models.BooleanField(default=False)
    duration = models.CharField(max_length=100, help_text="e.g., '4 weeks', '10 hours'", blank=True)
    
    def __str__(self):
        return f"Course: {self.content.title}"

class CourseModule(models.Model):
    """Modules within a course"""
    course = models.ForeignKey(Course, on_delete=models.CASCADE, related_name='modules')
    title = models.CharField(max_length=255)
    description = models.TextField(blank=True)
    order = models.PositiveIntegerField(default=0)
    content_type = models.CharField(max_length=20, choices=MODULE_CONTENT_TYPE_CHOICES, default='blog')
    
    # Directly store content in the module instead of referencing other content models
    # Text content for blog-type modules
    text_content = models.TextField(blank=True)
    summary = models.TextField(blank=True)
    
    # Video content for video-type modules
    video_file = models.FileField(upload_to='course_videos/', null=True, blank=True)
    video_url = models.URLField(blank=True)  # For YouTube/Vimeo links
    duration = models.DurationField(null=True, blank=True)
    
    # Document content for pdf-type modules
    document_file = models.FileField(upload_to='course_documents/', null=True, blank=True)
    page_count = models.PositiveIntegerField(null=True, blank=True)
    file_size = models.PositiveIntegerField(help_text="File size in KB", null=True, blank=True)
    
    

    class Meta:
        ordering = ['order']

    def __str__(self):
        return f"{self.title} - {self.course.content.title}"
    
    def get_content(self):
        """Get the content based on content type"""
        if self.content_type == 'blog':
            return self.text_content
        elif self.content_type == 'video':
            return self.video_url or str(self.video_file)
        elif self.content_type == 'pdf':
            return str(self.document_file) if self.document_file else None
        return None

class Comment(models.Model):
    """Comments on content"""
    content = models.ForeignKey(Content, on_delete=models.CASCADE, related_name='comments')
    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE)
    text = models.TextField()
    created_at = models.DateTimeField(auto_now_add=True)
    parent = models.ForeignKey('self', on_delete=models.CASCADE, null=True, blank=True, related_name='replies')

    class Meta:
        ordering = ['created_at']

    def __str__(self):
        return f"Comment by {self.user} on {self.content.title}"
