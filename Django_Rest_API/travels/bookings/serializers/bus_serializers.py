# travels/bookings/serializers/bus_serializers.py
from rest_framework import serializers
from ..models import Bus, Seat, Booking

class SeatSerializer(serializers.ModelSerializer):
    is_booked = serializers.SerializerMethodField()

    class Meta:
        model = Seat
        fields = ['id', 'seat_number', 'is_booked']

    def get_is_booked(self, seat):
        journey_date = self.context.get('journey_date')
        if journey_date:
            return Booking.objects.filter(
                seats=seat,        # ✅ ManyToMany corrected
                bus=seat.bus,
                journey_date=journey_date,
                status='confirmed'
            ).exists()
        return False


class BusSerializer(serializers.ModelSerializer):
    seats = serializers.SerializerMethodField()
    available_seats = serializers.IntegerField(read_only=True)
    is_full = serializers.BooleanField(read_only=True)

    class Meta:
        model = Bus
        fields = [
            'id', 'bus_name', 'number', 'origin', 'destination',
            'start_time', 'reach_time', 'no_of_seats', 'price',
            'seats', 'available_seats', 'is_full'
        ]

    def get_seats(self, bus):
        journey_date = self.context.get('journey_date')
        seats_qs = bus.seats.all()
        serializer = SeatSerializer(seats_qs, many=True, context={'journey_date': journey_date})
        return serializer.data
