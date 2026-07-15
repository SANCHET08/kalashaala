from django.db import models
from django.contrib.auth.models import AbstractUser
from django.utils import timezone
import json


class CustomUser(AbstractUser):
    email = models.EmailField(unique=True)
    name = models.CharField(max_length=255, blank=True)
    USER_TYPE_CHOICES = [
        ('buyer', 'Buyer'),
        ('artist', 'Artist'),
    ]
    user_type = models.CharField(max_length=50, choices=USER_TYPE_CHOICES, default='buyer')

    def __str__(self):
        return self.username


class Portfolio(models.Model):
    user = models.ForeignKey(CustomUser, on_delete=models.CASCADE, related_name='portfolio_items')
    title = models.CharField(max_length=255)
    category = models.CharField(max_length=100)
    description = models.TextField(blank=True)
    year = models.CharField(max_length=10)
    details = models.TextField(blank=True)  # Stored as JSON string
    created_at = models.DateTimeField(default=timezone.now)
    updated_at = models.DateTimeField(auto_now=True)

    def get_details(self):
        """Convert stored JSON string to list of details"""
        if self.details:
            try:
                return json.loads(self.details)
            except json.JSONDecodeError:
                return []
        return []

    def set_details(self, details_list):
        """Convert list of details to JSON string for storage"""
        self.details = json.dumps(details_list)

    def __str__(self):
        return f"{self.title} - {self.user.name or self.user.username}"

