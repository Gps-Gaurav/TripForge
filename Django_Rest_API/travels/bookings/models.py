from django.db import models
from django.contrib.auth.models import User
from django.utils import timezone
from datetime import timedelta

# Default departure date: aaj se 1 din baad
def get_default_departure():
    return timezone.now() + timedelta(days=1)

# Bus model - ek bus ki basic details yahan store hoti hain
class Bus(models.Model):
    bus_name = models.CharField(max_length=100)  # Bus ka naam
    number = models.CharField(max_length=20, unique=True)  # Unique bus number
    origin = models.CharField(max_length=50)  # Starting point
    destination = models.CharField(max_length=50)  # Ending point
    features = models.TextField()  # Bus ke features (AC, WiFi etc.)
    start_time = models.TimeField()  # Departure time
    reach_time = models.TimeField()  # Arrival time
    departure_date = models.DateTimeField(default=get_default_departure)  # Default: kal ki date
    no_of_seats = models.PositiveBigIntegerField()  # Total seat count
    price = models.DecimalField(max_digits=8, decimal_places=2)  # Ticket price
    created_at = models.DateTimeField(default=timezone.now)  # Record kab banaya
    updated_at = models.DateTimeField(auto_now=True)  # Last update time
    is_active = models.BooleanField(default=True)  # Bus active hai ya nahi

    def __str__(self):
        return f"{self.bus_name} {self.number}"

    # Available seats count jo abhi book nahi hui hain
    @property
    def available_seats(self):
        return self.seats.filter(is_booked=False).count()

    # Check karein ki bus full ho chuki hai ya nahi
    @property
    def is_full(self):
        return self.available_seats == 0

# Seat model - har bus ki seat ka record rakhta hai
class Seat(models.Model):
    bus = models.ForeignKey('Bus', on_delete=models.CASCADE, related_name='seats')
    seat_number = models.CharField(max_length=10)

    class Meta:
        unique_together = ['bus', 'seat_number']

    def __str__(self):
        return f"{self.seat_number}"

    # Optional: Dynamic check for a specific journey date
    def is_available(self, journey_date):
        return not Booking.objects.filter(
            seat=self,
            bus=self.bus,
            journey_date=journey_date,
            status='confirmed'
        ).exists()


class Booking(models.Model):
    STATUS_CHOICES = (
        ('pending', 'Pending'),
        ('confirmed', 'Confirmed'),
        ('cancelled', 'Cancelled'),
        ('completed', 'Completed'),
    )

    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='bookings')
    bus = models.ForeignKey('Bus', on_delete=models.CASCADE)
    seat = models.ForeignKey(Seat, on_delete=models.CASCADE)

    booking_time = models.DateTimeField(auto_now_add=True)
    journey_date = models.DateField()

    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='confirmed')
    cancelled_at = models.DateTimeField(null=True, blank=True)
    cancellation_reason = models.TextField(blank=True)

    class Meta:
        ordering = ['-booking_time']
        constraints = [
            models.UniqueConstraint(
                fields=['bus', 'seat', 'journey_date'],
                condition=models.Q(status='confirmed'),
                name='unique_confirmed_seat_per_date'
            )
        ]

    def __str__(self):
        return f"{self.user.username} - {self.bus.bus_name} - Seat {self.seat.seat_number} on {self.journey_date} ({self.status})"

    @property
    def price(self):
        return self.bus.price

    @property
    def origin(self):
        return self.bus.origin

    @property
    def destination(self):
        return self.bus.destination

    @property
    def can_cancel(self):
        return self.status not in ['cancelled', 'completed']

    def cancel_booking(self, reason=''):
        if not self.can_cancel:
            raise ValueError("This booking cannot be cancelled")

        self.status = 'cancelled'
        self.cancelled_at = timezone.now()
        self.cancellation_reason = reason
        self.save()
        return True

    def complete_booking(self):
        if self.status not in ['confirmed', 'pending']:
            raise ValueError("Only confirmed or pending bookings can be completed")

        self.status = 'completed'
        self.save()
        return True
