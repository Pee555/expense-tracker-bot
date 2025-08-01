import { Client } from '@line/bot-sdk'
import axios from 'axios'

const config = {
  channelAccessToken: process.env.LINE_CHANNEL_ACCESS_TOKEN,
  channelSecret: process.env.LINE_CHANNEL_SECRET,
}

export const lineClient = new Client(config)

export const lineHelpers = {
  // ส่งข้อความ
  async replyMessage(replyToken, message) {
    return await lineClient.replyMessage(replyToken, {
      type: 'text',
      text: message
    })
  },

  // ส่งข้อความแบบ Push
  async pushMessage(userId, message) {
    return await lineClient.pushMessage(userId, {
      type: 'text',
      text: message
    })
  },

  // ดาวน์โหลดรูปภาพจาก LINE
  async downloadImage(messageId) {
    try {
      const response = await axios({
        method: 'get',
        url: `https://api-data.line.me/v2/bot/message/${messageId}/content`,
        headers: {
          'Authorization': `Bearer ${process.env.LINE_CHANNEL_ACCESS_TOKEN}`
        },
        responseType: 'arraybuffer'
      })
      
      return Buffer.from(response.data)
    } catch (error) {
      console.error('Error downloading image:', error)
      throw error
    }
  },

  // สร้าง Flex Message สำหรับแสดงผลสรุป
  createSummaryMessage(summary) {
    return {
      type: 'flex',
      altText: 'สรุปค่าใช้จ่าย',
      contents: {
        type: 'bubble',
        header: {
          type: 'box',
          layout: 'vertical',
          contents: [
            {
              type: 'text',
              text: 'สรุปค่าใช้จ่าย',
              weight: 'bold',
              size: 'xl',
              color: '#ffffff'
            }
          ],
          backgroundColor: '#27ACB2',
          paddingAll: '20px'
        },
        body: {
          type: 'box',
          layout: 'vertical',
          contents: [
            {
              type: 'text',
              text: `วันที่: ${summary.date}`,
              size: 'md',
              color: '#555555'
            },
            {
              type: 'text',
              text: `จำนวนใบเสร็จ: ${summary.receiptCount} ใบ`,
              size: 'md',
              color: '#555555'
            },
            {
              type: 'text',
              text: `ยอดรวม: ${summary.totalAmount.toLocaleString()} บาท`,
              size: 'lg',
              weight: 'bold',
              color: '#27ACB2'
            }
          ],
          spacing: 'md'
        }
      }
    }
  }
}