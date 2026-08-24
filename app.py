import os
import tempfile
from flask import Flask, request, send_file, jsonify
from flask_cors import CORS
import ocrmypdf

# এই লাইনটিই সার্ভার খুঁজছিল, এটি থাকা বাধ্যতামূলক
app = Flask(__name__)
CORS(app)

@app.route('/convert', methods=['POST'])
def convert_to_searchable_pdf():
    if 'file' not in request.files:
        return jsonify({"error": "কোনো ফাইল পাওয়া যায়নি!"}), 400
        
    file = request.files['file']
    
    if file.filename == '':
        return jsonify({"error": "ফাইল নির্বাচন করা হয়নি!"}), 400

    fd_in, temp_in = tempfile.mkstemp(suffix=".pdf")
    fd_out, temp_out = tempfile.mkstemp(suffix=".pdf")
    os.close(fd_in)
    os.close(fd_out)

    try:
        file.save(temp_in)
        
        # OCRmyPDF দিয়ে Searchable PDF তৈরি
        ocrmypdf.ocr(temp_in, temp_out, deskew=True, force_ocr=True, language='eng') 
        
        return send_file(
            temp_out, 
            as_attachment=True, 
            download_name=f"Searchable_{file.filename}",
            mimetype='application/pdf'
        )

    except Exception as e:
        return jsonify({"error": f"সার্ভার এরর: {str(e)}"}), 500

if __name__ == '__main__':
    port = int(os.environ.get('PORT', 10000))
    app.run(host='0.0.0.0', port=port)
