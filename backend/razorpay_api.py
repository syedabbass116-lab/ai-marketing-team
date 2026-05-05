from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
import razorpay
import hashlib
import hmac
import os
from typing import Optional

app = FastAPI()

# CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173", "http://localhost:3000"],  # Frontend URLs
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Razorpay client
client = razorpay.Client(
    auth=("rzp_test_SlkKwYIOooZtJP", "wc6FoML9BHWC8VNi0VA1q1QH")
)

class OrderRequest(BaseModel):
    amount: int  # amount in paise
    currency: str = "INR"
    receipt: Optional[str] = None

class PaymentVerification(BaseModel):
    razorpay_order_id: str
    razorpay_payment_id: str
    razorpay_signature: str

@app.post("/api/create-order")
async def create_order(order_data: OrderRequest):
    """
    Create a Razorpay order
    """
    try:
        # Validate minimum amount (100 paise = ₹1)
        if order_data.amount < 100:
            raise HTTPException(status_code=400, detail="Minimum amount is ₹1")
        
        # Create order data
        order_data_dict = {
            "amount": order_data.amount,
            "currency": order_data.currency,
            "receipt": order_data.receipt or f"receipt_{order_data.amount}",
        }
        
        # Create Razorpay order
        order = client.order.create(data=order_data_dict)
        
        return {
            "order_id": order["id"],
            "amount": order["amount"],
            "currency": order["currency"],
            "receipt": order.get("receipt")
        }
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to create order: {str(e)}")

@app.post("/api/verify-payment")
async def verify_payment(payment_data: PaymentVerification):
    """
    Verify Razorpay payment signature
    """
    try:
        # Generate signature
        generated_signature = hmac.new(
            "wc6FoML9BHWC8VNi0VA1q1QH".encode(),
            f"{payment_data.razorpay_order_id}|{payment_data.razorpay_payment_id}".encode(),
            hashlib.sha256
        ).hexdigest()
        
        # Compare signatures
        if generated_signature != payment_data.razorpay_signature:
            raise HTTPException(status_code=400, detail="Invalid signature")
        
        # Verify payment with Razorpay
        payment = client.payment.fetch(payment_data.razorpay_payment_id)
        
        if payment["status"] != "captured":
            raise HTTPException(status_code=400, detail="Payment not successful")
        
        return {
            "status": "success",
            "message": "Payment verified successfully",
            "payment_id": payment_data.razorpay_payment_id,
            "order_id": payment_data.razorpay_order_id
        }
        
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Payment verification failed: {str(e)}")

@app.get("/")
async def root():
    return {"message": "Razorpay API is running"}

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
