# Быстрый старт: Перенос дизайна из Lovable.dev

## Способ 1: Автоматический импорт (рекомендуется)

1. **Экспортируйте проект из Lovable.dev**
   - Откройте проект в Lovable
   - Нажмите "Export" или "Download" 
   - Сохраните ZIP архив

2. **Распакуйте архив**
   ```bash
   unzip lovable-project.zip -d /tmp/lovable-project
   ```

3. **Запустите скрипт импорта**
   ```bash
   npm run import:lovable /tmp/lovable-project
   ```

4. **Установите недостающие зависимости** (если скрипт их обнаружит)
   ```bash
   npm install <список-зависимостей>
   ```

5. **Проверьте и исправьте код**
   ```bash
   npm run lint:fix
   npm run format
   ```

## Способ 2: Ручной перенос компонентов

Если автоматический импорт не подходит, можно перенести компоненты вручную:

### Шаг 1: Скопируйте компоненты

1. Найдите нужные компоненты в проекте Lovable
2. Скопируйте файлы `.tsx` в соответствующую папку `components/`

### Шаг 2: Адаптируйте импорты

Замените относительные импорты на алиасы `@/`:

```typescript
// Было (Lovable)
import { Button } from "../ui/button";
import { Card } from "./card";

// Стало (start-kit)
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
```

### Шаг 3: Добавьте директиву "use client"

Если компонент использует хуки или события, добавьте в начало файла:

```typescript
"use client";

import { useState } from "react";
// ...
```

### Шаг 4: Адаптируйте data fetching

Замените прямые `fetch()` на TanStack Query:

```typescript
// Было (Lovable)
const [data, setData] = useState(null);
useEffect(() => {
  fetch('/api/data').then(r => r.json()).then(setData);
}, []);

// Стало (start-kit)
import { useQuery } from "@tanstack/react-query";
import { getData } from "@/lib/api/data";

const { data, isLoading, error } = useQuery({
  queryKey: ["data"],
  queryFn: getData,
});
```

### Шаг 5: Переведите тексты на русский

Все тексты в UI должны быть на русском:

```typescript
// Было
<Button>Submit</Button>
<div>Loading...</div>

// Стало
<Button>Отправить</Button>
<div>Загрузка...</div>
```

## Что проверить после переноса

- [ ] Все импорты используют `@/` алиасы
- [ ] Компоненты с хуками имеют `"use client"`
- [ ] Data fetching через TanStack Query
- [ ] Все тексты переведены на русский
- [ ] Код проходит линтинг: `npm run lint`
- [ ] TypeScript компилируется: `npx tsc --noEmit`
- [ ] Стили совместимы с темой проекта

## Полезные команды

```bash
# Проверка линтинга
npm run lint

# Автоисправление
npm run lint:fix

# Форматирование
npm run format

# Проверка типов
npx tsc --noEmit

# Запуск dev сервера
npm run dev
```

## Нужна помощь?

Если возникли проблемы:
1. Проверьте консоль на ошибки
2. Убедитесь, что все зависимости установлены
3. Проверьте совместимость версий React/Next.js
4. Смотрите подробное руководство: `docs/LOVABLE_IMPORT.md`
