from django.contrib.auth.models import User
from django.utils import timezone
from rest_framework import serializers
from ..models import Bus, Seat, Booking  # relative import of models
from .bus_serializers import BusSerializer, SeatSerializer  # relative import within same folder


class BookingCreateSerializer(serializers.ModelSerializer):
    journey_date = serializers.DateField(required=True)
    seats = serializers.PrimaryKeyRelatedField(
        many=True, queryset=Seat.objects.all(), write_only=True
    )

    class Meta:
        model = Booking
        fields = ['bus', 'seats', 'journey_date']

    def validate(self, data):
        bus = data['bus']
        seats = data['seats']

        # check all seats belong to the same bus
        for seat in seats:
            if seat.bus != bus:
                raise serializers.ValidationError(
                    f"Seat {seat.seat_number} does not belong to the selected bus"
                )

            # check if already booked
            if Booking.objects.filter(
                seats=seat,
                bus=bus,
                journey_date=data['journey_date'],
                status='confirmed'
            ).exists():
                raise serializers.ValidationError(
                    f"Seat {seat.seat_number} is already booked for this date"
                )

        return data

    def create(self, validated_data):
        user = self.context['request'].user
        seats = validated_data.pop('seats')
        booking = Booking.objects.create(
            user=user,
            bus=validated_data['bus'],
            journey_date=validated_data['journey_date'],
            status='confirmed'
        )
        booking.seats.set(seats)  # many-to-many seat assignment
        return booking


class BookingSerializer(serializers.ModelSerializer):
    bus = BusSerializer(read_only=True)
    seats = SeatSerializer(read_only=True, many=True)
    user = serializers.StringRelatedField()
    status_display = serializers.SerializerMethodField()
    can_cancel = serializers.BooleanField(read_only=True)

    class Meta:
        model = Booking
        fields = [
            'id', 'user', 'bus', 'seats', 'booking_time', 'journey_date',
            'status', 'status_display', 'cancelled_at', 'cancellation_reason', 'can_cancel'
        ]

    def get_status_display(self, obj):
        return obj.get_status_display()
