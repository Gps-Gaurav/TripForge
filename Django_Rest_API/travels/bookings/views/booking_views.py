from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from django.db import transaction
from django.db.models import F
from ..models import Booking, Seat, Bus
from ..serializers.booking_serializers import BookingSerializer, BookingCreateSerializer
from django.utils import timezone
import logging
from rest_framework.permissions import IsAuthenticated

logger = logging.getLogger(__name__)


class BookingView(APIView):
    permission_classes = [IsAuthenticated]

    @transaction.atomic
    def post(self, request):
        serializer = BookingCreateSerializer(data=request.data, context={'request': request})
        if not serializer.is_valid():
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

        try:
            # Serializer ke andar save ke time seat lock hoga
            booking = serializer.save()
            return Response(
                BookingSerializer(booking).data,
                status=status.HTTP_201_CREATED
            )
        except Exception as e:
            logger.error(f"Booking failed: {str(e)}")
            return Response(
                {"detail": "Booking failed", "error": str(e)},
                status=status.HTTP_400_BAD_REQUEST
            )


class UserBookingView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request, user_id):
        if request.user.id != user_id:
            return Response(
                {'error': 'Unauthorized'},
                status=status.HTTP_401_UNAUTHORIZED
            )

        status_filter = request.query_params.get('status')
        bookings = Booking.objects.filter(user_id=user_id)
        if status_filter:
            bookings = bookings.filter(status=status_filter)

        bookings = bookings.order_by('-booking_time')
        serializer = BookingSerializer(bookings, many=True)
        return Response(serializer.data)


class CancelBookingView(APIView):
    permission_classes = [IsAuthenticated]

    @transaction.atomic
    def post(self, request, booking_id):
        try:
            booking = Booking.objects.select_for_update().get(id=booking_id)

            if booking.user != request.user:
                return Response(
                    {'detail': 'Not authorized'},
                    status=status.HTTP_403_FORBIDDEN
                )

            if not booking.can_cancel:
                return Response(
                    {'detail': 'Cannot cancel this booking'},
                    status=status.HTTP_400_BAD_REQUEST
                )

            # Seat ko dobara available karna
            seats = Seat.objects.filter(booking=booking).select_for_update()
            seats.update(is_booked=False, booking=None)

            booking.status = 'cancelled'
            booking.cancelled_at = timezone.now()
            booking.cancellation_reason = request.data.get('reason', 'Cancelled by user')
            booking.save()

            return Response(
                {'detail': 'Booking cancelled successfully', 'booking_id': booking_id},
                status=status.HTTP_200_OK
            )

        except Booking.DoesNotExist:
            return Response(
                {'detail': 'Booking not found'},
                status=status.HTTP_404_NOT_FOUND
            )
        except Exception as e:
            logger.error(f"Cancel booking error: {str(e)}")
            return Response(
                {'detail': 'Internal server error', 'error': str(e)},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )
