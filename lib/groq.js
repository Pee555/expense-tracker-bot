import Groq from 'groq-sdk'

const groq = new Groq({
  apiKey: process.env.GROQ_API_KEY,
})

export const groqHelpers = {
  // วิเคราะห์ใบเสร็จจากรูปภาพ
  async analyzeReceipt(imageBase64) {
    try {
      const prompt = `
        วิเคราะห์ใบเสร็จในรูปภาพนี้ และแยกข้อมูลออกมาในรูปแบบ JSON:
        
        {
          "total_amount": จำนวนเงินรวม (ตัวเลขเท่านั้น),
          "date": "วันที่ในรูปแบบ YYYY-MM-DD",
          "store_name": "ชื่อร้าน",
          "items": [
            {
              "name": "ชื่อสินค้า",
              "price": ราคา (ตัวเลขเท่านั้น),
              "quantity": จำนวน,
              "category": "หมวดหมู่สินค้า เช่น อาหาร, เครื่องดื่ม, ของใช้"
            }
          ]
        }
        
        หากอ่านข้อมูลไม่ชัด ให้ใส่ null
        ตอบเป็น JSON เท่านั้น ไม่ต้องมีคำอธิบายอื่น
      `

      const completion = await groq.chat.completions.create({
        messages: [
          {
            role: 'user',
            content: [
              {
                type: 'text',
                text: prompt
              },
              {
                type: 'image_url',
                image_url: {
                  url: `data:image/jpeg;base64,${imageBase64}`
                }
              }
            ]
          }
        ],
        model: 'llava-v1.5-7b-4096-preview', // รองรับ vision
        temperature: 0.1,
        max_tokens: 1000
      })

      const result = completion.choices[0]?.message?.content
      
      // แปลง string เป็น JSON
      try {
        return JSON.parse(result)
      } catch (parseError) {
        console.error('JSON parse error:', parseError)
        throw new Error('ไม่สามารถแปลงผลลัพธ์เป็น JSON ได้')
      }

    } catch (error) {
      console.error('Groq API error:', error)
      throw new Error('เกิดข้อผิดพลาดในการวิเคราะห์ใบเสร็จ')
    }
  },

  // สร้างสรุปรายวัน
  async generateDailySummary(receipts) {
    const prompt = `
      สร้างสรุปค่าใช้จ่ายรายวันจากข้อมูลใบเสร็จนี้:
      ${JSON.stringify(receipts, null, 2)}
      
      สร้างข้อความสรุปที่เป็นมิตรและเข้าใจง่าย รวมถึง:
      - ยอดรวมทั้งหมด
      - จำนวนใบเสร็จ
      - หมวดหมู่ที่ซื้อมากที่สุด
      - คำแนะนำหรือข้อสังเกต
    `

    const completion = await groq.chat.completions.create({
      messages: [
        {
          role: 'user',
          content: prompt
        }
      ],
      model: 'mixtral-8x7b-32768',
      temperature: 0.7,
      max_tokens: 500
    })

    return completion.choices[0]?.message?.content
  }
}