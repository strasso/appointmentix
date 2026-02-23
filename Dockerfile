FROM python:3.11-slim

ENV PYTHONDONTWRITEBYTECODE=1
ENV PYTHONUNBUFFERED=1
ENV PORT=4173

WORKDIR /app

COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

COPY . .

EXPOSE 4173

CMD ["sh", "-c", "gunicorn --workers 2 --threads 4 --timeout 60 --bind 0.0.0.0:${PORT} wsgi:app"]
MOBILE_OTP_BRAND_NAME=Appointmentix
MOBILE_OTP_TTL_SECONDS=300
MOBILE_OTP_MAX_ATTEMPTS=5
MOBILE_OTP_RESEND_COOLDOWN_SECONDS=30
MOBILE_OTP_DEBUG=true
