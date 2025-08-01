"use strict";(()=>{var e={};e.id=538,e.ids=[538],e.modules={2261:e=>{e.exports=require("@line/bot-sdk")},145:e=>{e.exports=require("next/dist/compiled/next-server/pages-api.runtime.prod.js")},4770:e=>{e.exports=require("crypto")},9648:e=>{e.exports=import("axios")},6219:e=>{e.exports=import("groq-sdk")},6249:(e,t)=>{Object.defineProperty(t,"l",{enumerable:!0,get:function(){return function e(t,a){return a in t?t[a]:"then"in t&&"function"==typeof t.then?t.then(t=>e(t,a)):"function"==typeof t&&"default"===a?t:void 0}}})},525:(e,t,a)=>{a.a(e,async(e,r)=>{try{a.r(t),a.d(t,{config:()=>u,default:()=>c,routeModule:()=>p});var s=a(1802),n=a(7153),o=a(6249),i=a(9753),l=e([i]);i=(l.then?(await l)():l)[0];let c=(0,o.l)(i,"default"),u=(0,o.l)(i,"config"),p=new s.PagesAPIRouteModule({definition:{kind:n.x.PAGES_API,page:"/api/webhook",pathname:"/api/webhook",bundlePath:"",filename:""},userland:i});r()}catch(e){r(e)}})},6884:(e,t,a)=>{a.a(e,async(e,r)=>{try{a.d(t,{c:()=>i});var s=a(6219),n=e([s]);let o=new(s=(n.then?(await n)():n)[0]).default({apiKey:process.env.GROQ_API_KEY}),i={async analyzeReceipt(e){try{let t=`
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
      `,a=await o.chat.completions.create({messages:[{role:"user",content:[{type:"text",text:t},{type:"image_url",image_url:{url:`data:image/jpeg;base64,${e}`}}]}],model:"llava-v1.5-7b-4096-preview",temperature:.1,max_tokens:1e3}),r=a.choices[0]?.message?.content;try{return JSON.parse(r)}catch(e){throw console.error("JSON parse error:",e),Error("ไม่สามารถแปลงผลลัพธ์เป็น JSON ได้")}}catch(e){throw console.error("Groq API error:",e),Error("เกิดข้อผิดพลาดในการวิเคราะห์ใบเสร็จ")}},async generateDailySummary(e){let t=`
      สร้างสรุปค่าใช้จ่ายรายวันจากข้อมูลใบเสร็จนี้:
      ${JSON.stringify(e,null,2)}
      
      สร้างข้อความสรุปที่เป็นมิตรและเข้าใจง่าย รวมถึง:
      - ยอดรวมทั้งหมด
      - จำนวนใบเสร็จ
      - หมวดหมู่ที่ซื้อมากที่สุด
      - คำแนะนำหรือข้อสังเกต
    `,a=await o.chat.completions.create({messages:[{role:"user",content:t}],model:"mixtral-8x7b-32768",temperature:.7,max_tokens:500});return a.choices[0]?.message?.content}};r()}catch(e){r(e)}})},7553:(e,t,a)=>{a.a(e,async(e,r)=>{try{a.d(t,{f:()=>c});var s=a(2261),n=a(9648),o=e([n]);n=(o.then?(await o)():o)[0];let i={channelAccessToken:process.env.LINE_CHANNEL_ACCESS_TOKEN,channelSecret:process.env.LINE_CHANNEL_SECRET},l=new s.Client(i),c={replyMessage:async(e,t)=>await l.replyMessage(e,{type:"text",text:t}),pushMessage:async(e,t)=>await l.pushMessage(e,{type:"text",text:t}),async downloadImage(e){try{let t=await (0,n.default)({method:"get",url:`https://api-data.line.me/v2/bot/message/${e}/content`,headers:{Authorization:`Bearer ${process.env.LINE_CHANNEL_ACCESS_TOKEN}`},responseType:"arraybuffer"});return Buffer.from(t.data)}catch(e){throw console.error("Error downloading image:",e),e}},createSummaryMessage:e=>({type:"flex",altText:"สรุปค่าใช้จ่าย",contents:{type:"bubble",header:{type:"box",layout:"vertical",contents:[{type:"text",text:"สรุปค่าใช้จ่าย",weight:"bold",size:"xl",color:"#ffffff"}],backgroundColor:"#27ACB2",paddingAll:"20px"},body:{type:"box",layout:"vertical",contents:[{type:"text",text:`วันที่: ${e.date}`,size:"md",color:"#555555"},{type:"text",text:`จำนวนใบเสร็จ: ${e.receiptCount} ใบ`,size:"md",color:"#555555"},{type:"text",text:`ยอดรวม: ${e.totalAmount.toLocaleString()} บาท`,size:"lg",weight:"bold",color:"#27ACB2"}],spacing:"md"}}})};r()}catch(e){r(e)}})},395:(e,t,a)=>{a.d(t,{T:()=>s});let r=(0,require("@supabase/supabase-js").createClient)("https://jlmoowrkijaqyaxqfbpb.supabase.co","eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImpsbW9vd3JraWphcXlheHFmYnBiIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTQwMzkyMTIsImV4cCI6MjA2OTYxNTIxMn0.yIWG2eS96ouYzCLMd7oGJkiZUpzmzrHp_-6l2PIIRKY"),s={async saveReceipt(e,t,a,s){let{data:n,error:o}=await r.from("receipts").insert([{user_id:e,image_url:t,total_amount:a,receipt_date:s}]).select().single();if(o)throw o;return n},async saveItems(e,t){let a=t.map(t=>({receipt_id:e,item_name:t.name,price:t.price,quantity:t.quantity||1,category:t.category||"อื่นๆ"})),{data:s,error:n}=await r.from("items").insert(a).select();if(n)throw n;return s},async getDailySummary(e,t){let{data:a,error:s}=await r.from("receipts").select(`
        *,
        items (*)
      `).eq("user_id",e).gte("created_at",`${t}T00:00:00`).lt("created_at",`${t}T23:59:59`);if(s)throw s;return a},async getMonthlySummary(e,t,a){let s=`${t}-${a.toString().padStart(2,"0")}-01`,n=new Date(t,a,0).toISOString().split("T")[0],{data:o,error:i}=await r.from("receipts").select(`
        *,
        items (*)
      `).eq("user_id",e).gte("receipt_date",s).lte("receipt_date",n);if(i)throw i;return o},async uploadImage(e,t){let{data:a,error:s}=await r.storage.from("receipt-images").upload(t,e);if(s)throw s;let{data:{publicUrl:n}}=r.storage.from("receipt-images").getPublicUrl(t);return n}}},9753:(e,t,a)=>{a.a(e,async(e,r)=>{try{a.r(t),a.d(t,{default:()=>u});var s=a(7553),n=a(6884),o=a(395),i=a(4770),l=a.n(i),c=e([s,n]);async function u(e,t){if("POST"!==e.method)return t.status(405).json({message:"Method not allowed"});let a=e.headers["x-line-signature"],r=JSON.stringify(e.body),s=l().createHmac("sha256",process.env.LINE_CHANNEL_SECRET).update(r).digest("base64");if(a!==s)return t.status(401).json({message:"Invalid signature"});try{for(let t of e.body.events)await p(t);t.status(200).json({message:"OK"})}catch(e){console.error("Webhook error:",e),t.status(500).json({error:e.message})}}async function p(e){let{type:t,replyToken:a,source:r,message:n}=e,o=r.userId;try{"message"===t&&("image"===n.type?await m(a,o,n.id):"text"===n.type&&await g(a,o,n.text))}catch(e){console.error("Event handling error:",e),await s.f.replyMessage(a,"เกิดข้อผิดพลาด กรุณาลองใหม่อีกครั้ง")}}async function m(e,t,a){try{let r;await s.f.replyMessage(e,"กำลังวิเคราะห์ใบเสร็จ กรุณารอสักครู่...");let i=await s.f.downloadImage(a),l=i.toString("base64"),c=`${t}_${Date.now()}.jpg`,u=await o.T.uploadImage(i,c),p=await n.c.analyzeReceipt(l),m=await o.T.saveReceipt(t,u,p.total_amount,p.date||new Date().toISOString().split("T")[0]);p.items&&p.items.length>0&&await o.T.saveItems(m.id,p.items);let g=(r=`✅ วิเคราะห์ใบเสร็จเสร็จแล้ว!

`,p.store_name&&(r+=`🏪 ร้าน: ${p.store_name}
`),p.date&&(r+=`📅 วันที่: ${p.date}
`),r+=`💰 ยอดรวม: ${p.total_amount?.toLocaleString()||"ไม่ระบุ"} บาท

`,p.items&&p.items.length>0&&(r+=`📝 รายการสินค้า:
`,p.items.forEach(e=>{r+=`• ${e.name} - ${e.price?.toLocaleString()} บาท
`})),r+=`
💡 ข้อมูลถูกบันทึกแล้ว พิมพ์ "สรุป" เพื่อดูสรุปวันนี้`);await s.f.pushMessage(t,g)}catch(e){console.error("Image processing error:",e),await s.f.pushMessage(t,"ไม่สามารถวิเคราะห์ใบเสร็จได้ กรุณาถ่ายรูปใหม่ให้ชัดขึ้น")}}async function g(e,t,a){let r=a.toLowerCase().trim();if(r.includes("สรุป")||r.includes("summary")){let a=new Date().toISOString().split("T")[0],r=await o.T.getDailySummary(t,a);if(0===r.length){await s.f.replyMessage(e,"วันนี้ยังไม่มีการบันทึกใบเสร็จ");return}let n=function(e){let t=e.reduce((e,t)=>e+parseFloat(t.total_amount||0),0);return{date:new Date().toLocaleDateString("th-TH"),receiptCount:e.length,totalAmount:t}}(r),i=s.f.createSummaryMessage(n);await s.f.replyMessage(e,i)}else if(r.includes("เดือน")||r.includes("month")){let a=new Date,r=await o.T.getMonthlySummary(t,a.getFullYear(),a.getMonth()+1);if(0===r.length){await s.f.replyMessage(e,"เดือนนี้ยังไม่มีการบันทึกใบเสร็จ");return}let n=function(e){let t=e.reduce((e,t)=>e+parseFloat(t.total_amount||0),0),a=e.reduce((e,t)=>e+(t.items?.length||0),0);return`📊 สรุปเดือนนี้

💰 ยอดรวม: ${t.toLocaleString()} บาท
📋 จำนวนใบเสร็จ: ${e.length} ใบ
🛍️ จำนวนรายการ: ${a} รายการ`}(r);await s.f.replyMessage(e,n)}else await s.f.replyMessage(e,'สวัสดีครับ! \uD83D\uDCF1\n\nส่งรูปใบเสร็จมาให้ผมวิเคราะห์ได้เลย\n\nหรือพิมพ์:\n• "สรุป" - ดูสรุปวันนี้\n• "เดือน" - ดูสรุปเดือนนี้')}[s,n]=c.then?(await c)():c,r()}catch(e){r(e)}})},7153:(e,t)=>{var a;Object.defineProperty(t,"x",{enumerable:!0,get:function(){return a}}),function(e){e.PAGES="PAGES",e.PAGES_API="PAGES_API",e.APP_PAGE="APP_PAGE",e.APP_ROUTE="APP_ROUTE"}(a||(a={}))},1802:(e,t,a)=>{e.exports=a(145)}};var t=require("../../webpack-api-runtime.js");t.C(e);var a=t(t.s=525);module.exports=a})();