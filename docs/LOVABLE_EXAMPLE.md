# Пример адаптации компонента из Lovable.dev

## Пример 1: Простой компонент

### Код из Lovable.dev

```typescript
// components/UserCard.tsx
import { Card } from "./ui/card";
import { Button } from "./ui/button";

export function UserCard({ user }) {
  return (
    <Card>
      <h3>{user.name}</h3>
      <p>{user.email}</p>
      <Button onClick={() => console.log("Clicked")}>
        View Profile
      </Button>
    </Card>
  );
}
```

### Адаптированный код для start-kit

```typescript
// components/user/user-card.tsx
"use client";

import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

interface UserCardProps {
  user: {
    name: string;
    email: string;
  };
}

export function UserCard({ user }: UserCardProps) {
  return (
    <Card>
      <h3>{user.name}</h3>
      <p>{user.email}</p>
      <Button onClick={() => console.log("Clicked")}>
        Просмотр профиля
      </Button>
    </Card>
  );
}
```

**Изменения:**
- ✅ Добавлена директива `"use client"` (используется onClick)
- ✅ Импорты заменены на `@/` алиасы
- ✅ Добавлены TypeScript типы
- ✅ Текст переведен на русский

---

## Пример 2: Компонент с data fetching

### Код из Lovable.dev

```typescript
// components/UserList.tsx
import { useState, useEffect } from "react";
import { Card } from "./ui/card";

export function UserList() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/users")
      .then((res) => res.json())
      .then((data) => {
        setUsers(data);
        setLoading(false);
      });
  }, []);

  if (loading) return <div>Loading...</div>;

  return (
    <div>
      {users.map((user) => (
        <Card key={user.id}>
          <h3>{user.name}</h3>
        </Card>
      ))}
    </div>
  );
}
```

### Адаптированный код для start-kit

```typescript
// components/user/user-list.tsx
"use client";

import { useQuery } from "@tanstack/react-query";
import { Card } from "@/components/ui/card";
import { getUsers } from "@/lib/api/users";

export function UserList() {
  const { data: users, isLoading, error } = useQuery({
    queryKey: ["users"],
    queryFn: getUsers,
  });

  if (isLoading) return <div>Загрузка...</div>;
  if (error) return <div>Ошибка загрузки пользователей</div>;

  return (
    <div>
      {users?.map((user) => (
        <Card key={user.id}>
          <h3>{user.name}</h3>
        </Card>
      ))}
    </div>
  );
}
```

**Изменения:**
- ✅ Заменен `fetch` на TanStack Query (`useQuery`)
- ✅ Используется API функция из `lib/api/users`
- ✅ Добавлена обработка ошибок
- ✅ Тексты переведены на русский
- ✅ Добавлены TypeScript типы (через API функцию)

---

## Пример 3: Страница (Page)

### Код из Lovable.dev

```typescript
// pages/users.tsx
import { UserList } from "../components/UserList";

export default function UsersPage() {
  return (
    <div>
      <h1>Users</h1>
      <UserList />
    </div>
  );
}
```

### Адаптированный код для start-kit

```typescript
// app/users/page.tsx
import { UserList } from "@/components/user/user-list";

export default function UsersPage() {
  return (
    <div>
      <h1>Пользователи</h1>
      <UserList />
    </div>
  );
}
```

**Изменения:**
- ✅ Файл перемещен в `app/users/page.tsx` (Next.js App Router)
- ✅ Импорт обновлен на `@/` алиас
- ✅ Текст переведен на русский
- ✅ Нет директивы `"use client"` (Server Component)

---

## Пример 4: Компонент с формой

### Код из Lovable.dev

```typescript
// components/UserForm.tsx
import { useState } from "react";
import { Button } from "./ui/button";
import { Input } from "./ui/input";

export function UserForm() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    await fetch("/api/users", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name, email }),
    });
  };

  return (
    <form onSubmit={handleSubmit}>
      <Input
        value={name}
        onChange={(e) => setName(e.target.value)}
        placeholder="Name"
      />
      <Input
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        placeholder="Email"
      />
      <Button type="submit">Submit</Button>
    </form>
  );
}
```

### Адаптированный код для start-kit

```typescript
// components/user/user-form.tsx
"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { createUser } from "@/lib/api/users";
import { userSchema } from "@/lib/validations/user";
import type { z } from "zod";

type UserFormData = z.infer<typeof userSchema>;

export function UserForm() {
  const queryClient = useQueryClient();
  
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<UserFormData>({
    resolver: zodResolver(userSchema),
  });

  const mutation = useMutation({
    mutationFn: createUser,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["users"] });
    },
  });

  return (
    <form onSubmit={handleSubmit((data) => mutation.mutate(data))}>
      <Input
        {...register("name")}
        placeholder="Имя"
        error={errors.name?.message}
      />
      <Input
        {...register("email")}
        type="email"
        placeholder="Email"
        error={errors.email?.message}
      />
      <Button type="submit" disabled={mutation.isPending}>
        {mutation.isPending ? "Отправка..." : "Отправить"}
      </Button>
    </form>
  );
}
```

**Изменения:**
- ✅ Используется `react-hook-form` с валидацией через Zod
- ✅ Заменен `fetch` на `useMutation` из TanStack Query
- ✅ Добавлена инвалидация кеша после успешного создания
- ✅ Добавлена обработка ошибок валидации
- ✅ Тексты переведены на русский
- ✅ Добавлены TypeScript типы

---

## Чеклист адаптации

При переносе компонента из Lovable проверьте:

- [ ] Импорты используют `@/` алиасы
- [ ] Добавлена директива `"use client"` если нужна
- [ ] Data fetching через TanStack Query
- [ ] API вызовы через функции из `lib/api/`
- [ ] Добавлены TypeScript типы
- [ ] Тексты переведены на русский
- [ ] Формы используют `react-hook-form` + Zod
- [ ] Обработаны состояния loading/error
- [ ] Компонент следует структуре проекта
