const bookElement = document.getElementById('book');
const loadingElement = document.getElementById('loading');
const pageInfo = document.getElementById('page-info');

// ✅ PDF ফাইলের নাম (আপডেটেড)
const pdfFile = 'maga123.pdf';

let pageFlip;
let pdfDoc = null;

// লোডিং দেখানো
function showLoading(show) {
  loadingElement.style.display = show ? 'block' : 'none';
}

// PDF লোড এবং রেন্ডার করা
async function loadPDF() {
  showLoading(true);
  
  try {
    // PDF লোড করা
    const loadingTask = pdfjsLib.getDocument(pdfFile);
    pdfDoc = await loadingTask.promise;
    
    const totalPages = pdfDoc.numPages;
    console.log(`মোট পাতা: ${totalPages}`);

    // PageFlip ইনিশিয়ালাইজ করা
    pageFlip = new St.PageFlip(bookElement, {
      width: 500,
      height: 700,
      size: 'stretch',
      minWidth: 300,
      maxWidth: 1000,
      minHeight: 400,
      maxHeight: 1000,
      maxShadowOpacity: 0.5,
      showCover: true,
      mobileScrollSupport: false
    });

    // প্রতিটি পাতা রেন্ডার করা
    for (let i = 1; i <= totalPages; i++) {
      const page = await pdfDoc.getPage(i);
      
      // ক্যানভাস তৈরি করা
      const canvas = document.createElement('canvas');
      const context = canvas.getContext('2d');
      
      // স্কেল সেট করা (রেজোলিউশন ভালো রাখার জন্য)
      const viewport = page.getViewport({ scale: 1.5 });
      canvas.width = viewport.width;
      canvas.height = viewport.height;
      
      // PDF পাতা রেন্ডার করা
      await page.render({
        canvasContext: context,
        viewport: viewport
      }).promise;
      
      // পাতা যোগ করা
      const pageDiv = document.createElement('div');
      pageDiv.className = 'page-content';
      pageDiv.appendChild(canvas);
      
      pageFlip.loadFromHTML([pageDiv]);
    }

    // ইভেন্ট লিসেনার
    pageFlip.on('flip', (e) => {
      pageInfo.textContent = `পাতা ${e.data + 1}`;
    });

    showLoading(false);
    
  } catch (error) {
    console.error('PDF লোড করতে সমস্যা:', error);
    loadingElement.textContent = 'সমস্যা হয়েছে! PDF ফাইলটি ঠিকমতো লোড হয়নি।';
    loadingElement.style.background = 'rgba(244, 67, 54, 0.9)';
    loadingElement.style.display = 'block';
  }
}

// বাটন কন্ট্রোল
document.getElementById('next').addEventListener('click', () => {
  if (pageFlip) pageFlip.flipNext();
});

document.getElementById('prev').addEventListener('click', () => {
  if (pageFlip) pageFlip.flipPrev();
});

// পেজ লোড হলে শুরু করা
window.addEventListener('load', loadPDF);
