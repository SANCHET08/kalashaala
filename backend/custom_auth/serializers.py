from rest_framework import serializers
from .models import CustomUser, Portfolio


class CustomUserSerializer(serializers.ModelSerializer):
    class Meta:
        model = CustomUser
        fields = ['id', 'username', 'email', 'name', 'user_type']
        read_only_fields = ['id']


class PortfolioSerializer(serializers.ModelSerializer):
    details = serializers.ListField(child=serializers.CharField(), required=False)
    user_name = serializers.CharField(source='user.name', read_only=True)
    
    class Meta:
        model = Portfolio
        fields = ['id', 'user', 'user_name', 'title', 'category', 'description', 'year', 'details', 'created_at', 'updated_at']
        read_only_fields = ['id', 'user', 'created_at', 'updated_at', 'user_name']
    
    def to_representation(self, instance):
        """Convert the details JSON string to a list when serializing"""
        representation = super().to_representation(instance)
        representation['details'] = instance.get_details()
        return representation
    
    def create(self, validated_data):
        """Handle the details list when creating a portfolio item"""
        details = validated_data.pop('details', [])
        portfolio = Portfolio.objects.create(**validated_data)
        portfolio.set_details(details)
        portfolio.save()
        return portfolio
    
    def update(self, instance, validated_data):
        """Handle the details list when updating a portfolio item"""
        details = validated_data.pop('details', None)
        for attr, value in validated_data.items():
            setattr(instance, attr, value)
            
        if details is not None:
            instance.set_details(details)
            
        instance.save()
        return instance