from django.urls import path

from .registry import SPECS
from .views import (
    DashboardView,
    HamyariModerationView,
    ModerationActionView,
    ModerationView,
    PanelCreateView,
    PanelDeleteView,
    PanelDetailView,
    PanelListView,
    PanelLoginView,
    PanelLogoutView,
    PanelUpdateView,
    bind,
)

urlpatterns = [
    path('', DashboardView.as_view(), name='dashboard'),
    path('moderation/', ModerationView.as_view(), name='moderation'),
    path('moderation/hamyari/', HamyariModerationView.as_view(), name='hamyari-moderation'),
    path('moderation/act/', ModerationActionView.as_view(), name='moderate'),
    path('login/', PanelLoginView.as_view(), name='login'),
    path('logout/', PanelLogoutView.as_view(), name='logout'),
]

for spec in SPECS:
    urlpatterns.append(path(f'{spec.slug}/', bind(PanelListView, spec), name=f'{spec.slug}-list'))
    urlpatterns.append(path(f'{spec.slug}/new/', bind(PanelCreateView, spec), name=f'{spec.slug}-create'))
    if spec.composite:
        urlpatterns.append(path(
            f'{spec.slug}/<str:key_a>/<str:key_b>/',
            bind(PanelDetailView, spec),
            name=f'{spec.slug}-detail',
        ))
        urlpatterns.append(path(
            f'{spec.slug}/<str:key_a>/<str:key_b>/edit/',
            bind(PanelUpdateView, spec),
            name=f'{spec.slug}-edit',
        ))
        urlpatterns.append(path(
            f'{spec.slug}/<str:key_a>/<str:key_b>/delete/',
            bind(PanelDeleteView, spec),
            name=f'{spec.slug}-delete',
        ))
    else:
        urlpatterns.append(path(f'{spec.slug}/<str:pk>/', bind(PanelDetailView, spec), name=f'{spec.slug}-detail'))
        urlpatterns.append(path(f'{spec.slug}/<str:pk>/edit/', bind(PanelUpdateView, spec), name=f'{spec.slug}-edit'))
        urlpatterns.append(path(f'{spec.slug}/<str:pk>/delete/', bind(PanelDeleteView, spec), name=f'{spec.slug}-delete'))
