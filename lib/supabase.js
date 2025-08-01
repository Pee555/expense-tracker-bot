import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

// Helper functions สำหรับ database operations
export const dbHelpers = {
  // บันทึกใบเสร็จ
  async saveReceipt(userId, imageUrl, totalAmount, receiptDate) {
    const { data, error } = await supabase
      .from('receipts')
      .insert([{
        user_id: userId,
        image_url: imageUrl,
        total_amount: totalAmount,
        receipt_date: receiptDate
      }])
      .select()
      .single()
    
    if (error) throw error
    return data
  },

  // บันทึกรายการสินค้า
  async saveItems(receiptId, items) {
    const itemsData = items.map(item => ({
      receipt_id: receiptId,
      item_name: item.name,
      price: item.price,
      quantity: item.quantity || 1,
      category: item.category || 'อื่นๆ'
    }))

    const { data, error } = await supabase
      .from('items')
      .insert(itemsData)
      .select()
    
    if (error) throw error
    return data
  },

  // ดึงสรุปรายวัน
  async getDailySummary(userId, date) {
    const { data, error } = await supabase
      .from('receipts')
      .select(`
        *,
        items (*)
      `)
      .eq('user_id', userId)
      .gte('created_at', `${date}T00:00:00`)
      .lt('created_at', `${date}T23:59:59`)
    
    if (error) throw error
    return data
  },

  // ดึงสรุปรายเดือน
  async getMonthlySummary(userId, year, month) {
    const startDate = `${year}-${month.toString().padStart(2, '0')}-01`
    const endDate = new Date(year, month, 0).toISOString().split('T')[0]
    
    const { data, error } = await supabase
      .from('receipts')
      .select(`
        *,
        items (*)
      `)
      .eq('user_id', userId)
      .gte('receipt_date', startDate)
      .lte('receipt_date', endDate)
    
    if (error) throw error
    return data
  },

  // อัปโหลดรูปภาพ
  async uploadImage(file, fileName) {
    const { data, error } = await supabase.storage
      .from('receipt-images')
      .upload(fileName, file)
    
    if (error) throw error
    
    const { data: { publicUrl } } = supabase.storage
      .from('receipt-images')
      .getPublicUrl(fileName)
    
    return publicUrl
  }
}