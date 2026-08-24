FROM python:3.11-slim

# সিস্টেম সফটওয়্যার ইনস্টল করা
RUN apt-get update && apt-get install -y \
    tesseract-ocr \
    tesseract-ocr-eng \
    tesseract-ocr-ben \
    ghostscript \
    && rm -rf /var/lib/apt/lists/*

WORKDIR /app

COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

COPY app.py .

# Google Cloud Run-এর ডায়নামিক পোর্ট ব্যবহার করার জন্য বিশেষ কমান্ড
CMD exec gunicorn --bind :$PORT --workers 1 --threads 8 --timeout 120 app:app
