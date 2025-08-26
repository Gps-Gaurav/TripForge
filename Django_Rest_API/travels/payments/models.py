from django.db import models

class Payment(models.Model):
    STATUS = [
        ("created", "created"),
        ("paid", "paid"),
        ("failed", "failed"),
    ]
    order_id = models.CharField(max_length=64, unique=True)
    payment_id = models.CharField(max_length=64, blank=True, null=True)
    signature = models.TextField(blank=True, null=True)
    amount = models.IntegerField()  # paise
    currency = models.CharField(max_length=8, default="INR")
    status = models.CharField(max_length=16, choices=STATUS, default="created")
    receipt = models.CharField(max_length=64, blank=True, null=True)
    notes = models.JSONField(default=dict, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
