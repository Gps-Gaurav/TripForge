from django.contrib.auth import authenticate
from rest_framework.permissions import IsAuthenticated, AllowAny
from rest_framework.authtoken.models import Token
from rest_framework import status, generics
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.decorators import api_view, permission_classes
from django.utils import timezone
from django.db import transaction

from .serializers import (
    UserRegisterSerializer,
    BusSerializer,
    BookingSerializer
)
from .models import Bus, Seat, Booking

import logging
logger = logging.getLogger(__name__)

# User ke booking stats laane wala API (GET)
class UserBookingStatsView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request, user_id):
        try:
            if request.user.id != user_id:
                return Response({'error': 'Unauthorized'}, status=status.HTTP_401_UNAUTHORIZED)

            now = timezone.now()
            bookings = Booking.objects.filter(user_id=user_id)

            stats = {
                'total_bookings': bookings.count(),
                'active_bookings': bookings.filter(status='confirmed', bus__departure_date__gt=now).count(),
                'cancelled_bookings': bookings.filter(status='cancelled').count(),
                'past_bookings': bookings.filter(status='confirmed', bus__departure_date__lt=now).count()
            }

            return Response(stats)
        except Exception as e:
            logger.error(f"Booking stats error: {str(e)}")
            return Response({'error': f'Error: {str(e)}'}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

# User registration API
class RegisterView(APIView):
    permission_classes = [AllowAny]

    def post(self, request):
        try:
            serializer = UserRegisterSerializer(data=request.data)
            if serializer.is_valid():
                user = serializer.save()
                token, _ = Token.objects.get_or_create(user=user)

                return Response({
                    "status": "success",
                    "message": "Registration successful",
                    "user": {
                        "id": user.id,
                        "username": user.username,
                        "email": user.email,
                        "first_name": user.first_name,
                        "last_name": user.last_name
                    },
                    "token": token.key
                }, status=status.HTTP_201_CREATED)

            return Response({"status": "error", "details": serializer.errors}, status=status.HTTP_400_BAD_REQUEST)
        except Exception as e:
            logger.error(f"Registration error: {str(e)}")
            return Response({"status": "error", "message": str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

# User login API
class LoginView(APIView):
    permission_classes = [AllowAny]

    def post(self, request):
        try:
            username = request.data.get('username')
            password = request.data.get('password')

            if not username or not password:
                return Response({'error': 'Username and password required'}, status=status.HTTP_400_BAD_REQUEST)

            user = authenticate(username=username, password=password)
            if not user:
                return Response({'error': 'Invalid credentials'}, status=status.HTTP_401_UNAUTHORIZED)

            token, _ = Token.objects.get_or_create(user=user)
            return Response({
                'token': token.key,
                'user': {
                    'id': user.id,
                    'username': user.username,
                    'email': user.email,
                    'first_name': user.first_name,
                    'last_name': user.last_name
                }
            })
        except Exception as e:
            logger.error(f"Login error: {str(e)}")
            return Response({'error': str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

# Bus list aur nayi bus create karne ke liye API
class BusListCreateView(generics.ListCreateAPIView):
    queryset = Bus.objects.all()
    serializer_class = BusSerializer
    permission_classes = [IsAuthenticated]

    # Filter bus list by departure, destination, date
    def get_queryset(self):
        queryset = Bus.objects.all()
        departure = self.request.query_params.get('departure')
        destination = self.request.query_params.get('destination')
        date = self.request.query_params.get('date')

        if departure:
            queryset = queryset.filter(origin__icontains=departure)
        if destination:
            queryset = queryset.filter(destination__icontains=destination)
        if date:
            queryset = queryset.filter(departure_date=date)

        return queryset

# Ek bus ko detail me dekhna / update / delete
class BusDetailView(generics.RetrieveUpdateDestroyAPIView):
    queryset = Bus.objects.all()
    serializer_class = BusSerializer
    permission_classes = [IsAuthenticated]

# Booking create karne ke liye API

class BookingView(APIView):
    permission_classes = [IsAuthenticated]

    @transaction.atomic
    def post(self, request):
        try:
            if not request.data.get('bus') or not request.data.get('seat'):
                return Response({'error': 'Bus and seat are required'}, status=status.HTTP_400_BAD_REQUEST)

            try:
                bus = Bus.objects.get(id=request.data['bus'])

                # Row-level locking here:
                seat = Seat.objects.select_for_update().get(id=request.data['seat'], bus=bus)

            except (Bus.DoesNotExist, Seat.DoesNotExist):
                return Response({'error': 'Invalid bus or seat'}, status=status.HTTP_404_NOT_FOUND)

            if seat.is_booked:
                return Response({'error': 'Seat already booked'}, status=status.HTTP_400_BAD_REQUEST)

            booking = Booking.objects.create(
                user=request.user,
                bus=bus,
                seat=seat,
                status='confirmed'
            )

            seat.is_booked = True
            seat.last_booked_at = timezone.now()
            seat.last_booked_by = request.user
            seat.save()

            serializer = BookingSerializer(booking)
            return Response(serializer.data, status=status.HTTP_201_CREATED)

        except Exception as e:
            logger.error(f"Booking error: {str(e)}")
            return Response({'error': f"Failed: {str(e)}"}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


# Kisi user ke saare bookings laane ke liye API


class UserBookingView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request, user_id):
        if request.user.id != user_id:
            return Response({'error': 'Unauthorized'}, status=status.HTTP_401_UNAUTHORIZED)

        status_filter = request.query_params.get('status')
        bookings = Booking.objects.filter(user_id=user_id)

        if status_filter:
            bookings = bookings.filter(status=status_filter)

        bookings = bookings.order_by('-booking_time')
        serializer = BookingSerializer(bookings, many=True)
        return Response(serializer.data)

# Booking cancel karne ka API
class CancelBookingView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request, booking_id):
        try:
            booking = Booking.objects.get(id=booking_id)

            if booking.user != request.user:
                return Response({'detail': 'Not authorized'}, status=status.HTTP_403_FORBIDDEN)

            if not booking.can_cancel:
                return Response({'detail': 'Cannot cancel this booking'}, status=status.HTTP_400_BAD_REQUEST)

            if hasattr(booking, 'seats'):
                for seat in booking.seats.all():
                    seat.cancel()
            elif hasattr(booking, 'seat'):
                booking.seat.cancel()

            booking.status = 'cancelled'
            booking.cancelled_at = timezone.now()
            booking.cancellation_reason = request.data.get('reason', 'Cancelled by user')
            booking.save()

            return Response({
                'detail': 'Booking cancelled successfully',
                'booking_id': booking_id
            })

        except Booking.DoesNotExist:
            return Response({'detail': 'Booking not found'}, status=status.HTTP_404_NOT_FOUND)
        except Exception as e:
            return Response({'detail': str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

# Booking statistics function-based view
@api_view(['GET'])
@permission_classes([IsAuthenticated])
def booking_stats(request, user_id):
    if request.user.id != user_id:
        return Response({'error': 'Unauthorized'}, status=status.HTTP_401_UNAUTHORIZED)

    now = timezone.now()
    total_bookings = Booking.objects.filter(user_id=user_id).count()
    active_bookings = Booking.objects.filter(user_id=user_id, status='confirmed', bus__departure_date__gt=now).count()
    past_bookings = Booking.objects.filter(user_id=user_id, bus__departure_date__lt=now).count()
    cancelled_bookings = Booking.objects.filter(user_id=user_id, status='cancelled').count()

    return Response({
        'total_bookings': total_bookings,
        'active_bookings': active_bookings,
        'past_bookings': past_bookings,
        'cancelled_bookings': cancelled_bookings
    })
