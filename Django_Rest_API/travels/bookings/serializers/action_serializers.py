
from rest_framework import serializers
from ..models import Bus, Seat, Booking
from django.contrib.auth.models import User
from django.utils import timezone

class CancellationSerializer(serializers.Serializer):
    reason = serializers.CharField(required=False, allow_blank=True, max_length=500)

    def validate(self, data):
        booking_id = self.context.get('booking_id')
        user = self.context.get('user')
        try:
            booking = Booking.objects.get(id=booking_id, user=user)
            if not booking.can_cancel:
                raise serializers.ValidationError("This booking cannot be cancelled")
        except Booking.DoesNotExist:
            raise serializers.ValidationError("Booking not found")
        return data
    
    
class UserBookingStatsSerializer(serializers.Serializer):
    total_bookings = serializers.IntegerField()
    active_bookings = serializers.IntegerField()
    cancelled_bookings = serializers.IntegerField()
    past_bookings = serializers.IntegerField()
