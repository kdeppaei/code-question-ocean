# CodeDive 程式題海

以 LeetCode 式解題工作台為核心，結合繁體中文短篇教學的程式語言練習網站。

## 線上版本

[開啟 CodeDive 程式題海](https://codedive-practice-lab.kdeppaei2.chatgpt.site)

## 目前內容

- C、C++、Python、SQL、GDB 五個專項
- 200 題原創練習，含難度、主題、範例、限制、提示與參考解答
- 每一題都有可隨時切換的「顯示解答／隱藏解答」功能
- 題目搜尋、語言／難度篩選與每頁 25 題分頁
- 10 條演算法與實戰學習路線
- 左側題目、右側程式碼編輯器的解題工作台
- 全部 160 題 C、C++、Python、SQL 練習使用 Judge0 CE 安全沙箱實際編譯或執行
- 40 題 GDB 練習使用引導式結構判題，並保留範例測試與提交紀錄
- CodeMirror 智慧編輯器，提供五種專項語法高亮與自動完成
- `Ctrl+Enter` 執行、`Ctrl+Shift+Enter` 提交、`Ctrl+S` 儲存草稿等快捷鍵
- 15 篇繁體中文短篇教學，並連結相關練習
- D1 帳號進度同步；離線或無法同步時自動保留在本機
- 響應式版面與深色模式

> Judge0 CE 端點可透過 `JUDGE0_API_URL` 環境變數替換成自架服務。所有不受信任程式碼都送往獨立沙箱，不會在網站伺服器內直接執行。

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
```
