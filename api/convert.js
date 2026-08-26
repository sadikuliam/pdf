export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  const { format } = req.body;
  const apiKey = process.env.CLOUDCONVERT_API_KEY;

  try {
    const response = await fetch('https://api.cloudconvert.com/v2/jobs', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        "tasks": {
          "import-my-file": { "operation": "upload" },
          "convert-my-file": {
            "operation": "convert",
            "input": ["import-my-file"],
            "output_format": format
          },
          "export-my-file": {
            "operation": "export/url",
            "input": ["convert-my-file"]
          }
        }
      })
    });

    const data = await response.json();
    const uploadTask = data.data.tasks.find(t => t.name === 'import-my-file');

    res.status(200).json({
      uploadUrl: uploadTask.result.form.url,
      uploadParams: uploadTask.result.form.parameters,
      jobId: data.data.id
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
}
