# Use Python image
FROM python:3.10

# Set working directory
WORKDIR /app

# Copy files
COPY . .

# Install dependencies
RUN pip install -r requirements.txt

# Expose port (IMPORTANT)
EXPOSE 10000

# Start FastAPI (CRITICAL)
CMD ["uvicorn", "razorpay_integration:app", "--host", "0.0.0.0", "--port", "10000"]