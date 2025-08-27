# travels/models.py
from django.db import models
from django.contrib.auth.models import User
from django.utils import timezone
from django.core.exceptions import ValidationError
from datetime import timedelta

def get_default_departure():
    return timezone.now() + timedelta(days=1)

class Bus(models.Model):
    bus_name = models.CharField(max_length=100)
    number = models.CharField(max_length=20, unique=True)
    origin = models.CharField(max_length=50)
    destination = models.CharField(max_length=50)
    features = models.TextField(blank=True)
    start_time = models.TimeField()
    reach_time = models.TimeField()
    departure_date = models.DateTimeField(default=get_default_departure)
    no_of_seats = models.PositiveIntegerField()
    price = models.DecimalField(max_digits=8, decimal_places=2)
    created_at = models.DateTimeField(default=timezone.now)
    updated_at = models.DateTimeField(auto_now=True)
    is_active = models.BooleanField(default=True)

    def __str__(self):
        return f"{self.bus_name} ({self.number})"

    def available_seats(self, journey_date=None):
        """
        Return number of seats available for given journey_date.
        If journey_date is None, use today's date.
        """
        if journey_date is None:
            journey_date = timezone.now().date()

        # Count number of confirmed seats booked for this bus & date
        booked_count = Booking.objects.filter(
            bus=self,
            journey_date=journey_date,
            status='confirmed'
        ).aggregate(total=models.Count('seats'))['total'] or 0

        # available seats = total seats - booked seats
        return max(0, self.no_of_seats - booked_count)

    @property
    def is_full_today(self):
        return self.available_seats() <= 0


class Seat(models.Model):
    bus = models.ForeignKey(Bus, on_delete=models.CASCADE, related_name='seats')
    seat_number = models.CharField(max_length=10)

    class Meta:
        unique_together = ['bus', 'seat_number']
        ordering = ['seat_number']

    def __str__(self):
        return f"{self.bus.number} - {self.seat_number}"

    def is_available(self, journey_date):
        """
        Returns True if this seat is NOT booked (confirmed) for given journey_date.
        """
        return not Booking.objects.filter(
            seats=self,
            bus=self.bus,
            journey_date=journey_date,
            status='confirmed'
        ).exists()


class Booking(models.Model):
    STATUS_PENDING = 'pending'
    STATUS_CONFIRMED = 'confirmed'
    STATUS_CANCELLED = 'cancelled'
    STATUS_COMPLETED = 'completed'

    STATUS_CHOICES = (
        (STATUS_PENDING, 'Pending'),
        (STATUS_CONFIRMED, 'Confirmed'),
        (STATUS_CANCELLED, 'Cancelled'),
        (STATUS_COMPLETED, 'Completed'),
    )

    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='bookings')
    bus = models.ForeignKey(Bus, on_delete=models.CASCADE, related_name='bookings')
    # Multiple seats per booking:
    seats = models.ManyToManyField(Seat, related_name='bookings')

    booking_time = models.DateTimeField(auto_now_add=True)
    journey_date = models.DateField()

    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default=STATUS_CONFIRMED)
    cancelled_at = models.DateTimeField(null=True, blank=True)
    cancellation_reason = models.TextField(blank=True)

    class Meta:
        ordering = ['-booking_time']
        # Can't create a DB-level conditional unique constraint across a M2M easily,
        # so we validate conflicts in clean()/save() at application level.

    def __str__(self):
        seat_list = ", ".join([s.seat_number for s in self.seats.all()]) if self.pk else "N/A"
        return f"{self.user.username} - {self.bus.bus_name} - Seats [{seat_list}] on {self.journey_date} ({self.status})"

    @property
    def price(self):
        # total = price per seat * number of seats in this booking
        return self.bus.price * (self.seats.count() if self.pk else 0)

    @property
    def origin(self):
        return self.bus.origin

    @property
    def destination(self):
        return self.bus.destination

    @property
    def can_cancel(self):
        return self.status not in [self.STATUS_CANCELLED, self.STATUS_COMPLETED]

    def cancel_booking(self, reason=''):
        if not self.can_cancel:
            raise ValueError("This booking cannot be cancelled")
        self.status = self.STATUS_CANCELLED
        self.cancelled_at = timezone.now()
        self.cancellation_reason = reason
        self.save()
        return True

    def complete_booking(self):
        if self.status not in [self.STATUS_CONFIRMED, self.STATUS_PENDING]:
            raise ValueError("Only confirmed or pending bookings can be completed")
        self.status = self.STATUS_COMPLETED
        self.save()
        return True

    def clean(self):
        """
        Validate seat conflicts: when booking is confirmed (or about to be),
        ensure none of the selected seats are already confirmed for same bus & date.
        Called by full_clean() or explicitly before saving.
        """
        # Only validate when journey_date and seats are present
        if not self.journey_date:
            raise ValidationError({"journey_date": "Journey date is required."})

        # If seats not yet attached (object not saved), skip strict check here;
        # callers should ensure to call `full_clean()` after adding seats, or we validate in save().
        super().clean()

    def save(self, *args, **kwargs):
        """
        Override save to ensure seat-conflict validation:
         - If this booking's status is 'confirmed' (or default is confirmed),
           check each seat is free for the journey_date (excluding this booking itself).
        """
        is_new = self.pk is None
        # Save first if new to get pk (we still need seats attached to validate;
        # we'll perform validation after super() if seats attached).
        super().save(*args, **kwargs)

        # Validate seat conflicts only when status is confirmed
        if self.status == self.STATUS_CONFIRMED:
            # gather seats (ManyToMany may have been set previously)
            seats_qs = self.seats.all()
            conflicting = []
            for seat in seats_qs:
                conflict_exists = Booking.objects.filter(
                    seats=seat,
                    bus=self.bus,
                    journey_date=self.journey_date,
                    status=self.STATUS_CONFIRMED
                ).exclude(pk=self.pk).exists()
                if conflict_exists:
                    conflicting.append(seat.seat_number)

            if conflicting:
                # Rollback: remove this booking or raise validation error.
                # We'll raise ValidationError so caller can catch and handle.
                raise ValidationError({
                    "seats": f"Seats already booked for {self.journey_date}: {', '.join(conflicting)}"
                })

        # No return (saved)
