from django.contrib import admin
from .models import Bus, Seat, Booking


class BusAdmin(admin.ModelAdmin):
    list_display = ('bus_name', 'number', 'origin', 'destination', 'start_time', 'reach_time', 'no_of_seats', 'price')

class SeatAdmin(admin.ModelAdmin):
    list_display = ('bus', 'seat_number', 'last_booking_info')  # is_booked hata diya
    search_fields = ('seat_number', 'bus__bus_name')

    # Optional: dynamic availability info dikha sakte ho
    def last_booking_info(self, obj):
        last_booking = obj.booking_set.filter(status='confirmed').order_by('-journey_date').first()
        if last_booking:
            return f"{last_booking.journey_date} by {last_booking.user.username}"
        return "Available"
    last_booking_info.short_description = "Last Booking"

class BookingAdmin(admin.ModelAdmin):
    list_display = ('user', 'bus', 'seat', 'booking_time', 'origin','price')

admin.site.register(Bus, BusAdmin)
admin.site.register(Seat, SeatAdmin)
admin.site.register(Booking, BookingAdmin)
