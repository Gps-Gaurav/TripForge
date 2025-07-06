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
    bus = models.ForeignKey('Bus', on_delete=models.CASCADE, related_name='seats')  # Kis bus me hai ye seat
    seat_number = models.CharField(max_length=10)  # Seat ka number (A1, B2 etc.)
    is_booked = models.BooleanField(default=False)  # Booked hai ya nahi
    last_booked_at = models.DateTimeField(null=True, blank=True)  # Last booking time
    last_booked_by = models.ForeignKey(
        User,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='booked_seats'  # Kis user ne seat book ki
    )

    class Meta:
        unique_together = ['bus', 'seat_number']  # Bus ke andar same seat_number repeat nahi hoga

    def __str__(self):
        return f"{self.seat_number}"

    # Seat book karne ka logic
    def book(self, user):
        if not self.is_booked:
            self.is_booked = True
            self.last_booked_at = timezone.now()
            self.last_booked_by = user
            self.save()
            return True
        return False

    # Seat cancel karne ka logic
    def cancel(self):
        self.is_booked = False
        self.last_booked_at = None
        self.last_booked_by = None
        self.save()
        return True

# Booking model - user kis bus ki kis seat ko book karta hai uska record
class Booking(models.Model):
    STATUS_CHOICES = (
        ('pending', 'Pending'),       # Booking hui hai but confirm nahi
        ('confirmed', 'Confirmed'),   # Confirmed booking
        ('cancelled', 'Cancelled'),   # Cancelled booking
        ('completed', 'Completed')    # Safar complete ho gaya
    )

    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='bookings')  # Kis user ne booking ki
    bus = models.ForeignKey(Bus, on_delete=models.CASCADE)  # Kis bus ki booking hai
    seat = models.ForeignKey(Seat, on_delete=models.CASCADE)  # Konsi seat book hui
    booking_time = models.DateTimeField(auto_now_add=True)  # Booking ka time
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='confirmed')  # Booking status
    cancelled_at = models.DateTimeField(null=True, blank=True)  # Cancel kab hui
    cancellation_reason = models.TextField(blank=True)  # Cancel karne ka reason

    class Meta:
        ordering = ['-booking_time']  # Latest booking pehle dikhai jaye
        unique_together = ['bus', 'seat', 'status']  # Same seat, same status repeat nahi hona chahiye

    def __str__(self):
        return f"{self.user.username} - {self.bus.bus_name} - Seat {self.seat.seat_number} ({self.status})"

    # Bus ka price return karta hai
    @property
    def price(self):
        return self.bus.price

    # Bus ka origin location
    @property
    def origin(self):
        return self.bus.origin

    # Bus ka destination location
    @property
    def destination(self):
        return self.bus.destination

    # Check karein ki booking cancel ho sakti hai ya nahi
    @property
    def can_cancel(self):
        return self.status not in ['cancelled', 'completed']

    # Booking cancel karne ka logic
    def cancel_booking(self, reason=''):
        if not self.can_cancel:
            raise ValueError("This booking cannot be cancelled")

        self.status = 'cancelled'
        self.cancelled_at = timezone.now()
        self.cancellation_reason = reason

        if self.seat:
            self.seat.cancel()  # Seat ko bhi free karna padega

        self.save()
        return True

    # Booking complete karne ka logic
    def complete_booking(self):
        if self.status not in ['confirmed', 'pending']:
            raise ValueError("Only confirmed or pending bookings can be completed")

        self.status = 'completed'
        self.save()
        return True
