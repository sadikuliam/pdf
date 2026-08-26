module.exports = async (req, res) => {
  // CORS Headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { format } = req.body || {};
  const apiKey = process.env.CLOUDCONVERT_API_KEY;

  if (!apiKey) {
    return res.status(500).json({ error: 'CLOUDCONVERT_API_KEY is missing in Vercel Environment Variables.' });
  }

  try {
    const response = await fetch('https://api.cloudconvert.com/v2/jobs', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        "tasks": {
          "import-my-file": { 
            "operation": "upload" 
          },
          "convert-my-file": {
            "operation": "convert",
            "input": ["import-my-file"],
            "output_format": format || 'docx'
          },
          "export-my-file": {
            "operation": "export/url",
            "input": ["convert-my-file"]
          }
        }
      })
    });

    const data = await response.json();

    if (!response.ok || !data.data || !data.data.tasks) {
      return res.status(500).json({ error: data.message || 'CloudConvert API Auth Failure' });
    }

    const uploadTask = data.data.tasks.find(t => t.name === 'import-my-file');

    return res.status(200).json({
      uploadUrl: uploadTask.result.form.url,
      uploadParams: uploadTask.result.form.parameters,
      jobId: data.data.id
    });
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
};
