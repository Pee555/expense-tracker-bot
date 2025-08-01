export async function extractTextFromImage(base64Image) {
  const res = await fetch(
    'https://vision.googleapis.com/v1/images:annotate?key=' + process.env.GOOGLE_CLOUD_VISION_API_KEY,
    {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        requests: [
          {
            image: { content: base64Image },
            features: [{ type: 'TEXT_DETECTION' }],
          },
        ],
      }),
    }
  )
  const data = await res.json()
  return data.responses[0]?.fullTextAnnotation?.text || ''
}
