from django.contrib.auth import authenticate
from django.db.models import Count, Q
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


# --------------------------
# USER REGISTRATION & LOGIN
# --------------------------

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


# --------------------------
# BUS LIST & DETAIL
# --------------------------

class BusListCreateView(generics.ListCreateAPIView):
    queryset = Bus.objects.all()
    serializer_class = BusSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        queryset = Bus.objects.all()
        departure = self.request.query_params.get('departure')
        destination = self.request.query_params.get('destination')
        journey_date = self.request.query_params.get('journey_date')

        if departure:
            queryset = queryset.filter(origin__icontains=departure)
        if destination:
            queryset = queryset.filter(destination__icontains=destination)
        # Optional: filter by availability on journey_date
        if journey_date:
            booked_buses = Booking.objects.filter(
                journey_date=journey_date,
                status='confirmed'
            ).values_list('bus_id', flat=True)
            queryset = queryset.exclude(id__in=booked_buses)

        return queryset


class BusDetailView(generics.RetrieveUpdateDestroyAPIView):
    queryset = Bus.objects.all()
    serializer_class = BusSerializer
    permission_classes = [IsAuthenticated]


# --------------------------
# BOOKING CREATE & LIST
# --------------------------

class BookingView(APIView):
    permission_classes = [IsAuthenticated]

    @transaction.atomic
    def post(self, request):
        try:
            bus_id = request.data.get('bus')
            seat_id = request.data.get('seat')
            journey_date = request.data.get('journey_date')

            if not bus_id or not seat_id or not journey_date:
                return Response({'error': 'Bus, seat and journey_date are required'}, status=status.HTTP_400_BAD_REQUEST)

            try:
                bus = Bus.objects.get(id=bus_id)
                seat = Seat.objects.select_for_update().get(id=seat_id, bus=bus)
            except (Bus.DoesNotExist, Seat.DoesNotExist):
                return Response({'error': 'Invalid bus or seat'}, status=status.HTTP_404_NOT_FOUND)

            # Check seat availability for that date
            if Booking.objects.filter(
                seat=seat,
                bus=bus,
                journey_date=journey_date,
                status='confirmed'
            ).exists():
                return Response({'error': 'Seat already booked for this date'}, status=status.HTTP_400_BAD_REQUEST)

            booking = Booking.objects.create(
                user=request.user,
                bus=bus,
                seat=seat,
                journey_date=journey_date,
                status='confirmed'
            )

            serializer = BookingSerializer(booking)
            return Response(serializer.data, status=status.HTTP_201_CREATED)

        except Exception as e:
            logger.error(f"Booking error: {str(e)}")
            return Response({'error': f"Failed: {str(e)}"}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


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


class CancelBookingView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request, booking_id):
        try:
            booking = Booking.objects.get(id=booking_id)

            if booking.user != request.user:
                return Response({'detail': 'Not authorized'}, status=status.HTTP_403_FORBIDDEN)

            if not booking.can_cancel:
                return Response({'detail': 'Cannot cancel this booking'}, status=status.HTTP_400_BAD_REQUEST)

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
            logger.error(f"Cancel booking error: {str(e)}")
            return Response({'detail': str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


# --------------------------
# BOOKING STATS
# --------------------------

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def booking_stats(request, user_id):
    if request.user.id != user_id:
        return Response({'error': 'Unauthorized'}, status=status.HTTP_401_UNAUTHORIZED)

    now = timezone.now().date()

    stats = Booking.objects.filter(user_id=user_id).aggregate(
        total_bookings=Count('id'),
        active_bookings=Count('id', filter=Q(status='confirmed') & Q(journey_date__gte=now)),
        past_bookings=Count('id', filter=Q(status='confirmed') & Q(journey_date__lt=now)),
        cancelled_bookings=Count('id', filter=Q(status='cancelled'))
    )

    return Response(stats)
