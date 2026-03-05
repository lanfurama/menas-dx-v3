MENAS DX v3
Customer 360° Intelligence Platform
Loyalty · AI · Zalo ZNS
 
 
TÀI LIỆU KỸ THUẬT
Mô tả tính năng & thuật toán
Tab: Chân dung KH (Customer Persona)
 
 
Document Version: 1.0 — June 2025
Confidential — MENAS Group Internal

 
1. Tổng quan màn hình
Tab "Chân dung KH" là tab thứ 2 trong panel chi tiết KH 360°, hiển thị khi người dùng click vào 1 khách hàng trong danh sách. Màn hình gồm 4 khu vực chính:
1.     RFM Analysis — Chấm điểm Recency, Frequency, Monetary (3 thanh progress bar + badge segment)
2.     Phân loại giá trị — Value Segment + Lifecycle + AOV Level + Frequency Level (4 cards)
3.     Customer Persona — 6 chiều hành vi (Product, Payment, Price Sensitivity, Shopping Mission, Channel, Store)
4.     Ghi chú — Note tự do về khách hàng

 
2. Data Model (Cấu trúc dữ liệu)
2.1 Customer Record — Trường dữ liệu cơ bản
Mỗi khách hàng có các trường sau (được dùng để tính RFM và hiển thị header):
Trường
Kiểu
Ví dụ (KH002)
Mô tả
name
string
Trần Thị Bình
Họ tên KH
MaTheKHTT
string
KH002
Mã thẻ KH thành viên
phone
string
0983777213
Số điện thoại
loyalty_tier
string
Gold
Hạng loyalty: Platinum / Gold / Silver
loyalty_points
number
22300
Điểm tích lũy hiện tại
total_spent
number
28000000
Tổng chi tiêu (VND)
total_orders
number
89
Tổng số đơn hàng
last_purchase
date string
2025-05-27
Ngày mua cuối cùng (YYYY-MM-DD)
frequency_month
number
2.5
Tần suất mua trung bình / tháng
avg_basket
number
315000
Giá trị đơn trung bình (VND)
store_primary
string
CH Lê Lợi
Cửa hàng chính thường mua

 
2.2 Persona Object — 10 chiều chân dung
Mỗi customer có 1 object "persona" với 10 trường:
Trường
Kiểu
Ví dụ (KH002)
Giá trị có thể
value_seg
string
VIP
Super VIP / VIP / Regular / Low
lifecycle
string
Active
Loyal / Active / Growing / Declining / Churning
aov_level
string
Medium
High / Medium-High / Medium / Low-Medium / Low
freq_level
string
High
Very High / High / Medium / Low / Very Low
product_persona
string[]
["Office Snacker", "Quick Meal Buyer"]
Mảng các tag hành vi mua hàng
payment_persona
string
E-wallet User
E-wallet / Cash Only / Credit Card / Bank Transfer / Mixed
price_sens
string
Balanced Shopper
Quality First / Balanced / Deal Hunter / Price Sensitive / Value Seeker
shop_mission
string
Quick Refill
Weekly Stock-up / Quick Refill / Impulse Buy / Meal Prep / Need-based / Full Basket
channel
string
Zalo Follower
Omni-channel / Zalo + In-store / Zalo Follower / In-store Only / Passive
note
string
KH yêu thích khuyến mãi cuối tuần...
Ghi chú tự do về KH


 
3. Thuật toán RFM Scoring
3.1 Khái niệm
RFM (Recency – Frequency – Monetary) là mô hình phân khúc khách hàng dựa trên 3 chỉ số hành vi mua sắm. Mỗi chỉ số được chấm từ 1 đến 5, tổng điểm từ 3 đến 15.
3.2 Công thức tính
3.2.1 R – Recency Score (Số ngày kể từ lần mua cuối)
Bước 1: Tính số ngày kể từ lần mua cuối
daysSince = floor((referenceDate - last_purchase) / 86400000)
Trong đó referenceDate = ngày hiện tại (hoặc ngày tham chiếu cố định, ví dụ: 2025-06-01). 86400000 = số milliseconds trong 1 ngày.
Bước 2: Quy đổi điểm
Điều kiện
Score
Ý nghĩa
daysSince ≤ 7
5
Mua trong 7 ngày gần đây — rất active
daysSince ≤ 30
4
Mua trong 30 ngày — active
daysSince ≤ 60
3
Mua trong 60 ngày — bình thường
daysSince ≤ 120
2
Mua trong 120 ngày — có nguy cơ rời
daysSince > 120
1
Quá 120 ngày — đã ngừng mua

 
3.2.2 F – Frequency Score (Tần suất mua/tháng)
fScore = frequency_month >= 4 ? 5 : frequency_month >= 2.5 ? 4 : frequency_month >= 1.5 ? 3 : frequency_month >= 0.8 ? 2 : 1
Điều kiện
Score
Ý nghĩa
frequency_month ≥ 4
5
Mua ≥4 lần/tháng — rất thường xuyên
frequency_month ≥ 2.5
4
Mua 2.5-4 lần/tháng — thường xuyên
frequency_month ≥ 1.5
3
Mua 1.5-2.5 lần/tháng — trung bình
frequency_month ≥ 0.8
2
Ít hơn 1 lần/tháng
frequency_month < 0.8
1
Rất hiếm khi mua

 
3.2.3 M – Monetary Score (Tổng chi tiêu)
mScore = total_spent >= 50M ? 5 : total_spent >= 20M ? 4 : total_spent >= 10M ? 3 : total_spent >= 5M ? 2 : 1
Điều kiện
Score
Ý nghĩa
total_spent ≥ 50,000,000
5
Chi tiêu rất cao (>50M VND)
total_spent ≥ 20,000,000
4
Chi tiêu cao (20-50M)
total_spent ≥ 10,000,000
3
Chi tiêu trung bình (10-20M)
total_spent ≥ 5,000,000
2
Chi tiêu thấp (5-10M)
total_spent < 5,000,000
1
Chi tiêu rất thấp (<5M)

 
3.3 Segment Mapping (Tổng điểm → Nhóm KH)
total = rScore + fScore + mScore   // Range: 3 to 15
 
