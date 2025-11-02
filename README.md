# Full Platform Export

Полный экспорт всех основных разделов: Trading Terminal, AI Assistant, Discord

## 📦 Содержимое

### 1. 💹 Trading Terminal
**Файлы:**
- `client/pages/Terminal.tsx` (57 KB)
- 12 компонентов Terminal

**Компоненты:**
- AggregatedOrderBook - Агрегированный ордер-бук
- DepthChart - График глубины рынка
- LiquidationsPanel - Панель ликвидаций
- MarketOverview - Обзор рынка
- OrderBook - Книга ордеров
- PortfolioTracker - Трекер портфеля
- PriceAlerts - Ценовые алерты
- PriceHeatmap - Тепловая карта
- SRStatsDashboard - Support/Resistance статистика
- SupportResistanceOverlay - Уровни поддержки/сопротивления
- TradingViewChartSimple - TradingView графики
- Watchlist - Список наблюдения

### 2. 🤖 AI Assistant
**Файлы:**
- `client/pages/AIAssistant.tsx` (23 KB)
- `client/components/RiskCalculator.tsx` (149 KB)
- Chat компоненты с Markdown

**Компоненты:**
- ChatMessages.tsx - Сообщения с форматированием
- HistoryModal.tsx - История чатов
- LazyFinanceDashboard.tsx - Lazy-loaded дашборд

**Backend:**
- `server/routes/ai-assistant.ts` - API endpoints
- `server/services/perplexity-ai-service.ts` - Perplexity AI
- `server/services/groq-ai-service.ts` - Groq AI
- `server/services/mock-ai-service.ts` - Mock AI

### 3. 💬 Discord
**Файлы:**
- `client/pages/Discord.tsx`
- 21 Discord компонент

**Компоненты:**
- Чаты и каналы
- Модальные окна
- Настройки сервера
- Community функции

---

## 🚀 Быстрый старт

### 1. Распаковка
```bash
tar -xzf full-platform-export.tar.gz
cd full-export
```

### 2. Структура проекта
```
full-export/
├── client/
│   ├── pages/
│   │   ├── Terminal.tsx          # Trading Terminal
│   │   ├── AIAssistant.tsx       # AI Assistant
│   │   ├── Discord.tsx           # Discord
│   │   └── components/           # Общие компоненты страниц
│   └── components/
│       ├── discord/              # 21 Discord компонент
│       ├── AggregatedOrderBook.tsx
│       ├── DepthChart.tsx
│       ├── LiquidationsPanel.tsx
│       ├── MarketOverview.tsx
│       ├── OrderBook.tsx
│       ├── PortfolioTracker.tsx
│       ├── PriceAlerts.tsx
│       ├── PriceHeatmap.tsx
│       ├── RiskCalculator.tsx    # 149 KB
│       ├── SRStatsDashboard.tsx
│       ├── SupportResistanceOverlay.tsx
│       ├── TradingViewChartSimple.tsx
│       └── Watchlist.tsx
├── server/
│   ├── routes/
│   │   └── ai-assistant.ts
│   └── services/
│       ├── perplexity-ai-service.ts
│       ├── groq-ai-service.ts
│       └── mock-ai-service.ts
└── README.md
```

---

## 🔧 Интеграция

### Trading Terminal

#### 1. Добавьте маршрут
```tsx
<Route path="/terminal" element={<Terminal />} />
```

#### 2. Скопируйте компоненты
```bash
cp client/components/{AggregatedOrderBook,DepthChart,LiquidationsPanel,MarketOverview,OrderBook,PortfolioTracker,PriceAlerts,PriceHeatmap,SRStatsDashboard,SupportResistanceOverlay,TradingViewChartSimple,Watchlist}.tsx YOUR_PROJECT/client/components/
```

### AI Assistant

#### 1. Добавьте маршрут
```tsx
<Route path="/ai-assistant" element={<AIAssistant />} />
```

#### 2. Подключите API
```typescript
app.post("/api/ai/chat", handleChat);
app.post("/api/ai/new-chat", handleNewChat);
app.get("/api/ai/history/:chatId", handleGetHistory);
app.get("/api/ai/chats", handleGetAllChats);
app.delete("/api/ai/chat/:chatId", handleDeleteChat);
```

#### 3. Настройте .env
```env
PERPLEXITY_API_KEY=your-api-key
```

### Discord

#### 1. Добавьте маршрут
```tsx
<Route path="/social/discord" element={<Discord />} />
```

#### 2. Скопируйте Discord компоненты
```bash
cp -r client/components/discord YOUR_PROJECT/client/components/
```

---

## 📊 Статистика

### Trading Terminal
- **Файлов:** 13
- **Размер:** ~350 KB
- **Функций:** Ордер-бук, графики, алерты, трекинг

### AI Assistant  
- **Файлов:** 8 (frontend + backend)
- **Размер:** ~200 KB
- **Функций:** AI чат, Risk Calculator, аналитика

### Discord
- **Файлов:** 22
- **Размер:** ~150 KB  
- **Функций:** Чаты, каналы, настройки сервера

**Всего:** 43 файла, ~700 KB кода

---

## 💡 Зависимости

### Общие
- React 18+
- TypeScript
- Tailwind CSS
- React Router

### Trading Terminal
- TradingView Lightweight Charts
- Recharts
- WebSocket (для live данных)

### AI Assistant
- Axios (для API запросов)
- React Query
- Markdown парсер (встроен)

### Discord
- React DnD (drag & drop)
- Emoji picker
- File upload компоненты

---

## 🎨 Дизайн системы

### Цветовая палитра
```css
--primary: #A06AFF      /* Фиолетовый */
--accent: #7B4FC8       /* Темно-фиолетовый */
--text: #E8E8E8         /* Светло-серый */
--background: #0C1014   /* Темный */
```

### Компоненты
- Gradient backgrounds
- Backdrop blur
- Smooth animations
- Responsive design

---

## 🔐 Безопасность

### API ключи
- Храните в `.env`
- Не коммитьте в Git
- Используйте только на сервере

### WebSocket
- Secure connections (WSS)
- Token authentication
- Rate limiting

---

## 📞 Поддержка

### Общие проблемы

**Стили не применяются:**
- Проверьте Tailwind конфиг
- Убедитесь в наличии всех CSS классов

**API не работает:**
- Проверьте .env файл
- Убедитесь в правильности endpoints
- Проверьте CORS настройки

**WebSocket ошибки:**
- Проверьте URL подключения
- Убедитесь в поддержке WSS
- Проверьте firewall настройки

---

## 🎯 Версия

- Дата экспорта: 02.11.2025
- Файлов: 43
- Размер: ~700 KB
- Категории: 3 (Terminal, AI, Discord)

---

## 📝 Лицензия

Все файлы готовы к использованию в вашем проекте.

**Готово к интеграции!** 🚀
