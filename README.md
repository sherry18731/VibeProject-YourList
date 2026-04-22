# VibeProject YourList

## 簡介

VibeProject **YourList** 是一個以「生活清單」為核心概念的 Web 應用程式，結合了精緻的 UI 設計、動畫效果與互動式的任務管理功能。使用者可以輕鬆新增、編輯、排序與完成待辦事項，同時享受動畫化的視覺回饋。

## 主要功能

- **任務清單管理**：新增、編輯、刪除與標記完成的任務。
- **拖曳排序**：支援拖曳改變任務順序，並以水平指示線即時顯示位置。
- **動畫效果**：任務卡片與完成按鈕皆搭配微交互動畫，提升使用者體驗。
- **會員系統（未完成）**：預計提供登入、註冊以及個人資訊頁面，顯示完成任務統計與「踩雷」次數。
- **主題切換**：內建明亮與暗色主題，使用者可即時切換。


## 專案結構

```
YourList/
├─ css/          # 所有 CSS 檔案 (style.css, animations.css 等)
├─ html/         # HTML 模板檔案 (index.html, login.html, member.html)
├─ js/           # 前端 JavaScript 檔案
├─ .vscode/      # VSCode 設定
├─ README.md     # 本說明文件
└─ ...
```

## 起步指南

您可以直接在本機開啟 `html/index.html`，或使用 `live-server` 於瀏覽器中即時體驗此功能。

1. **安裝相依套件**（若有使用 npm）
   ```bash
   npm install
   ```

2. **執行本機開發伺服器**（以 `live-server` 為例）
   ```bash
   npx live-server ./html
   ```
   伺服器預設會在 `http://127.0.0.1:5501` 提供預覽。

3. 打開瀏覽器前往上述網址，即可看到您的待辦清單介面。

## 部署說明

- 可將 `html/`、`css/`、`js/` 目錄上傳至任意靜態網站服務（如 GitHub Pages、Netlify、Vercel 等）。
- 若需要後端支援（例如使用者資料庫），請自行整合 API，並在前端的 `js/` 中呼叫相應端點。

## 貢獻指南

1. Fork 本倉庫。
2. 建立新分支：`git checkout -b feature/your-feature`
3. 提交變更並 push：`git push origin feature/your-feature`
4. 發起 Pull Request，說明您的更動內容。

## 授權條款

本專案採用 **MIT License**，詳見 `LICENSE` 檔案。

---

此份文件由AI撰寫，可能會有錯誤。
