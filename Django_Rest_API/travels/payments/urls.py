from django.urls import path
from .views import create_order, verify_payment, razorpay_webhook

urlpatterns = [
    path("create-order/", create_order),
    path("verify/", verify_payment),
    path("webhook/", razorpay_webhook),
]