Tổng điểm
Segment
Màu sắc
Ý nghĩa
Hành động đề xuất
≥ 13
Champions
#3ecf8e (green)
KH xuất sắc nhất, mua gần đây + thường xuyên + chi nhiều
Chăm sóc VIP, reward, ambassador
≥ 10
Loyal
#5bb8f5 (blue)
KH trung thành, ổn định
Upsell, cross-sell, giữ chân
≥ 7
Potential
#f0c040 (yellow)
KH tiềm năng, đang phát triển
Nurture, tăng tần suất
≥ 5
At Risk
#ef5350 (red)
KH có nguy cơ rời bỏ
Win-back campaign, offer đặc biệt
< 5
Hibernating
#50506a (grey)
KH đã ngừng mua lâu
Re-engage hoặc chấp nhận churn

 
3.4 Ví dụ tính: KH002 — Trần Thị Bình
Chỉ số
Dữ liệu gốc
Tính toán
Score
R – Recency
last_purchase = 2025-05-27
daysSince = (2025-06-01) - (2025-05-27) = 5 ngày. 5 ≤ 7 → Score = 5
5/5
F – Frequency
frequency_month = 2.5
2.5 ≥ 2.5 → Score = 4
4/5
M – Monetary
total_spent = 28,000,000
28M ≥ 20M → Score = 4
4/5
Tổng
—
5 + 4 + 4 = 13
13/15
Segment
—
13 ≥ 13 → Champions
Champions


 
4. UI Components (Các thành phần giao diện)
4.1 Header KH (Phần trên cùng)
Hiển thị thông tin cơ bản của KH được chọn:
Thành phần
Dữ liệu
Format hiển thị
Màu sắc
Avatar
name[0]
Chữ cái đầu, nền accent circle
#c8965a circle
Tên
name
Font Libre Baskerville, 20px, bold
white
Mã KH
MaTheKHTT
Font 12px, color accent
#c8965a
Phone
phone
12px, text secondary
#8888a0
Cửa hàng
store_primary
12px, text secondary
#8888a0
Loyalty badge
loyalty_tier
Badge với icon star
color theo tier

 
4.2 Metric Cards (6 thẻ chỉ số)
Dãy 6 cards ngang bên dưới header:
Card
Trường dữ liệu
Format
Icon / Màu
Tổng chi
total_spent
fv() → 28.0M (chia 1M, 1 decimal)
$ / accent
Đơn hàng
total_orders
Số nguyên: 89
cart / info
Mua cuối
last_purchase
YYYY-MM-DD: 2025-05-27
clock / success
Tần suất/T
frequency_month
Số thập phân: 2.5
repeat / warning
AOV
avg_basket
fv() → 315K (chia 1000)
trend / purple
Points
loyalty_points
fn() → 22.300 (locale vi-VN)
star / danger

 
Hàm format giá trị:
fv(n): n >= 1e9 → (n/1e9).toFixed(1) + 'B'
   	n >= 1e6 → (n/1e6).toFixed(1) + 'M'
   	n >= 1e3 → (n/1e3).toFixed(0) + 'K'
   	else → n.toLocaleString('vi-VN')
fn(n): Number(n).toLocaleString('vi-VN')
 
