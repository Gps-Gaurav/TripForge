from django.contrib.auth import authenticate
from rest_framework.permissions import IsAuthenticated
from rest_framework.authtoken.models import Token
from rest_framework import status, generics
from rest_framework.views import APIView
from .serializers import UserRegisterSerializer, BusSerializer, BookingSerializer
from rest_framework.response import Response
from .models import Bus, Seat, Booking
from django.utils import timezone
from rest_framework.decorators import api_view, permission_classes

class RegisterView(APIView):
    def post(self, request):
        serializer = UserRegisterSerializer(data=request.data)
        if serializer.is_valid():
            user = serializer.save()
            token, created = Token.objects.get_or_create(user=user)
            return Response({
                'token': token.key,
                'user_id': user.id,
                'message': 'Registration successful'
            }, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
    
class LoginView(APIView):
    def post(self, request):
        username = request.data.get('username')
        password = request.data.get('password')
        user = authenticate(username=username, password=password)

        if user:
            token, created = Token.objects.get_or_create(user=user)
            return Response({
                'token': token.key,
                'user_id': user.id,
                'username': user.username,
                'message': 'Login successful'
            }, status=status.HTTP_200_OK)
        return Response({
            'error': 'Invalid credentials'
        }, status=status.HTTP_401_UNAUTHORIZED)

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
        seat_id = request.data.get('seat')
        try:
            seat = Seat.objects.select_for_update().get(id=seat_id)
            
            # Check if seat is already booked
            if seat.is_booked:
                return Response({
                    'error': 'Seat already booked'
                }, status=status.HTTP_400_BAD_REQUEST)

            # Check if bus departure time hasn't passed
            if seat.bus.departure_date < timezone.now():
                return Response({
                    'error': 'Cannot book seat for past departure'
                }, status=status.HTTP_400_BAD_REQUEST)

            seat.is_booked = True
            seat.save()

            booking = Booking.objects.create(
                user=request.user,
                bus=seat.bus,
                seat=seat,
                status='confirmed'  # Add status field to track booking state
            )
            
            serializer = BookingSerializer(booking)
            return Response({
                'message': 'Booking successful',
                'booking': serializer.data
            }, status=status.HTTP_201_CREATED)

        except Seat.DoesNotExist:
            return Response({
                'error': 'Invalid seat ID'
            }, status=status.HTTP_400_BAD_REQUEST)
        
class UserBookingView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request, user_id):
        if request.user.id != user_id:
            return Response({
                'error': 'Unauthorized to view these bookings'
            }, status=status.HTTP_401_UNAUTHORIZED)
        
        # Add status filter
        status_filter = request.query_params.get('status', None)
        bookings = Booking.objects.filter(user_id=user_id)
        
        if status_filter:
            bookings = bookings.filter(status=status_filter)

        serializer = BookingSerializer(bookings, many=True)
        return Response(serializer.data)

class CancelBookingView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request, booking_id):
        try:
            booking = Booking.objects.get(id=booking_id, user=request.user)
            
            # Check if booking can be cancelled
            if not booking.can_cancel:
                return Response(
                    {"detail": "This booking cannot be cancelled"},
                    status=status.HTTP_400_BAD_REQUEST
                )

            # Get cancellation reason from request
            reason = request.data.get('cancellation_reason', 'Cancelled by user')
            
            # Cancel the booking
            booking.cancel_booking(reason=reason)
            
            return Response(
                {"detail": "Booking cancelled successfully"},
                status=status.HTTP_200_OK
            )
            
        except Booking.DoesNotExist:
            return Response(
                {"detail": "Booking not found"},
                status=status.HTTP_404_NOT_FOUND
            )
        except Exception as e:
            return Response(
                {"detail": str(e)},
                status=status.HTTP_400_BAD_REQUEST
            )
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