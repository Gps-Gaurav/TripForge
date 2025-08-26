from rest_framework import generics
from rest_framework.permissions import IsAuthenticated
from ..models import Bus, Booking
from ..serializers.bus_serializers import BusSerializer
from django.utils import timezone
from django.db.models import Count, Q

class BusListCreateView(generics.ListCreateAPIView):
    queryset = Bus.objects.all()
    serializer_class = BusSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        queryset = Bus.objects.all()
        departure = self.request.query_params.get('departure')
        destination = self.request.query_params.get('destination')
        journey_date = self.request.query_params.get('journey_date')

        if departure:
            queryset = queryset.filter(origin__icontains=departure)
        if destination:
            queryset = queryset.filter(destination__icontains=destination)

        if journey_date:
            # Filter out buses fully booked for this date
            booked_counts = Booking.objects.filter(
                journey_date=journey_date,
                status='confirmed'
            ).values('bus').annotate(booked_count=Count('id'))
            
            fully_booked_ids = [b['bus'] for b in booked_counts if b['booked_count'] >= Bus.objects.get(id=b['bus']).no_of_seats]
            queryset = queryset.exclude(id__in=fully_booked_ids)

        return queryset

    def get_serializer_context(self):
        context = super().get_serializer_context()
        context['journey_date'] = self.request.query_params.get('journey_date')
        return context


class BusDetailView(generics.RetrieveUpdateDestroyAPIView):
    queryset = Bus.objects.all()
    serializer_class = BusSerializer
    permission_classes = [IsAuthenticated]

    def get_serializer_context(self):
        context = super().get_serializer_context()
        context['journey_date'] = self.request.query_params.get('journey_date')
        return context
