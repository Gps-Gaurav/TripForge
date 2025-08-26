import json
import uuid
import razorpay
from decimal import Decimal
from django.conf import settings
from django.views.decorators.csrf import csrf_exempt
from rest_framework.decorators import api_view, permission_classes
from rest_framework.response import Response
from rest_framework import status
from rest_framework.permissions import AllowAny
from .models import Payment

# Initialize Razorpay client once
razorpay_client = razorpay.Client(
    auth=(settings.RAZORPAY_KEY_ID, settings.RAZORPAY_KEY_SECRET)
)

@api_view(["POST"])
@permission_classes([AllowAny])  # later: change to IsAuthenticated if needed
def create_order(request):
    try:
        # Fix: Handle decimal amounts properly
        amount_str = request.data.get("amount", 0)
        
        # Convert to float first, then to int (for paise conversion)
        if isinstance(amount_str, str):
            amount = int(float(amount_str) * 100)  # Convert to paise
        else:
            amount = int(float(amount_str) * 100)  # Convert to paise
        
        currency = "INR"

        if amount <= 0:
            return Response({"error": "Invalid amount"}, status=status.HTTP_400_BAD_REQUEST)

        # Fix: Use the initialized client instead of creating a new one with hardcoded keys
        order = razorpay_client.order.create({
            'amount': amount,
            'currency': currency,
            'payment_capture': '1'  # Auto capture
        })

        # DB me save karna
        payment = Payment.objects.create(
            order_id=order["id"],
            amount=amount // 100,  # Store original amount in rupees
            currency=currency,
            status="created",
        )

        return Response({
            "orderId": order["id"],  # Match frontend expectation
            "key": settings.RAZORPAY_KEY_ID,  # Add key for frontend
            "amount": amount,
            "currency": currency,
            "status": "created"
        })

    except Exception as e:
        print(f"Error creating order: {str(e)}")  # For debugging
        return Response({"error": str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

@api_view(["POST"])
@permission_classes([AllowAny])
def verify_payment(request):
    """
    Body from frontend handler:
    {
      "razorpay_order_id": "...",
      "razorpay_payment_id": "...",
      "razorpay_signature": "...",
      "booking_id": "..."  # Added booking_id handling
    }
    """
    try:
        payload = {
            "razorpay_order_id": request.data["razorpay_order_id"],
            "razorpay_payment_id": request.data["razorpay_payment_id"],
            "razorpay_signature": request.data["razorpay_signature"],
        }

        # Verify signature
        razorpay_client.utility.verify_payment_signature(payload)

        # Update Payment record
        payment = Payment.objects.filter(order_id=payload["razorpay_order_id"]).first()
        if payment:
            payment.payment_id = payload["razorpay_payment_id"]
            payment.signature = payload["razorpay_signature"]
            payment.status = "paid"
            payment.save()

            # If booking_id is provided, update the booking status
            booking_id = request.data.get("booking_id")
            if booking_id:
                try:
                    from bookings.models import Booking  # Adjust import as per your app structure
                    booking = Booking.objects.get(id=booking_id)
                    booking.payment_status = 'paid'  # or whatever field you use
                    booking.status = 'confirmed'  # Update booking status
                    booking.save()
                except Booking.DoesNotExist:
                    print(f"Booking {booking_id} not found")
                except Exception as booking_error:
                    print(f"Error updating booking: {str(booking_error)}")

        return Response({"status": "verified"}, status=200)

    except razorpay.errors.SignatureVerificationError:
        # Mark as failed
        oid = request.data.get("razorpay_order_id")
        if oid:
            Payment.objects.filter(order_id=oid).update(status="failed")
        return Response({"status": "failed", "error": "Invalid signature"}, status=400)
    
    except Exception as e:
        # Mark as failed
        oid = request.data.get("razorpay_order_id")
        if oid:
            Payment.objects.filter(order_id=oid).update(status="failed")
        print(f"Payment verification error: {str(e)}")  # For debugging
        return Response({"status": "failed", "error": str(e)}, status=400)

@csrf_exempt
def razorpay_webhook(request):
    """
    Set Webhook URL in Razorpay dashboard to /api/payments/webhook/
    and use secret = RAZORPAY_WEBHOOK_SECRET
    """
    try:
        body = request.body.decode("utf-8")
        signature = request.headers.get("X-Razorpay-Signature", "")

        # Verify webhook signature
        razorpay_client.utility.verify_webhook_signature(
            body, signature, settings.RAZORPAY_WEBHOOK_SECRET
        )

        data = json.loads(body)
        event = data.get("event")
        payload = data.get("payload", {})
        
        # Handle different event structures
        if event == "payment.captured":
            payment_entity = payload.get("payment", {}).get("entity", {})
            order_id = payment_entity.get("order_id")
            payment_id = payment_entity.get("id")
            
            if order_id:
                Payment.objects.filter(order_id=order_id).update(
                    status="paid",
                    payment_id=payment_id
                )
                
        elif event == "payment.failed":
            payment_entity = payload.get("payment", {}).get("entity", {})
            order_id = payment_entity.get("order_id")
            
            if order_id:
                Payment.objects.filter(order_id=order_id).update(status="failed")
                
        elif event == "order.paid":
            order_entity = payload.get("order", {}).get("entity", {})
            order_id = order_entity.get("id")
            
            if order_id:
                Payment.objects.filter(order_id=order_id).update(status="paid")

        return Response({"ok": True}, status=200)

    except Exception as e:
        print(f"Webhook error: {str(e)}")  # For debugging
        return Response({"error": str(e)}, status=400)
