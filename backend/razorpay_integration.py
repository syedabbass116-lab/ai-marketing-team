from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
import razorpay
import hmac
import hashlib
import os
from dotenv import load_dotenv

load_dotenv()

app = FastAPI()

# CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173", "https://your-vercel-domain.vercel.app"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Razorpay client
client = razorpay.Client(auth=(
    os.environ["RAZORPAY_KEY_ID"],
    os.environ["RAZORPAY_KEY_SECRET"]
))

class OrderRequest(BaseModel):
    amount: int
    currency: str = "INR"

class VerifyRequest(BaseModel):
    razorpay_order_id: str
    razorpay_payment_id: str
    razorpay_signature: str

@app.post("/api/create-order")
def create_order(data: OrderRequest):
    if data.amount < 100:
        raise HTTPException(status_code=400, detail="Amount must be at least 100 paise")
    
    try:
        order = client.order.create({
            "amount": data.amount,
            "currency": data.currency,
            "receipt": f"receipt_{os.urandom(4).hex()}"
        })
        return {
            "order_id": order["id"],
            "amount": order["amount"],
            "currency": order["currency"]
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/api/verify-payment")
def verify_payment(data: VerifyRequest):
    if not all([data.razorpay_order_id, data.razorpay_payment_id, data.razorpay_signature]):
        raise HTTPException(status_code=400, detail="Missing required fields")
    
    body = f"{data.razorpay_order_id}|{data.razorpay_payment_id}"
    expected = hmac.new(
        os.environ["RAZORPAY_KEY_SECRET"].encode(),
        body.encode(),
        hashlib.sha256
    ).hexdigest()
    
    if expected == data.razorpay_signature:
        return {"success": True, "payment_id": data.razorpay_payment_id}
    else:
        raise HTTPException(status_code=400, detail="Invalid signature")

@app.get("/")
async def root():
    return {"message": "Razorpay API is running"}

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
