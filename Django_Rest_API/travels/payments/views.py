import json, uuid, razorpay
from decimal import Decimal, ROUND_HALF_UP
from django.conf import settings
from django.views.decorators.csrf import csrf_exempt
from rest_framework.decorators import api_view
from rest_framework.response import Response
from rest_framework import status
from .models import Payment

client = razorpay.Client(auth=(settings.RAZORPAY_KEY_ID, settings.RAZORPAY_KEY_SECRET))

@api_view(["POST"])
def create_order(request):
    """
    Body: { amount: 499 }  # INR (rupees)
    """
    try:
        rupees = Decimal(str(request.data.get("amount", "0")))
        if rupees <= 0:
            return Response({"error": "Invalid amount"}, status=400)

        amount_paise = int((rupees * 100).quantize(Decimal("1"), rounding=ROUND_HALF_UP))
        receipt = f"rcpt_{uuid.uuid4().hex[:12]}"

        order = client.order.create({
            "amount": amount_paise,
            "currency": "INR",
            "receipt": receipt,
            "payment_capture": 1,   # auto-capture on success
            "notes": {"app": "react-django-demo"}
        })

        Payment.objects.create(
            order_id=order["id"],
            amount=amount_paise,
            currency=order["currency"],
            status="created",
            receipt=receipt,
            notes=order.get("notes", {})
        )

        # Send key id from backend so frontend me hardcode na ho (best practice)
        return Response({
            "orderId": order["id"],
            "amount": order["amount"],
            "currency": order["currency"],
            "key": settings.RAZORPAY_KEY_ID
        })
    except Exception as e:
        return Response({"error": str(e)}, status=500)


@api_view(["POST"])
def verify_payment(request):
    """
    Body from frontend handler:
    {
      "razorpay_order_id": "...",
      "razorpay_payment_id": "...",
      "razorpay_signature": "..."
    }
    """
    try:
        payload = {
            "razorpay_order_id": request.data["razorpay_order_id"],
            "razorpay_payment_id": request.data["razorpay_payment_id"],
            "razorpay_signature": request.data["razorpay_signature"],
        }

        client.utility.verify_payment_signature(payload)

        # update DB
        Payment.objects.filter(order_id=payload["razorpay_order_id"]).update(
            payment_id=payload["razorpay_payment_id"],
            signature=payload["razorpay_signature"],
            status="paid"
        )
        return Response({"status": "verified"})
    except Exception as e:
        # mark failed
        oid = request.data.get("razorpay_order_id")
        if oid:
            Payment.objects.filter(order_id=oid).update(status="failed")
        return Response({"status": "failed", "error": str(e)}, status=400)


@csrf_exempt
def razorpay_webhook(request):
    """
    Set Webhook URL to /api/payments/webhook/ and secret = RAZORPAY_WEBHOOK_SECRET
    """
    try:
        body = request.body.decode("utf-8")
        signature = request.headers.get("X-Razorpay-Signature", "")

        # verify webhook signature
        client.utility.verify_webhook_signature(body, signature, settings.RAZORPAY_WEBHOOK_SECRET)

        data = json.loads(body)
        event = data.get("event")
        payload = data.get("payload", {})
        order_entity = payload.get("order", {}).get("entity", {})
        payment_entity = payload.get("payment", {}).get("entity", {})

        if event == "payment.captured":
            Payment.objects.filter(order_id=order_entity.get("id")).update(
                status="paid",
                payment_id=payment_entity.get("id")
            )
        elif event in ("payment.failed", "order.paid"):  # add more if needed
            Payment.objects.filter(order_id=order_entity.get("id")).update(status="failed")

        return Response({"ok": True})
    except Exception as e:
        return Response({"error": str(e)}, status=400)
