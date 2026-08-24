import os
import tempfile
from flask import Flask, request, send_file, jsonify
from flask_cors import CORS
import ocrmypdf

app = Flask(__name__)
CORS(app)

@app.route('/convert', methods=['POST'])
def convert_to_searchable_pdf():
    if 'file' not in request.files:
        return jsonify({"error": "কোনো ফাইল পাওয়া যায়নি!"}), 400
        
    file = request.files['file']
    
    if file.filename == '':
        return jsonify({"error": "ফাইল নির্বাচন করা হয়নি!"}), 400

    # ফাইলের আসল এক্সটেনশন বের করা (যেমন: .pdf, .jpg, .png)
    ext = os.path.splitext(file.filename)[1].lower()
    
    if ext not in ['.pdf', '.png', '.jpg', '.jpeg']:
        return jsonify({"error": "শুধুমাত্র PDF, JPG বা PNG সাপোর্ট করে!"}), 400

    # অরিজিনাল এক্সটেনশন অনুযায়ী টেম্পোরারি ফাইল তৈরি
    fd_in, temp_in = tempfile.mkstemp(suffix=ext)
    fd_out, temp_out = tempfile.mkstemp(suffix=".pdf")
    os.close(fd_in)
    os.close(fd_out)

    try:
        file.save(temp_in)
        
        # 🚀 ম্যাজিক: যদি ফাইলটি ছবি হয়, তবে image_dpi=300 যুক্ত করতে হবে। 
        # এখানে language='eng+ben' দেওয়া হয়েছে যাতে ইংরেজি ও বাংলা দুটোই সাপোর্ট করে!
        if ext in ['.png', '.jpg', '.jpeg']:
            ocrmypdf.ocr(temp_in, temp_out, deskew=True, force_ocr=True, language='eng+ben', image_dpi=300)
        else:
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
        # কাজ শেষ হলে সার্ভার থেকে টেম্পোরারি ফাইল মুছে ফেলা (যাতে সার্ভার ক্র্যাশ না করে)
        if os.path.exists(temp_in):
            os.remove(temp_in)
        if os.path.exists(temp_out):
            os.remove(temp_out)

if __name__ == '__main__':
    port = int(os.environ.get('PORT', 10000))
    app.run(host='0.0.0.0', port=port)
