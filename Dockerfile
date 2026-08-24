# বেস ইমেজ (এখানে 3.10 এর বদলে 3.11 করা হয়েছে)
FROM python:3.11-slim

# সিস্টেম সফটওয়্যার (Tesseract, Ghostscript) ইনস্টল করা
RUN apt-get update && apt-get install -y \
    tesseract-ocr \
    tesseract-ocr-eng \
    tesseract-ocr-ben \
    ghostscript \
    && rm -rf /var/lib/apt/lists/*

# ওয়ার্কিং ডিরেক্টরি সেট করা
WORKDIR /app

# ফাইলগুলো সার্ভারে কপি করা
COPY requirements.txt .
COPY app.py .

# Python প্যাকেজ ইনস্টল করা
RUN pip install --no-cache-dir -r requirements.txt

# গুনিকর্ন (Gunicorn) দিয়ে সার্ভার রান করা
CMD ["gunicorn", "-b", "0.0.0.0:10000", "app:app", "--timeout", "120"]
