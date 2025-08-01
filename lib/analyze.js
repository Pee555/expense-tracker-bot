export async function analyzeReceiptText(text) {
  const prompt = `
ข้อความต่อไปนี้มาจากใบเสร็จ โปรดแยกเป็นชื่อสินค้าและราคาที่ซื้อจริง:

"${text}"

แสดงผลเป็น JSON แบบนี้:
[
  {"item": "ข้าวไข่เจียว", "price": 40},
  {"item": "น้ำเปล่า", "price": 10}
]
`

  const res = await fetch('https://api.openai.com/v1/chat/completions', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      model: 'gpt-4',
      messages: [{ role: 'user', content: prompt }],
      temperature: 0.2,
    }),
  })

  const data = await res.json()
  return JSON.parse(data.choices[0].message.content)
}
