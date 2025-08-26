from rest_framework import serializers
from ..models import Bus, Seat, Booking
from django.contrib.auth.models import User
from django.utils import timezone

class SeatSerializer(serializers.ModelSerializer):
    is_booked = serializers.SerializerMethodField()

    class Meta:
        model = Seat
        fields = ['id', 'seat_number', 'is_booked']

    def get_is_booked(self, seat):
        journey_date = self.context.get('journey_date')
        if journey_date:
            return Booking.objects.filter(
                seat=seat,
                bus=seat.bus,
                journey_date=journey_date,
                status='confirmed'
            ).exists()
        return False

class BusSerializer(serializers.ModelSerializer):
    seats = SeatSerializer(many=True, read_only=True)
    available_seats = serializers.IntegerField(read_only=True)
    is_full = serializers.BooleanField(read_only=True)

    class Meta:
        model = Bus
        fields = [
            'id', 'bus_name', 'number', 'origin', 'destination',
            'start_time', 'reach_time', 'no_of_seats', 'price',
            'seats', 'available_seats', 'is_full'
        ]