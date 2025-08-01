// pages/api/webhook.js
import crypto from 'crypto';

export default async function handler(req, res) {
  // ตั้งค่า CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, x-line-signature');

  // Handle preflight requests
  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  // ตรวจสอบ method
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  try {
    console.log('Webhook received:', {
      headers: req.headers,
      body: req.body
    });

    // ตรวจสอบ LINE Signature
    const signature = req.headers['x-line-signature'];
    const channelSecret = process.env.LINE_CHANNEL_SECRET;
    
    if (!channelSecret) {
      console.error('Channel secret not configured');
      return res.status(500).json({ error: 'Channel secret not configured' });
    }

    // สร้าง signature สำหรับตรวจสอบ
    const body = JSON.stringify(req.body);
    const hash = crypto
      .createHmac('SHA256', channelSecret)
      .update(body)
      .digest('base64');

    // ในระหว่างการพัฒนา อาจข้าม signature check ก่อน
    // if (signature !== hash) {
    //   console.error('Invalid signature');
    //   return res.status(401).json({ error: 'Invalid signature' });
    // }

    // ประมวลผล events จาก LINE
    const events = req.body.events || [];
    console.log('Processing events:', events.length);
    
    for (const event of events) {
      console.log('Event type:', event.type);
      
      if (event.type === 'message') {
        if (event.message.type === 'image') {
          console.log('Image message received');
          await handleImageMessage(event);
        } else if (event.message.type === 'text') {
          console.log('Text message:', event.message.text);
          await handleTextMessage(event);
        }
      }
    }

    res.status(200).json({ message: 'OK' });
  } catch (error) {
    console.error('Webhook error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
}

async function handleImageMessage(event) {
  console.log('Processing image from user:', event.source.userId);
  
  try {
    // TODO: ดาวน์โหลดรูปภาพจาก LINE
    // TODO: ส่งไปประมวลผลด้วย OCR
    // TODO: ส่งไป AI เพื่อแยกรายการ
    // TODO: บันทึกลง Supabase
    
    await replyMessage(event.replyToken, 'กำลังประมวลผลใบเสร็จ...');
  } catch (error) {
    console.error('Error processing image:', error);
    await replyMessage(event.replyToken, 'เกิดข้อผิดพลาดในการประมวลผลรูป');
  }
}

async function handleTextMessage(event) {
  const userMessage = event.message.text.toLowerCase();
  
  try {
    if (userMessage.includes('สรุป') || userMessage.includes('รายงาน')) {
      // TODO: ดึงข้อมูลจาก Supabase
      await replyMessage(event.replyToken, 'สรุปค่าใช้จ่ายวันนี้: 0 บาท\n(ยังไม่มีข้อมูล)');
    } else if (userMessage.includes('ช่วย') || userMessage.includes('help')) {
      const helpMessage = `📝 วิธีใช้งาน Expense Tracker Bot:

1. 📸 ส่งรูปใบเสร็จมา
2. 🤖 รอให้ AI อ่านและบันทึกข้อมูล
3. 📊 พิมพ์ "สรุป" เพื่อดูรายงาน

คำสั่งที่ใช้ได้:
• สรุป - ดูรายงานวันนี้
• รายงาน - ดูรายงานเดือนนี้
• ช่วย - ดูคำแนะนำ`;
      
      await replyMessage(event.replyToken, helpMessage);
    } else {
      await replyMessage(event.replyToken, '👋 สวัสดี! ส่งรูปใบเสร็จมาให้ฉันดูหน่อย หรือพิมพ์ "ช่วย" เพื่อดูวิธีใช้');
    }
  } catch (error) {
    console.error('Error handling text message:', error);
    await replyMessage(event.replyToken, 'เกิดข้อผิดพลาดในการประมวลผลข้อความ');
  }
}

async function replyMessage(replyToken, message) {
  const accessToken = process.env.LINE_CHANNEL_ACCESS_TOKEN;
  
  if (!accessToken) {
    console.error('LINE access token not configured');
    return;
  }

  try {
    const response = await fetch('https://api.line.me/v2/bot/message/reply', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${accessToken}`
      },
      body: JSON.stringify({
        replyToken: replyToken,
        messages: [{
          type: 'text',
          text: message
        }]
      })
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Failed to send LINE message:', response.status, errorText);
    } else {
      console.log('Message sent successfully');
    }
  } catch (error) {
    console.error('Error sending LINE message:', error);
  }
}