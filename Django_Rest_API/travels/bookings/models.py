# models.py with Clean Code & Hinglish Comments

from django.db import models
from django.contrib.auth.models import User
from django.utils import timezone
from datetime import timedelta

# 🚍 Default departure date 1 din baad ka ho

def get_default_departure():
    return timezone.now() + timedelta(days=1)

# 🚌 Bus Model
class Bus(models.Model):
    bus_name = models.CharField(max_length=100)
    number = models.CharField(max_length=20, unique=True)
    origin = models.CharField(max_length=50)
    destination = models.CharField(max_length=50)
    features = models.TextField()
    start_time = models.TimeField()
    reach_time = models.TimeField()
    departure_date = models.DateTimeField(default=get_default_departure)
    no_of_seats = models.PositiveBigIntegerField()
    price = models.DecimalField(max_digits=8, decimal_places=2)
    created_at = models.DateTimeField(default=timezone.now)
    updated_at = models.DateTimeField(auto_now=True)
    is_active = models.BooleanField(default=True)

    def __str__(self):
        return f"{self.bus_name} {self.number}"

    # 🔢 Available seats ka count
    @property
    def available_seats(self):
        return self.seats.filter(is_booked=False).count()

    # ✅ Kya bus full ho chuki hai?
    @property
    def is_full(self):
        return self.available_seats == 0

# 💺 Seat Model
class Seat(models.Model):
    bus = models.ForeignKey('Bus', on_delete=models.CASCADE, related_name='seats')
    seat_number = models.CharField(max_length=10)
    is_booked = models.BooleanField(default=False)
    last_booked_at = models.DateTimeField(null=True, blank=True)
    last_booked_by = models.ForeignKey(
        User,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='booked_seats'
    )

    class Meta:
        unique_together = ['bus', 'seat_number']

    def __str__(self):
        return f"{self.seat_number}"

    # 🟢 Seat book karne ka logic
    def book(self, user):
        if not self.is_booked:
            self.is_booked = True
            self.last_booked_at = timezone.now()
            self.last_booked_by = user
            self.save()
            return True
        return False

    # 🔴 Seat cancel karne ka logic
    def cancel(self):
        self.is_booked = False
        self.last_booked_at = None
        self.last_booked_by = None
        self.save()
        return True

# 📦 Booking Model
class Booking(models.Model):
    STATUS_CHOICES = (
        ('pending', 'Pending'),
        ('confirmed', 'Confirmed'),
        ('cancelled', 'Cancelled'),
        ('completed', 'Completed')
    )

    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='bookings')
    bus = models.ForeignKey(Bus, on_delete=models.CASCADE)
    seat = models.ForeignKey(Seat, on_delete=models.CASCADE)
    booking_time = models.DateTimeField(auto_now_add=True)
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='confirmed')
    cancelled_at = models.DateTimeField(null=True, blank=True)
    cancellation_reason = models.TextField(blank=True)

    class Meta:
        ordering = ['-booking_time']
        unique_together = ['bus', 'seat', 'status']

    def __str__(self):
        return f"{self.user.username} - {self.bus.bus_name} - Seat {self.seat.seat_number} ({self.status})"

    # 💰 Bus ka price
    @property
    def price(self):
        return self.bus.price

    # 🛣️ Origin
    @property
    def origin(self):
        return self.bus.origin

    # 🎯 Destination
    @property
    def destination(self):
        return self.bus.destination

    # ❓ Booking cancel ho sakta hai ya nahi
    @property
    def can_cancel(self):
        return self.status not in ['cancelled', 'completed']

    # ❌ Booking cancel karne ka logic
    def cancel_booking(self, reason=''):
        if not self.can_cancel:
            raise ValueError("This booking cannot be cancelled")

        self.status = 'cancelled'
        self.cancelled_at = timezone.now()
        self.cancellation_reason = reason

        if self.seat:
            self.seat.cancel()

        self.save()
        return True

    # ✅ Booking complete karne ka logic
    def complete_booking(self):
        if self.status not in ['confirmed', 'pending']:
            raise ValueError("Only confirmed or pending bookings can be completed")

        self.status = 'completed'
        self.save()
        return True
