import os
import tempfile
from flask import Flask, request, send_file, jsonify
from flask_cors import CORS
import ocrmypdf
from PIL import Image

app = Flask(__name__)
CORS(app)

def compress_image(image_path):
    """মেমরি বাঁচানোর জন্য বড় ছবিকে ছোট করবে"""
    try:
        with Image.open(image_path) as img:
            # যদি ছবি অনেক বড় হয়, তবে ছোট করবে (Max 1500px)
            img.thumbnail((1500, 1500))
            img.save(image_path, optimize=True, quality=85)
    except Exception as e:
        print("Image compression error:", e)

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
        
        # ফাইলটি ছবি হলে আগে সাইজ কমিয়ে নেবে
        if ext in ['.png', '.jpg', '.jpeg']:
            compress_image(temp_in)
        
        # Render-এর 512MB RAM এর জন্য সবচেয়ে অপ্টিমাইজড সেটিংস
        ocrmypdf.ocr(
            temp_in, 
            temp_out, 
            deskew=True, 
            force_ocr=True, 
            language='eng+ben',
            jobs=1,
            optimize=0,
            output_type='pdfa',
            fast_web_view=0
        ) 
        
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
        if os.path.exists(temp_in):
            os.remove(temp_in)
        if os.path.exists(temp_out):
            os.remove(temp_out)

if __name__ == '__main__':
    port = int(os.environ.get('PORT', 10000))
    app.run(host='0.0.0.0', port=port)
