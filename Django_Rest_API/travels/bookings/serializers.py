from rest_framework import serializers
from .models import Bus, Seat, Booking
from django.contrib.auth.models import User
from django.utils import timezone
from django.contrib.auth.password_validation import validate_password

# 🚹 User Registration Serializer
class UserRegisterSerializer(serializers.ModelSerializer):
    password = serializers.CharField(write_only=True, required=True, validators=[validate_password])
    password2 = serializers.CharField(write_only=True, required=True)  # Confirm password

    class Meta:
        model = User
        fields = ('username', 'email', 'password', 'password2', 'first_name', 'last_name')
        extra_kwargs = {
            'first_name': {'required': True},
            'last_name': {'required': True},
            'email': {'required': True}
        }

    # ✅ Passwords match kar rahe hain ya nahi check karo
    def validate(self, attrs):
        if attrs['password'] != attrs['password2']:
            raise serializers.ValidationError({"password": "Password fields didn't match."})
        return attrs

    # ✅ Naya user create karo with hashed password
    def create(self, validated_data):
        user = User.objects.create(
            username=validated_data['username'],
            email=validated_data['email'],
            first_name=validated_data['first_name'],
            last_name=validated_data['last_name']
        )
        user.set_password(validated_data['password'])  # Password encrypt karo
        user.save()
        return user

# 🪑 Individual Seat Details Serializer
class SeatSerializer(serializers.ModelSerializer):
    last_booked_by = serializers.StringRelatedField(read_only=True)  # User ka naam dikhao

    class Meta:
        model = Seat
        fields = ['id', 'seat_number', 'is_booked', 'last_booked_at', 'last_booked_by']
        read_only_fields = ['last_booked_at', 'last_booked_by']

# 🚌 Full Bus Serializer with Seats
class BusSerializer(serializers.ModelSerializer):
    seats = SeatSerializer(many=True, read_only=True)  # All seats show karo
    available_seats = serializers.IntegerField(read_only=True)  # Custom field: kitni seats available
    is_full = serializers.BooleanField(read_only=True)  # Bus full hai ya nahi

    class Meta:
        model = Bus
        fields = [
            'id', 'bus_name', 'number', 'origin', 'destination', 'features',
            'start_time', 'reach_time', 'no_of_seats', 'price',
            'seats', 'available_seats', 'is_full',
            'created_at', 'updated_at', 'is_active'
        ]
        read_only_fields = ['created_at', 'updated_at']

# 🚌 Summary view ke liye lightweight Bus info
class BusSummarySerializer(serializers.ModelSerializer):
    available_seats = serializers.IntegerField(read_only=True)

    class Meta:
        model = Bus
        fields = [
            'id', 'bus_name', 'number', 'origin', 'destination',
            'start_time', 'reach_time', 'price', 'available_seats'
        ]

# 📄 Booking Detail Serializer
class BookingSerializer(serializers.ModelSerializer):
    bus = BusSummarySerializer(read_only=True)
    seat = SeatSerializer(read_only=True)
    user = serializers.StringRelatedField()
    price = serializers.DecimalField(max_digits=8, decimal_places=2, read_only=True)
    origin = serializers.CharField(read_only=True)
    destination = serializers.CharField(read_only=True)
    can_cancel = serializers.BooleanField(read_only=True)
    status_display = serializers.SerializerMethodField()  # Human readable status

    class Meta:
        model = Booking
        fields = [
            'id', 'user', 'bus', 'seat', 'booking_time', 'status',
            'status_display', 'cancelled_at', 'cancellation_reason',
            'price', 'origin', 'destination', 'can_cancel'
        ]
        read_only_fields = [
            'user', 'booking_time', 'bus', 'seat',
            'price', 'origin', 'destination', 'cancelled_at'
        ]

    # 🟢 Status ko human-readable banakar bhejo
    def get_status_display(self, obj):
        return obj.get_status_display()

# 🆕 Booking Create karne ke liye Serializer
class BookingCreateSerializer(serializers.ModelSerializer):
    class Meta:
        model = Booking
        fields = ['bus', 'seat']

    # ✅ Validation: seat bus ka part hona chahiye aur free bhi ho
    def validate(self, data):
        if data['seat'].bus != data['bus']:
            raise serializers.ValidationError("Seat does not belong to the selected bus")
        if data['seat'].is_booked:
            raise serializers.ValidationError("This seat is already booked")
        return data

    # ✅ Booking create karo aur seat ko update bhi karo
    def create(self, validated_data):
        user = self.context['request'].user
        booking = Booking.objects.create(
            user=user,
            bus=validated_data['bus'],
            seat=validated_data['seat'],
            status='confirmed'
        )

        # 🚩 Seat status update karo
        seat = validated_data['seat']
        seat.is_booked = True
        seat.last_booked_at = timezone.now()
        seat.last_booked_by = user
        seat.save()

        return booking

# ❌ Booking cancel karne ke reason input ke liye
class CancellationSerializer(serializers.Serializer):
    reason = serializers.CharField(required=False, allow_blank=True, max_length=500)

    # ✅ Booking cancel valid hai ya nahi check karo
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

# 📊 Booking Stats (for dashboard etc.)
class UserBookingStatsSerializer(serializers.Serializer):
    total_bookings = serializers.IntegerField()
    active_bookings = serializers.IntegerField()
    cancelled_bookings = serializers.IntegerField()
    past_bookings = serializers.IntegerField()
