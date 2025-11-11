// Script để kiểm tra cấu hình Supabase
// Chạy: node scripts/check-supabase-config.js

require('dotenv').config({ path: '.env.local' });

console.log('\n=== KIỂM TRA CẤU HÌNH SUPABASE ===\n');

const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

console.log('1. NEXT_PUBLIC_SUPABASE_URL:');
console.log(url ? '   ✅ Có (' + url.substring(0, 30) + '...)' : '   ❌ THIẾU!');

console.log('\n2. NEXT_PUBLIC_SUPABASE_ANON_KEY:');
console.log(anonKey ? '   ✅ Có (' + anonKey.substring(0, 30) + '...)' : '   ❌ THIẾU!');

console.log('\n3. SUPABASE_SERVICE_ROLE_KEY:');
if (!serviceKey) {
  console.log('   ❌ THIẾU! ĐÂY LÀ NGUYÊN NHÂN LỖI!');
  console.log('   👉 Cần thêm vào .env.local');
  console.log('   👉 Lấy từ Supabase Dashboard → Settings → API → service_role key');
} else if (serviceKey === 'your-service-role-key-here') {
  console.log('   ❌ Chưa thay đổi giá trị mặc định!');
  console.log('   👉 Cần thay bằng service_role key thật từ Supabase');
} else if (serviceKey.length < 100) {
  console.log('   ⚠️ Key quá ngắn, có thể sai!');
  console.log('   👉 Service role key thường dài > 200 ký tự');
} else {
  console.log('   ✅ Có (' + serviceKey.substring(0, 30) + '...)');
  console.log('   ✅ Độ dài: ' + serviceKey.length + ' ký tự');
}

console.log('\n4. JWT_SECRET:');
const jwtSecret = process.env.JWT_SECRET;
console.log(jwtSecret ? '   ✅ Có' : '   ⚠️ Thiếu (optional)');

console.log('\n=== KẾT QUẢ ===\n');

if (!url || !anonKey || !serviceKey || serviceKey === 'your-service-role-key-here') {
  console.log('❌ CẤU HÌNH CHƯA ĐẦY ĐỦ!\n');
  console.log('HƯỚNG DẪN:');
  console.log('1. Tạo file .env.local nếu chưa có');
  console.log('2. Vào Supabase Dashboard → Settings → API');
  console.log('3. Copy các keys và thêm vào .env.local:');
  console.log('\nNEXT_PUBLIC_SUPABASE_URL=https://xxx.supabase.co');
  console.log('NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGci...');
  console.log('SUPABASE_SERVICE_ROLE_KEY=eyJhbGci... 👈 KEY QUAN TRỌNG!');
  console.log('JWT_SECRET=your-random-secret\n');
  console.log('4. Restart dev server (npm run dev)\n');
} else {
  console.log('✅ Cấu hình OK!\n');
  console.log('Nếu vẫn lỗi, kiểm tra:');
  console.log('1. Đã restart dev server chưa?');
  console.log('2. Đã chạy storage policies SQL chưa?');
  console.log('3. Bucket "save-files" đã được tạo chưa?\n');
}
