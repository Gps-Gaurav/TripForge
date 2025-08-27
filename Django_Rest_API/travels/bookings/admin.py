from django.contrib import admin
from .models import Bus, Seat, Booking

class BusAdmin(admin.ModelAdmin):
    list_display = ('bus_name', 'number', 'origin', 'destination', 'start_time', 'reach_time', 'no_of_seats', 'price')

class SeatAdmin(admin.ModelAdmin):
    list_display = ('bus', 'seat_number', 'last_booking_info')
    search_fields = ('seat_number', 'bus__bus_name')

    def last_booking_info(self, obj):
        last_booking = obj.bookings.filter(status='confirmed').order_by('-journey_date').first()
        if last_booking:
            return f"{last_booking.journey_date} by {last_booking.user.username}"
        return "Available"
    last_booking_info.short_description = "Last Booking"

class BookingAdmin(admin.ModelAdmin):
    list_display = ('user', 'bus', 'get_seats', 'booking_time', 'origin', 'price')

    def get_seats(self, obj):
        return ", ".join([seat.seat_number for seat in obj.seats.all()])
    get_seats.short_description = "Seats"

admin.site.register(Bus, BusAdmin)
admin.site.register(Seat, SeatAdmin)
admin.site.register(Booking, BookingAdmin)
