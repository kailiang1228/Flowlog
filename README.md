# Flow_Log

## 專案簡介
- Flow_Log 是一個以 React + Vite 建置的小型流程/時間記錄應用，包含計時、時間軸、統計等介面。專案已具備 PWA 所需的 `manifest.json`，可透過註冊 Service Worker 與打包部署成離線可用的 Progressive Web App。
- 「我常常排了一堆計畫、行事曆，卻還是拖延。這個 App 不是要你預先規劃，而是讓你誠實記錄『實際做了什麼』，用最小摩擦還原現實行為。」

## 核心精神：
- 每天早上開始即進入「無限制計時狀態」
- 方便記錄專注工作流程與時間分段
- 不需預設任務，時間自然流動
- 行為切換時才輸入內容（如 09:00 起床、09:40 早餐...）
- 系統自動計算每段區間，形成完整「當日時間軸」
- 沒有空白、沒有假設，真實還原一天
- 支援跨平台（桌面／行動）並且可安裝為 PWA

## 🚩 核心操作流程

1. 進入 App 即開始計時（無需預設任務）
2. 每當行為切換時，輸入當下行為（可用常用標籤快速選）
3. 系統自動記錄區間（如 09:00~09:40 早餐）
4. 當天結束後，完整時間軸一目了然

## ✨ 主要功能

- **計時頁（Today / Logging）**：
  - 顯示目前正在計時的項目與已過時間
  - 一鍵輸入/選擇行為，常用標籤快速點選
  - 設計原則：極簡、低摩擦、不追求描述完美

- **日曆＋當日時間軸頁（Review）**：
  - 日曆切換日期，點選可檢視當天完整行為軸
  - 垂直時間軸顯示每段行為與持續時間

- **統計與視覺化頁（Insights）**：
  - 圓餅圖/折線圖檢視當天、當週、當月時間分布
  - 支援自定義分類（如睡覺、飲食、學習、工作、娛樂、社交、雜事）
  - 標籤僅用於時間軸細節，不進統計圖

- **常用標籤、匯出 CSV、深色模式**

## 🏷️ 分類與標籤設計

- **行為分類（Category）**：睡覺、飲食、讀書/學習、工作、娛樂、社交、雜事/空轉（可自定義）
- **行為標籤（Tag/Note）**：自由輸入或常用選擇（如「讀書→通訊原理」、「娛樂→YouTube」）
- 標籤僅顯示於時間軸，不進圓餅圖

## 🛠️ 技術堆疊

- React 18, TypeScript, Vite, Tailwind CSS
- PWA（manifest.json、service-worker.js）

## 📦 安裝與啟動

```bash
npm install
npm run dev
# build: npm run build
# preview: npm run preview
```

## 🗂️ 專案結構

```
App.tsx           # 主應用入口
index.html        # HTML 模板
index.tsx         # React 入口
manifest.json     # PWA 設定
service-worker.js # 離線快取
components/       # UI 組件
Flowlog/          # 資料/邏輯模組
...
```

## 📱 PWA 支援
- 支援安裝、離線使用，icons 採用 CDN
- `service-worker.js` 採 network-first 策略
- Chrome/Edge/Android/iOS 皆可安裝

## 📄 授權
MIT License