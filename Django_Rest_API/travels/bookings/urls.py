from django.urls import path
from .views.auth_views import RegisterView, LoginView
from .views.bus_views import BusListCreateView, BusDetailView
from .views.booking_views import BookingView, UserBookingView, CancelBookingView
from .views.stats_views import booking_stats
urlpatterns = [
    path('register/', RegisterView.as_view(), name='register'),
    path('login/', LoginView.as_view(), name='login'),
    path('buses/', BusListCreateView.as_view(), name='buslist'),
    path('buses/<int:pk>/', BusDetailView.as_view(), name='bus-detail'),
    path('booking/', BookingView.as_view(), name='booking'),
    path('user/<int:user_id>/bookings/', UserBookingView.as_view(), name='user-bookings'),
    path('user/<int:user_id>/booking-stats/', booking_stats, name='user-booking-stats'),
    path('bookings/<int:booking_id>/cancel/', CancelBookingView.as_view(), name='cancel-booking'),
]
