from django.urls import path
from. import views

urlpatterns = [
    path('', views.index, name='index'),
    path('team/', views.team_table, name='team'),
    path('goal/', views.player_goal_table, name='goal'),
    path('assist/', views.player_assist_table, name='assist'),
    path('schedule/<int:round_idx>', views.schedule_table, name='schedule'),
]