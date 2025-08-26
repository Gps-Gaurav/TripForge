from django.contrib.auth.models import User
from django.utils import timezone
from rest_framework import serializers
from ..models import Bus, Seat, Booking  # relative import of models
from .bus_serializers import BusSerializer, SeatSerializer  # relative import within same folder

class BookingCreateSerializer(serializers.ModelSerializer):
    journey_date = serializers.DateField(required=True)

    class Meta:
        model = Booking
        fields = ['bus', 'seat', 'journey_date']

    def validate(self, data):
        if data['seat'].bus != data['bus']:
            raise serializers.ValidationError("Seat does not belong to the selected bus")

        if Booking.objects.filter(
            seat=data['seat'],
            bus=data['bus'],
            journey_date=data['journey_date'],
            status='confirmed'
        ).exists():
            raise serializers.ValidationError("This seat is already booked for the selected date")

        return data

    def create(self, validated_data):
        user = self.context['request'].user
        return Booking.objects.create(
            user=user,
            bus=validated_data['bus'],
            seat=validated_data['seat'],
            journey_date=validated_data['journey_date'],
            status='confirmed'
        )

class BookingSerializer(serializers.ModelSerializer):
    bus = BusSerializer(read_only=True)
    seat = SeatSerializer(read_only=True)
    user = serializers.StringRelatedField()
    status_display = serializers.SerializerMethodField()
    can_cancel = serializers.BooleanField(read_only=True)

    class Meta:
        model = Booking
        fields = [
            'id', 'user', 'bus', 'seat', 'booking_time', 'journey_date',
            'status', 'status_display', 'cancelled_at', 'cancellation_reason', 'can_cancel'
        ]

    def get_status_display(self, obj):
        return obj.get_status_display()
