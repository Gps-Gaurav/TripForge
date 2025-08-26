from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from django.db.models import Count, Q
from django.utils import timezone
from ..models import Booking
from ..serializers.action_serializers import UserBookingStatsSerializer

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def booking_stats(request, user_id):
    if request.user.id != user_id:
        return Response({'error': 'Unauthorized'}, status=401)

    today = timezone.now().date()
    stats = Booking.objects.filter(user_id=user_id).aggregate(
        total_bookings=Count('id'),
        active_bookings=Count('id', filter=Q(status='confirmed') & Q(journey_date__gte=today)),
        past_bookings=Count('id', filter=Q(status='confirmed') & Q(journey_date__lt=today)),
        cancelled_bookings=Count('id', filter=Q(status='cancelled'))
    )
    return Response(stats)
