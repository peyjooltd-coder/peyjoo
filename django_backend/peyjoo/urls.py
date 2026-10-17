from django.contrib.staticfiles.views import serve as static_serve
from django.urls import include, path

from core.admin import site


def manage_static(request, path):
    return static_serve(request, path, insecure=True)


urlpatterns = [
    path('manage/static/<path:path>', manage_static),
    path('manage/admin/', site.urls),
    path('manage/', include('core.urls')),
]
