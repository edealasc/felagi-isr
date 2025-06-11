from django.contrib import admin
from .views import import_voa_articles,import_data,search_view
from django.urls import path
urlpatterns = [
    path('import_data/', import_data, name='import_data'),
    path('search/<str:query>/', search_view, name='search_view'),
]
