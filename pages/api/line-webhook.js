// await fetch('https://api.line.me/v2/bot/message/push', {
//   method: 'POST',
//   headers: {
//     Authorization: `Bearer ${process.env.LINE_CHANNEL_ACCESS_TOKEN}`,
//     'Content-Type': 'application/json',
//   },
//   body: JSON.stringify({
//     to: userId,
//     messages: [
//       {
//         type: 'text',
//         text: `รายการที่พบ:\n${items.map(i => `• ${i.item}: ${i.price} บาท`).join('\n')}`,
//       },
//     ],
//   }),
// })
