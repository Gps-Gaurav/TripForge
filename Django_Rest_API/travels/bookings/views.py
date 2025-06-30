from django.contrib.auth import authenticate
from rest_framework.permissions import IsAuthenticated, AllowAny
from rest_framework.authtoken.models import Token
from rest_framework import status, generics
from rest_framework.views import APIView
from .serializers import UserRegisterSerializer, BusSerializer, BookingSerializer
from rest_framework.response import Response
from .models import Bus, Seat, Booking
from django.utils import timezone
from rest_framework.decorators import api_view, permission_classes

import logging

logger = logging.getLogger(__name__)
class UserBookingStatsView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request, user_id):
        try:
            # Check authorization
            if request.user.id != user_id:
                return Response({
                    'error': 'Unauthorized to view these statistics'
                }, status=status.HTTP_401_UNAUTHORIZED)

            # Get current time
            now = timezone.now()

            # Get all bookings for the user
            bookings = Booking.objects.filter(user_id=user_id)
            
            # Calculate stats
            total_bookings = bookings.count()
            active_bookings = bookings.filter(status='confirmed').count()
            cancelled_bookings = bookings.filter(status='cancelled').count()
            past_bookings = bookings.filter(status='completed').count()

            stats = {
                'total_bookings': total_bookings,
                'active_bookings': active_bookings,
                'cancelled_bookings': cancelled_bookings,
                'past_bookings': past_bookings
            }

            return Response(stats)

        except Exception as e:
            logger.error(f"Error fetching booking stats for user {user_id}: {str(e)}")
            return Response({
                'error': f'An error occurred: {str(e)}'
            }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
    permission_classes = [IsAuthenticated]

    def get(self, request, user_id):
        try:
            # Log request details
            logger.info(f"Fetching booking stats for user {user_id}")
            
            # Check authorization
            if request.user.id != user_id:
                return Response({
                    'error': 'Unauthorized to view these statistics'
                }, status=status.HTTP_401_UNAUTHORIZED)

            # Get current time once to ensure consistency
            now = timezone.now()

            # Get all bookings for the user
            bookings = Booking.objects.filter(user_id=user_id)
            
            # Calculate stats
            stats = {
                'total_bookings': bookings.count(),
                'active_bookings': bookings.filter(
                    status='confirmed',
                    bus__departure_date__gt=now
                ).count(),
                'cancelled_bookings': bookings.filter(
                    status='cancelled'
                ).count(),
                'past_bookings': bookings.filter(
                    status='confirmed',
                    bus__departure_date__lt=now
                ).count()
            }

            logger.info(f"Successfully fetched stats for user {user_id}: {stats}")
            return Response(stats)

        except Exception as e:
            logger.error(f"Error fetching booking stats for user {user_id}: {str(e)}")
            return Response({
                'error': f'An error occurred: {str(e)}'
            }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
class RegisterView(APIView):
    permission_classes = [AllowAny]

    def post(self, request):
        try:
            logger.info(f"Registration attempt with data: {request.data}")
            serializer = UserRegisterSerializer(data=request.data)
            
            if serializer.is_valid():
                user = serializer.save()
                token, created = Token.objects.get_or_create(user=user)
                
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
            
            logger.error(f"Registration validation errors: {serializer.errors}")
            return Response({
                "status": "error",
                "details": serializer.errors
            }, status=status.HTTP_400_BAD_REQUEST)
            
        except Exception as e:
            logger.error(f"Registration error: {str(e)}")
            return Response({
                "status": "error",
                "message": str(e)
            }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

class LoginView(APIView):
    permission_classes = [AllowAny]

    def post(self, request):
        try:
            username = request.data.get('username')
            password = request.data.get('password')

            if not username or not password:
                return Response({
                    'error': 'Please provide both username and password'
                }, status=status.HTTP_400_BAD_REQUEST)

            user = authenticate(username=username, password=password)

            if not user:
                return Response({
                    'error': 'Invalid credentials'
                }, status=status.HTTP_401_UNAUTHORIZED)

            token, created = Token.objects.get_or_create(user=user)

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
            return Response({
                'error': str(e)
            }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

class BusListCreateView(generics.ListCreateAPIView):
    queryset = Bus.objects.all()
    serializer_class = BusSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        queryset = Bus.objects.all()
        # Add filtering options
        departure = self.request.query_params.get('departure', None)
        destination = self.request.query_params.get('destination', None)
        date = self.request.query_params.get('date', None)

        if departure:
            queryset = queryset.filter(departure_city__icontains=departure)
        if destination:
            queryset = queryset.filter(destination_city__icontains=destination)
        if date:
            queryset = queryset.filter(departure_date=date)
        
        return queryset

class BusDetailView(generics.RetrieveUpdateDestroyAPIView):
    queryset = Bus.objects.all()
    serializer_class = BusSerializer
    permission_classes = [IsAuthenticated]

class BookingView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request):
        try:
            # Log the request data
            logger.info(f"Booking request data: {request.data}")

            # Validate input data
            if not request.data.get('bus') or not request.data.get('seat'):
                return Response({
                    'error': 'Bus and seat information are required'
                }, status=status.HTTP_400_BAD_REQUEST)

            # Get the bus and seat
            try:
                bus = Bus.objects.get(id=request.data['bus'])
                seat = Seat.objects.get(id=request.data['seat'], bus=bus)
            except (Bus.DoesNotExist, Seat.DoesNotExist) as e:
                return Response({
                    'error': 'Invalid bus or seat'
                }, status=status.HTTP_404_NOT_FOUND)

            # Check if seat is available
            if seat.is_booked:
                return Response({
                    'error': 'This seat is already booked'
                }, status=status.HTTP_400_BAD_REQUEST)

            # Create booking
            booking = Booking.objects.create(
                user=request.user,
                bus=bus,
                seat=seat,
                status='confirmed'
            )

            # Mark seat as booked
            seat.is_booked = True
            seat.last_booked_at = timezone.now()
            seat.last_booked_by = request.user
            seat.save()

            # Return booking details
            serializer = BookingSerializer(booking)
            return Response(serializer.data, status=status.HTTP_201_CREATED)

        except Exception as e:
            logger.error(f"Error creating booking: {str(e)}")
            return Response({
                'error': f'Failed to create booking: {str(e)}'
            }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
class UserBookingView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request, user_id):
        if request.user.id != user_id:
            return Response({
                'error': 'Unauthorized to view these bookings'
            }, status=status.HTTP_401_UNAUTHORIZED)
        
        status_filter = request.query_params.get('status', None)
        bookings = Booking.objects.filter(user_id=user_id)
        
        if status_filter:
            bookings = bookings.filter(status=status_filter)

        serializer = BookingSerializer(bookings, many=True)
        return Response(serializer.data)  
    permission_classes = [IsAuthenticated]

    def get(self, request, user_id):
        # Verify user authorization
        if request.user.id != user_id:
            return Response(
                {'error': 'Unauthorized to view these bookings'},
                status=status.HTTP_401_UNAUTHORIZED
            )
        
        # Get status filter
        status_filter = request.query_params.get('status', None)
        
        # Filter bookings
        bookings = Booking.objects.filter(user_id=user_id)
        if status_filter:
            bookings = bookings.filter(status=status_filter)
            
        # Order by booking time
        bookings = bookings.order_by('-booking_time')

        serializer = BookingSerializer(bookings, many=True)
        return Response(serializer.data)
class CancelBookingView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request, booking_id):
        try:
            booking = Booking.objects.get(id=booking_id)

            if booking.user != request.user:
                return Response({'detail': 'Not authorized to cancel this booking'}, status=status.HTTP_403_FORBIDDEN)

            if not booking.can_cancel:
                return Response({'detail': 'This booking cannot be cancelled'}, status=status.HTTP_400_BAD_REQUEST)

            # Cancel all associated seats
            if hasattr(booking, 'seats'):
                for seat in booking.seats.all():  # assuming ManyToManyField or related_name='seats'
                    seat.cancel()
            elif hasattr(booking, 'seat'):
                booking.seat.cancel()  # assuming OneToOneField or ForeignKey

            booking.status = 'cancelled'
            booking.cancelled_at = timezone.now()
            booking.cancellation_reason = request.data.get('reason', 'Cancelled by user')
            booking.save()

            return Response({
                'detail': 'Booking cancelled successfully',
                'booking_id': booking_id
            })

        except Booking.DoesNotExist:
            return Response({'detail': f'Booking with id {booking_id} not found'}, status=status.HTTP_404_NOT_FOUND)
        except Exception as e:
            return Response({'detail': str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
            
# Add API endpoint for booking stats
@api_view(['GET'])
@permission_classes([IsAuthenticated])
def booking_stats(request, user_id):
    if request.user.id != user_id:
        return Response({
            'error': 'Unauthorized to view these statistics'
        }, status=status.HTTP_401_UNAUTHORIZED)

    total_bookings = Booking.objects.filter(user_id=user_id).count()
    active_bookings = Booking.objects.filter(
        user_id=user_id,
        status='confirmed',
        bus__departure_date__gt=timezone.now()
    ).count()
    past_bookings = Booking.objects.filter(
        user_id=user_id,
        bus__departure_date__lt=timezone.now()
    ).count()
    cancelled_bookings = Booking.objects.filter(
        user_id=user_id,
        status='cancelled'
    ).count()

    return Response({
        'total_bookings': total_bookings,
        'active_bookings': active_bookings,
        'past_bookings': past_bookings,
        'cancelled_bookings': cancelled_bookings
    })