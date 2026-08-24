# অফিসিয়াল Python ইমেজ ব্যবহার করুন
FROM python:3.10-slim

# OCR-এর জন্য প্রয়োজনীয় সমস্ত লিনাক্স প্যাকেজ এবং বাংলা ভাষার প্যাক ইনস্টল করুন
RUN apt-get update && apt-get install -y \
    tesseract-ocr \
    tesseract-ocr-eng \
    tesseract-ocr-ben \
    ghostscript \
    poppler-utils \
    unpaper \
    qpdf \
    && rm -rf /var/lib/apt/lists/*

# কাজের ডিরেক্টরি সেট করুন
WORKDIR /app

# রিকোয়ারমেন্টস কপি করে ইনস্টল করুন
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# আপনার প্রজেক্টের সমস্ত ফাইল কপি করুন
COPY . .

# Gunicorn ব্যবহার করে অ্যাপ রান করুন (Cloud Run-এর জন্য সেরা)
CMD exec gunicorn --bind :$PORT --workers 1 --threads 8 --timeout 0 app:app