4.3 RFM Analysis (Cột trái)
4.3.1 Progress Bars
3 thanh progress bar cho R, F, M:
Thanh
Label
Sub-label
Score
Bar width
Màu
R - Recency
R - Recency
daysSince + ' ngày trước'
rScore/5
(rScore/5)*100 + '%'
#3ecf8e (success)
F - Frequency
F - Frequency
frequency_month + '/tháng'
fScore/5
(fScore/5)*100 + '%'
#5bb8f5 (info)
M - Monetary
M - Monetary
fv(total_spent)
mScore/5
(mScore/5)*100 + '%'
#c8965a (accent)

 
4.3.2 RFM Summary Card
Bên dưới 3 progress bars:
•       RFM Score: hiển thị total/15 (ví dụ: 13/15), font size 22px, bold, màu = segment color
•       Segment badge: hiển thị label (Champions/Loyal/...), background = color+20%, text = color
•       Card background: segment color + 10% opacity, border: segment color + 30% opacity
4.4 Phân loại giá trị (Cột phải)
4.4.1 Value Segment Card
Hiển thị persona.value_seg với màu sắc:
Giá trị
Màu
Hex
Super VIP
Accent (vàng)
#c8965a
VIP
Success (xanh lá)
#3ecf8e
Regular
Info (xanh dương)
#5bb8f5
Low
Muted (xám)
#50506a

 
4.4.2 Lifecycle Card
Hiển thị persona.lifecycle:
Giá trị
Màu
Hex
Loyal
Success
#3ecf8e
Active
Info
#5bb8f5
Growing
Warning
#f0c040
Declining
Danger
#ef5350
Churning
Muted
#50506a

 
4.4.3 AOV Level + Frequency Level
2 cards nhỏ, nền xám (surfaceAlt), hiển thị giá trị text đơn giản từ persona.aov_level và persona.freq_level.

 
4.5 Customer Persona (Lưới 3 cột × 2 hàng)
6 cards hiển thị các chiều hành vi:
Card
Trường dữ liệu
Icon
Màu label
Product Persona
persona.product_persona.join(', ')
package (hộp)
#c8965a (accent)
Payment Persona
persona.payment_persona
dollar ($)
#5bb8f5 (info)
Price Sensitivity
persona.price_sens
star (☆)
#f0c040 (warning)
Shopping Mission
persona.shop_mission
cart (đơn hàng)
#3ecf8e (success)
Channel
persona.channel
msg (tin nhắn)
#a78bfa (purple)
Store
store_primary
map (bản đồ)
#2dd4bf (teal)

 
4.6 Ghi chú (Notes Section)
Card với gradient background (purple), hiển thị persona.note nếu tồn tại. Icon edit bên trái. Font 12px, màu text secondary.

 
5. Design System (Hệ thống thiết kế)
5.1 Color Palette
Tên
Hex
Sử dụng
bg
#08080d
Nền chính
surface
#101018
Nền components
card
#13131c
Nền cards
cardBorder
#23233a
Viền cards
accent
#c8965a
Màu chủ đạo (vàng đồng)
success
#3ecf8e
Thành công, Recency
info
#5bb8f5
Thông tin, Frequency
warning
#f0c040
Cảnh báo
danger
#ef5350
Nguy hiểm, At Risk
purple
#a78bfa
AI, Channel
text
#eaeaf2
Text chính
textSec
#8888a0
Text phụ
textMuted
#50506a
Text mờ, Hibernating

 
5.2 Typography
•       Font chính: Outfit (Google Fonts) — tất cả UI text
•       Font tiêu đề: Libre Baskerville (Google Fonts) — tên KH, tiêu đề module
•       Counter class: font-weight 800, letter-spacing -0.02em — số liệu lớn (28.0M, 89, 13/15...)
•       Label: font-size 9px, uppercase, letter-spacing 0.06em, font-weight 700
5.3 Card Styling
•       Background: #13131c (card)
•       Border: 1px solid #23233a (cardBorder)
•       Border-radius: 14px
•       Padding: 18px
•       Badge: padding 3px 10px, border-radius 20px, background color+18% opacity

 
6. Pseudocode tổng hợp
Toàn bộ logic tính toán và render có thể tóm gọn như sau:
 
// Input: customer object (c) + persona object (c.persona)
 
// Step 1: Tính RFM
daysSince = floor((NOW - c.last_purchase) / 1_day)
rScore = daysSince<=7?5 : daysSince<=30?4 : daysSince<=60?3 : daysSince<=120?2 : 1
fScore = c.freq>=4?5 : c.freq>=2.5?4 : c.freq>=1.5?3 : c.freq>=0.8?2 : 1
mScore = c.spent>=50M?5 : c.spent>=20M?4 : c.spent>=10M?3 : c.spent>=5M?2 : 1
total  = rScore + fScore + mScore
label  = total>=13?'Champions' : total>=10?'Loyal' : total>=7?'Potential' : total>=5?'At Risk' : 'Hibernating'
 
// Step 2: Render Header
show avatar(c.name[0]), name, MaTheKHTT, phone, store, loyalty_tier badge
show 6 metric cards: total_spent, total_orders, last_purchase, freq, avg_basket, points
 
// Step 3: Render RFM Section
for each {R,F,M}: render progress bar (width = score/5 * 100%, label, sub-label, score/5)
render summary card: total/15 + segment badge (label, color)
 
// Step 4: Render Classification
show Value Segment card (persona.value_seg, color by value)
show Lifecycle card (persona.lifecycle, color by value)
show AOV Level + Frequency Level (simple text cards)
 
// Step 5: Render Persona Grid (3x2)
for each dimension: show card {icon, label (uppercase, colored), value (text)}
dimensions = [product_persona, payment_persona, price_sens, shop_mission, channel, store]
 
// Step 6: Render Notes
if persona.note exists: show gradient card with edit icon + note text
