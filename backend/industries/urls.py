from django.urls import path
from .views import IndustryListView, ObjectiveListView, StageListView

urlpatterns = [
    path("industries/", IndustryListView.as_view(), name="industry-list"),
    path("objectives/", ObjectiveListView.as_view(), name="objective-list"),
    path("stages/", StageListView.as_view(), name="stage-list"),
]
