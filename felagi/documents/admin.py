from django.contrib import admin
from .models import Document,Term,Posting
# Register your models here.

admin.register(Document)
admin.site.register(Term)
admin.site.register(Posting)
