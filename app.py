import os
import tempfile
from flask import Flask, request, send_file, jsonify
from flask_cors import CORS
import ocrmypdf

app = Flask(__name__)

# 🔒 সিকিউরিটি আপডেট: শুধুমাত্র আপনার ওয়েবসাইট (pdf.shmwb.in) থেকে রিকোয়েস্ট গ্রহণ করবে।
# অন্য কেউ API লিংক চুরি করে ব্যবহার করতে চাইলে সার্ভার সেটি ব্লক করে দেবে।
ALLOWED_ORIGINS = ["https://pdf.shmwb.in", "http://pdf.shmwb.in"]
CORS(app, resources={r"/*": {"origins": ALLOWED_ORIGINS}})

@app.route('/convert', methods=['POST'])
def convert_to_searchable_pdf():
    if 'file' not in request.files:
        return jsonify({"error": "কোনো ফাইল পাওয়া যায়নি!"}), 400
        
    file = request.files['file']
    
    if file.filename == '':
        return jsonify({"error": "ফাইল নির্বাচন করা হয়নি!"}), 400

    ext = os.path.splitext(file.filename)[1].lower()
    
    if ext not in ['.pdf', '.png', '.jpg', '.jpeg']:
        return jsonify({"error": "শুধুমাত্র PDF, JPG বা PNG সাপোর্ট করে!"}), 400

    fd_in, temp_in = tempfile.mkstemp(suffix=ext)
    fd_out, temp_out = tempfile.mkstemp(suffix=".pdf")
    os.close(fd_in)
    os.close(fd_out)

    try:
        file.save(temp_in)
        
        # 🚀 Cloud Run (4GB RAM)-এর জন্য শক্তিশালী সেটিংস
        if ext in ['.png', '.jpg', '.jpeg']:
            # ছবির ক্ষেত্রে image_dpi=300 দেওয়া বাধ্যতামূলক
            ocrmypdf.ocr(temp_in, temp_out, deskew=True, force_ocr=True, language='eng+ben', image_dpi=300)
        else:
            # PDF-এর ক্ষেত্রে নরমাল স্ক্যান
            ocrmypdf.ocr(temp_in, temp_out, deskew=True, force_ocr=True, language='eng+ben') 
        
        return send_file(
            temp_out, 
            as_attachment=True, 
            download_name=f"Searchable_{os.path.splitext(file.filename)[0]}.pdf",
            mimetype='application/pdf'
        )

    except Exception as e:
        print("Error Details:", str(e))
        return jsonify({"error": f"সার্ভার এরর: {str(e)}"}), 500
        
    finally:
        # কাজ শেষ হলে সার্ভার থেকে টেম্পোরারি ফাইল মুছে ফেলা
        if os.path.exists(temp_in):
            os.remove(temp_in)
        if os.path.exists(temp_out):
            os.remove(temp_out)

if __name__ == '__main__':
    # Google Cloud Run-এর ডিফল্ট পোর্ট 8080
    port = int(os.environ.get('PORT', 8080))
    app.run(host='0.0.0.0', port=port)
