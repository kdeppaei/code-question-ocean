# CodeDive 程式題海

以 LeetCode 式解題工作台為核心，結合繁體中文短篇教學的程式語言練習網站。

## 線上版本

[開啟 CodeDive 程式題海](https://codedive-practice-lab.kdeppaei2.chatgpt.site)

## 目前內容

- C、C++、Python、SQL、GDB 五個專項
- 250 題經重複稽核的原創練習，五個專項各 50 題，含難度、主題、範例、限制、提示與參考解答
- 每一題都有可隨時切換的「顯示解答／隱藏解答」功能
- 40 組 C／C++ 同題對照，可在解答區比較兩種語法與記憶體管理方式
- C、C++、Python、SQL 自由程式實驗室，整合 20 個可執行用例、常用語法與資料結構速查、stdin、編譯錯誤與執行輸出
- 實驗室支援用例一鍵載入、片段點選插入、分語言草稿自動儲存、原始碼複製與下載
- 題目搜尋、語言／難度篩選與每頁 25 題分頁
- 10 條演算法與實戰學習路線
- 左側題目、右側程式碼編輯器的解題工作台
- 全部 200 題 C、C++、Python、SQL 練習使用 Judge0 CE 安全沙箱實際編譯或執行
- 50 題 GDB 練習使用引導式結構判題，並保留範例測試與提交紀錄
- CodeMirror 智慧編輯器，提供五種專項語法高亮與前綴自動完成，例如 C 輸入 `pr` 展開 `printf`、輸入 `m` 展開 `main`
- 多檔分頁草稿、自訂檔名、左右排序與自訂 stdin 測試
- C、C++、Python、SQL 多檔專案使用 Judge0 Multi-file program 執行；C／C++ 原始檔會分開編譯與連結
- `Ctrl+Enter` 執行、`Ctrl+Shift+Enter` 提交、`Ctrl+S` 儲存草稿等快捷鍵
- 15 篇繁體中文短篇教學，並連結相關練習
- D1 帳號進度同步；離線或無法同步時自動保留在本機
- 自願加入的公開排行榜（只公開顯示名稱與學習統計）
- 管理員 JSON 批次匯入／更新／停用題目後台，支援不送往前端的隱藏測試
- 智慧助教提供錯誤解析、核心觀念與個人化下一步；未設定 OpenAI 金鑰時自動使用本機隱私分析
- 判題服務健康狀態與主要／備援端點監控
- 公開判題要求 ChatGPT 登入，並限制每帳號每分鐘 20 次
- 響應式版面與深色模式

> Judge0 CE 端點可透過 `JUDGE0_API_URL` 環境變數替換成自架服務。`infra/judge0` 內含 Ubuntu 22.04 安裝與安全設定。所有不受信任程式碼都送往獨立沙箱，不會在網站伺服器內直接執行。

## 平台環境變數

- `ADMIN_EMAIL`：可進入題庫管理後台的 Email，多人以逗號分隔
- `JUDGE0_API_URL`：主要 Judge0 HTTPS 端點
- `JUDGE0_AUTH_HEADER`、`JUDGE0_AUTH_TOKEN`：自架 Judge0 驗證標頭與密鑰
- `JUDGE0_FALLBACK_API_URL`：主要端點故障時的備援端點（選用）
- `OPENAI_API_KEY`：啟用 OpenAI Responses API 智慧助教（選用且必須設為 secret）
- `OPENAI_MODEL`：智慧助教模型，預設 `gpt-5.4-mini`

## 本機開發

需要 Node.js 22.13 以上與 pnpm。

```bash
pnpm install
pnpm dev
```

正式建置：

```bash
pnpm build
```

驗證題庫與判題覆蓋：

```bash
pnpm verify:coverage
pnpm audit:questions
pnpm verify:references
pnpm verify:editor
pnpm verify:playground
```
