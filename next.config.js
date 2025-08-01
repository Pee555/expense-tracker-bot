export const config = {
  api: {
    bodyParser: {
      sizeLimit: '10mb',
    },
  },
};

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method Not Allowed' });
  }

  const events = req.body.events || [];
  for (const event of events) {
    if (event.type === 'message' && event.message.type === 'image') {
      const userId = event.source.userId;
      const messageId = event.message.id;
      console.log('📸 ได้รับรูปภาพ:', messageId);
      // ส่งไปประมวลผล OCR ได้เลย
    }
  }

  return res.status(200).json({ message: 'Webhook received' });
}
