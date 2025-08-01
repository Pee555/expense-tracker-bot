import { lineClient, lineHelpers } from '../../lib/line'
import { groqHelpers } from '../../lib/groq'
import { dbHelpers } from '../../lib/supabase'
import crypto from 'crypto'

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method not allowed' })
  }

  // ตรวจสอบ LINE signature
  const signature = req.headers['x-line-signature']
  const body = JSON.stringify(req.body)
  
  const expectedSignature = crypto
    .createHmac('sha256', process.env.LINE_CHANNEL_SECRET)
    .update(body)
    .digest('base64')
  
  if (signature !== expectedSignature) {
    return res.status(401).json({ message: 'Invalid signature' })
  }

  try {
    const events = req.body.events
    
    for (const event of events) {
      await handleEvent(event)
    }
    
    res.status(200).json({ message: 'OK' })
  } catch (error) {
    console.error('Webhook error:', error)
    res.status(500).json({ error: error.message })
  }
}

async function handleEvent(event) {
  const { type, replyToken, source, message } = event
  const userId = source.userId

  try {
    if (type === 'message') {
      if (message.type === 'image') {
        // รับรูปภาพใบเสร็จ
        await handleImageMessage(replyToken, userId, message.id)
      } else if (message.type === 'text') {
        // รับข้อความ
        await handleTextMessage(replyToken, userId, message.text)
      }
    }
  } catch (error) {
    console.error('Event handling error:', error)
    await lineHelpers.replyMessage(
      replyToken, 
      'เกิดข้อผิดพลาด กรุณาลองใหม่อีกครั้ง'
    )
  }
}

async function handleImageMessage(replyToken, userId, messageId) {
  try {
    // แจ้งว่ากำลังประมวลผล
    await lineHelpers.replyMessage(
      replyToken, 
      'กำลังวิเคราะห์ใบเสร็จ กรุณารอสักครู่...'
    )

    // ดาวน์โหลดรูปภาพ
    const imageBuffer = await lineHelpers.downloadImage(messageId)
    const imageBase64 = imageBuffer.toString('base64')
    
    // อัปโหลดรูปไปยัง Supabase Storage
    const fileName = `${userId}_${Date.now()}.jpg`
    const imageUrl = await dbHelpers.uploadImage(imageBuffer, fileName)
    
    // วิเคราะห์ใบเสร็จด้วย Groq AI
    const analysis = await groqHelpers.analyzeReceipt(imageBase64)
    
    // บันทึกข้อมูลลงฐานข้อมูล
    const receipt = await dbHelpers.saveReceipt(
      userId,
      imageUrl,
      analysis.total_amount,
      analysis.date || new Date().toISOString().split('T')[0]
    )
    
    if (analysis.items && analysis.items.length > 0) {
      await dbHelpers.saveItems(receipt.id, analysis.items)
    }
    
    // ส่งผลลัพธ์กลับ
    const resultMessage = createReceiptSummary(analysis)
    await lineHelpers.pushMessage(userId, resultMessage)
    
  } catch (error) {
    console.error('Image processing error:', error)
    await lineHelpers.pushMessage(
      userId, 
      'ไม่สามารถวิเคราะห์ใบเสร็จได้ กรุณาถ่ายรูปใหม่ให้ชัดขึ้น'
    )
  }
}

async function handleTextMessage(replyToken, userId, text) {
  const message = text.toLowerCase().trim()
  
  if (message.includes('สรุป') || message.includes('summary')) {
    // ขอสรุปรายวัน
    const today = new Date().toISOString().split('T')[0]
    const dailyData = await dbHelpers.getDailySummary(userId, today)
    
    if (dailyData.length === 0) {
      await lineHelpers.replyMessage(
        replyToken, 
        'วันนี้ยังไม่มีการบันทึกใบเสร็จ'
      )
      return
    }
    
    const summary = calculateDailySummary(dailyData)
    const summaryMessage = lineHelpers.createSummaryMessage(summary)
    
    await lineHelpers.replyMessage(replyToken, summaryMessage)
    
  } else if (message.includes('เดือน') || message.includes('month')) {
    // ขอสรุปรายเดือน
    const now = new Date()
    const monthlyData = await dbHelpers.getMonthlySummary(
      userId, 
      now.getFullYear(), 
      now.getMonth() + 1
    )
    
    if (monthlyData.length === 0) {
      await lineHelpers.replyMessage(
        replyToken, 
        'เดือนนี้ยังไม่มีการบันทึกใบเสร็จ'
      )
      return
    }
    
    const summary = calculateMonthlySummary(monthlyData)
    await lineHelpers.replyMessage(replyToken, summary)
    
  } else {
    // ข้อความทั่วไป
    await lineHelpers.replyMessage(
      replyToken, 
      'สวัสดีครับ! 📱\n\nส่งรูปใบเสร็จมาให้ผมวิเคราะห์ได้เลย\n\nหรือพิมพ์:\n• "สรุป" - ดูสรุปวันนี้\n• "เดือน" - ดูสรุปเดือนนี้'
    )
  }
}

function createReceiptSummary(analysis) {
  let message = `✅ วิเคราะห์ใบเสร็จเสร็จแล้ว!\n\n`
  
  if (analysis.store_name) {
    message += `🏪 ร้าน: ${analysis.store_name}\n`
  }
  
  if (analysis.date) {
    message += `📅 วันที่: ${analysis.date}\n`
  }
  
  message += `💰 ยอดรวม: ${analysis.total_amount?.toLocaleString() || 'ไม่ระบุ'} บาท\n\n`
  
  if (analysis.items && analysis.items.length > 0) {
    message += `📝 รายการสินค้า:\n`
    analysis.items.forEach(item => {
      message += `• ${item.name} - ${item.price?.toLocaleString()} บาท\n`
    })
  }
  
  message += `\n💡 ข้อมูลถูกบันทึกแล้ว พิมพ์ "สรุป" เพื่อดูสรุปวันนี้`
  
  return message
}

function calculateDailySummary(receipts) {
  const total = receipts.reduce((sum, receipt) => sum + parseFloat(receipt.total_amount || 0), 0)
  
  return {
    date: new Date().toLocaleDateString('th-TH'),
    receiptCount: receipts.length,
    totalAmount: total
  }
}

function calculateMonthlySummary(receipts) {
  const total = receipts.reduce((sum, receipt) => sum + parseFloat(receipt.total_amount || 0), 0)
  const itemCount = receipts.reduce((sum, receipt) => sum + (receipt.items?.length || 0), 0)
  
  return `📊 สรุปเดือนนี้\n\n💰 ยอดรวม: ${total.toLocaleString()} บาท\n📋 จำนวนใบเสร็จ: ${receipts.length} ใบ\n🛍️ จำนวนรายการ: ${itemCount} รายการ`
}