from rest_framework import serializers
from .models import Bus, Seat, Booking
from django.contrib.auth.models import User
from django.utils import timezone

class UserRegisterSerializer(serializers.ModelSerializer):
    password = serializers.CharField(write_only=True)
    confirm_password = serializers.CharField(write_only=True)

    class Meta:
        model = User
        fields = ['username', 'email', 'password', 'confirm_password']

    def validate(self, data):
        # Check if passwords match
        if data['password'] != data['confirm_password']:
            raise serializers.ValidationError("Passwords do not match")
        return data

    def create(self, validated_data):
        # Remove confirm_password from the data
        validated_data.pop('confirm_password', None)
        user = User.objects.create_user(
            username=validated_data['username'],
            email=validated_data['email'],
            password=validated_data['password']
        )
        return user

class SeatSerializer(serializers.ModelSerializer):
    last_booked_by = serializers.StringRelatedField(read_only=True)
    
    class Meta:
        model = Seat
        fields = [
            'id',
            'seat_number',
            'is_booked',
            'last_booked_at',
            'last_booked_by'
        ]
        read_only_fields = ['last_booked_at', 'last_booked_by']

class BusSerializer(serializers.ModelSerializer):
    seats = SeatSerializer(many=True, read_only=True)
    available_seats = serializers.IntegerField(read_only=True)
    is_full = serializers.BooleanField(read_only=True)

    class Meta:
        model = Bus
        fields = [
            'id',
            'bus_name',
            'number',
            'origin',
            'destination',
            'features',
            'start_time',
            'reach_time',
            'no_of_seats',
            'price',
            'seats',
            'available_seats',
            'is_full',
            'created_at',
            'updated_at',
            'is_active'
        ]
        read_only_fields = ['created_at', 'updated_at']

class BusSummarySerializer(serializers.ModelSerializer):
    available_seats = serializers.IntegerField(read_only=True)
    
    class Meta:
        model = Bus
        fields = [
            'id',
            'bus_name',
            'number',
            'origin',
            'destination',
            'start_time',
            'reach_time',
            'price',
            'available_seats'
        ]

class BookingSerializer(serializers.ModelSerializer):
    bus = BusSummarySerializer(read_only=True)
    seat = SeatSerializer(read_only=True)
    user = serializers.StringRelatedField()
    price = serializers.DecimalField(
        max_digits=8,
        decimal_places=2,
        read_only=True
    )
    origin = serializers.CharField(read_only=True)
    destination = serializers.CharField(read_only=True)
    can_cancel = serializers.BooleanField(read_only=True)
    status_display = serializers.SerializerMethodField()

    class Meta:
        model = Booking
        fields = [
            'id',
            'user',
            'bus',
            'seat',
            'booking_time',
            'status',
            'status_display',
            'cancelled_at',
            'cancellation_reason',
            'price',
            'origin',
            'destination',
            'can_cancel'
        ]
        read_only_fields = [
            'user',
            'booking_time',
            'bus',
            'seat',
            'price',
            'origin',
            'destination',
            'cancelled_at'
        ]

    def get_status_display(self, obj):
        return obj.get_status_display()

class BookingCreateSerializer(serializers.ModelSerializer):
    class Meta:
        model = Booking
        fields = ['bus', 'seat']

    def validate(self, data):
        if data['seat'].bus != data['bus']:
            raise serializers.ValidationError("Seat does not belong to the selected bus")
        if data['seat'].is_booked:
            raise serializers.ValidationError("This seat is already booked")
        return data

    def create(self, validated_data):
        user = self.context['request'].user
        booking = Booking.objects.create(
            user=user,
            bus=validated_data['bus'],
            seat=validated_data['seat'],
            status='confirmed'
        )
        
        # Update seat status
        seat = validated_data['seat']
        seat.is_booked = True
        seat.last_booked_at = timezone.now()
        seat.last_booked_by = user
        seat.save()
        
        return booking

class CancellationSerializer(serializers.Serializer):
    reason = serializers.CharField(
        required=False,
        allow_blank=True,
        max_length=500
    )

    def validate(self, data):
        booking_id = self.context.get('booking_id')
        user = self.context.get('user')
        
        try:
            booking = Booking.objects.get(id=booking_id, user=user)
            if not booking.can_cancel:
                raise serializers.ValidationError(
                    "This booking cannot be cancelled"
                )
        except Booking.DoesNotExist:
            raise serializers.ValidationError("Booking not found")
            
        return data


class UserBookingStatsSerializer(serializers.Serializer):
    total_bookings = serializers.IntegerField()
    active_bookings = serializers.IntegerField()
    cancelled_bookings = serializers.IntegerField()
    past_bookings = serializers.IntegerField()