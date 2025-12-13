# Feature Specification: Admin Users CRUD

**Feature Branch**: `005-admin-users`  
**Created**: 2025-01-27  
**Status**: Draft  
**Input**: User description: "Админский CRUD пользователей системы (Admin Dashboard / Users)"

## Clarifications

### Session 2025-01-27

- Q: How should the system handle displaying user lists when there are many users? → A: Use pagination (20-50 records per page)
- Q: How should the system handle deletion of the last administrator in the system? → A: No special handling - allow deletion without restrictions
- Q: How should the system handle concurrent editing of the same user by multiple administrators? → A: Last-write-wins (last save overwrites previous), optionally with warning
- Q: How should the system display loading and empty states for the user list? → A: Show explicit messages: "Загрузка..." during loading and "Пользователи не найдены" for empty list
- Q: How should the system handle errors when external authentication services (email provider, Yandex) are unavailable during user creation? → A: Block user creation with error message if external services are unavailable

## User Scenarios & Testing _(mandatory)_

### User Story 1 - View Users List (Priority: P1)

Администратор открывает раздел управления пользователями и видит список пользователей системы в виде таблицы с основными данными: имя, email, роль, статус активности, дата создания. Список отображается с пагинацией (20-50 записей на страницу) для обеспечения производительности при большом количестве пользователей.

**Why this priority**: Это базовая функциональность, без которой невозможно управление пользователями. Админ должен видеть, кто есть в системе, прежде чем выполнять какие-либо действия.

**Independent Test**: Админ может открыть страницу управления пользователями и увидеть таблицу со всеми пользователями. Это можно протестировать независимо, просто проверив отображение данных.

**Acceptance Scenarios**:

1. **Given** администратор авторизован в системе, **When** он открывает страницу управления пользователями, **Then** он видит таблицу с пользователями (с пагинацией, если пользователей больше, чем записей на страницу)
2. **Given** в системе есть 10 пользователей, **When** администратор открывает страницу управления пользователями, **Then** он видит все 10 записей в таблице (на одной странице, так как их меньше лимита пагинации)
3. **Given** в системе есть 100 пользователей, **When** администратор открывает страницу управления пользователями, **Then** он видит первую страницу с 20-50 записями и может переключаться между страницами
4. **Given** администратор просматривает список пользователей, **When** он видит таблицу, **Then** для каждого пользователя отображаются: имя (если указано), email, роль, статус активности, дата создания
5. **Given** администратор открывает страницу управления пользователями, **When** данные загружаются, **Then** система показывает сообщение "Загрузка..." или индикатор загрузки
6. **Given** в системе нет пользователей, **When** администратор открывает страницу управления пользователями, **Then** система показывает сообщение "Пользователи не найдены" вместо пустой таблицы
7. **Given** администратор не авторизован или не имеет роли ADMIN, **When** он пытается открыть страницу управления пользователями, **Then** доступ запрещён (редирект или ошибка 403)

---

### User Story 2 - Create New User (Priority: P1)

Администратор создаёт нового пользователя, указывая его email, имя (опционально), роль и статус активности. После создания пользователь может войти в систему через email-провайдер (magic link) или через Yandex, если email совпадёт.

**Why this priority**: Это критически важная функциональность для онбординга тренеров и агентов. Админ должен иметь возможность заранее создать пользователя с нужной ролью, чтобы тот мог войти в систему.

**Independent Test**: Админ может открыть форму создания пользователя, заполнить обязательные поля (email, роль), сохранить, и новый пользователь появится в списке. Это можно протестировать независимо, проверив создание записи и её отображение в списке.

**Acceptance Scenarios**:

1. **Given** администратор находится на странице управления пользователями, **When** он нажимает кнопку "Создать пользователя", **Then** открывается форма создания с полями: email (обязательное), имя (опциональное), роль (обязательное, выбор из PLAYER/COACH/AGENT/ADMIN), статус активности (по умолчанию активен)
2. **Given** администратор заполняет форму создания пользователя, **When** он указывает email, который уже существует в системе, **Then** система показывает ошибку валидации и не создаёт пользователя
3. **Given** администратор заполняет форму создания пользователя, **When** он указывает некорректный email, **Then** система показывает ошибку валидации
4. **Given** администратор заполняет все обязательные поля корректно, **When** он сохраняет форму, **Then** новый пользователь создаётся в системе и появляется в списке пользователей
5. **Given** администратор создал нового пользователя, **When** этот пользователь пытается войти через email-провайдер, **Then** он получает magic link на указанный email и может войти в систему
6. **Given** администратор создал нового пользователя, **When** этот пользователь входит через Yandex с тем же email, **Then** система связывает аккаунт и пользователь получает доступ

---

### User Story 3 - Edit User (Priority: P2)

Администратор редактирует данные существующего пользователя: изменяет имя, роль, статус активности. Email изменять нельзя (он является уникальным идентификатором).

**Why this priority**: Админ должен иметь возможность менять роли пользователей (например, сделать кого-то COACH или AGENT) и управлять статусом активности. Это важно для управления правами доступа.

**Independent Test**: Админ может открыть форму редактирования для любого пользователя из списка, изменить его данные и сохранить изменения. Это можно протестировать независимо, проверив обновление данных в списке.

**Acceptance Scenarios**:

1. **Given** администратор находится на странице управления пользователями, **When** он нажимает кнопку редактирования для пользователя, **Then** открывается форма редактирования с текущими данными пользователя
2. **Given** администратор редактирует пользователя, **When** он изменяет роль пользователя, **Then** изменения сохраняются и отображаются в списке пользователей
3. **Given** администратор редактирует пользователя, **When** он изменяет статус активности на "заблокирован", **Then** пользователь теряет доступ к системе (не может войти)
4. **Given** администратор редактирует пользователя, **When** он пытается изменить email, **Then** поле email недоступно для редактирования (заблокировано или скрыто)
5. **Given** администратор редактирует пользователя, **When** он сохраняет изменения, **Then** обновлённые данные отображаются в списке пользователей

---

### User Story 4 - Delete/Deactivate User (Priority: P3)

Администратор удаляет или деактивирует пользователя. При удалении пользователь полностью удаляется из системы. При деактивации пользователь остаётся в системе, но теряет доступ.

**Why this priority**: Это менее критичная функциональность, но важная для управления пользователями, которые больше не должны иметь доступ к системе. Деактивация предпочтительнее удаления, так как сохраняет историю.

**Independent Test**: Админ может выбрать пользователя и удалить или деактивировать его с подтверждением. Это можно протестировать независимо, проверив исчезновение или изменение статуса пользователя в списке.

**Acceptance Scenarios**:

1. **Given** администратор находится на странице управления пользователями, **When** он нажимает кнопку удаления для пользователя, **Then** система показывает диалог подтверждения удаления
2. **Given** администратор подтверждает удаление пользователя, **When** он нажимает "Удалить" в диалоге, **Then** пользователь удаляется из системы и исчезает из списка
3. **Given** администратор отменяет удаление, **When** он нажимает "Отмена" в диалоге, **Then** пользователь остаётся в системе, диалог закрывается
4. **Given** администратор деактивирует пользователя (меняет статус на неактивный), **When** этот пользователь пытается войти в систему, **Then** доступ запрещён, даже если учётные данные корректны
5. **Given** администратор пытается удалить самого себя, **When** он подтверждает удаление, **Then** система предотвращает удаление или показывает предупреждение о невозможности удаления текущего пользователя

---

### Edge Cases

- Что происходит, когда администратор пытается создать пользователя с email, который уже существует в системе?
- Как система обрабатывает ситуацию, когда администратор редактирует пользователя, а тот одновременно пытается войти в систему?
- Как система обрабатывает создание пользователя с некорректным форматом email?
- Что происходит, когда несколько администраторов одновременно редактируют одного пользователя? (Last-write-wins: последнее сохранение перезаписывает предыдущее)
- Что происходит, если администратор пытается изменить роль пользователя на роль, которой больше не существует в системе?
- Как система обрабатывает ситуацию, когда администратор деактивирует пользователя, у которого есть активная сессия?
- Что происходит, если внешние сервисы аутентификации (email provider, Yandex) недоступны при создании пользователя? (Создание блокируется с сообщением об ошибке)

## Requirements _(mandatory)_

### Functional Requirements

- **FR-001**: System MUST allow administrators to view a list of users in the system with pagination (20-50 records per page)
- **FR-002**: System MUST display for each user: name (if provided), email, role, active status, creation date
- **FR-020**: System MUST show explicit loading message (e.g., "Загрузка...") while user list is being fetched
- **FR-021**: System MUST show explicit empty state message (e.g., "Пользователи не найдены") when no users exist in the system
- **FR-003**: System MUST restrict access to user management interface to users with ADMIN role only
- **FR-004**: System MUST allow administrators to create new users with email (required), name (optional), role (required), and active status (default: active)
- **FR-005**: System MUST validate email format and uniqueness when creating or updating users
- **FR-006**: System MUST prevent creation of users with duplicate emails
- **FR-007**: System MUST allow administrators to edit user name, role, and active status
- **FR-008**: System MUST prevent editing of user email (email is immutable identifier)
- **FR-019**: System MUST handle concurrent edits using last-write-wins strategy (last save overwrites previous changes)
- **FR-009**: System MUST allow administrators to delete users with confirmation dialog
- **FR-010**: System MUST allow administrators to deactivate users (change active status to inactive)
- **FR-011**: System MUST prevent deactivated users from logging into the system
- **FR-012**: System MUST support role selection from available roles: PLAYER, COACH, AGENT, ADMIN
- **FR-013**: System MUST allow newly created users to authenticate via email provider (magic link) using the email address provided during creation
- **FR-014**: System MUST allow newly created users to authenticate via Yandex if email matches
- **FR-022**: System MUST verify availability of external authentication services (email provider, Yandex) before allowing user creation
- **FR-023**: System MUST block user creation and show error message if external authentication services are unavailable or return errors
- **FR-015**: System MUST show confirmation dialog before deleting a user
- **FR-016**: System MUST prevent administrators from deleting themselves (or show warning)
- **FR-017**: System MUST handle errors gracefully and show user-friendly error messages in Russian language
- **FR-018**: System MUST log all user management actions (create, update, delete) for audit purposes

### Key Entities _(include if feature involves data)_

- **User**: Represents a system user with attributes: unique identifier, name (optional), email (unique, required), role (PLAYER/COACH/AGENT/ADMIN), active status (boolean), creation timestamp, last update timestamp. Users can have multiple authentication accounts (email, Yandex) and active sessions.

- **Role**: Enumeration of user roles in the system: PLAYER (default), COACH, AGENT, ADMIN. Roles determine access levels and permissions within the system.

## Success Criteria _(mandatory)_

### Measurable Outcomes

- **SC-001**: Administrators can view the first page of users (20-50 records) in the system within 2 seconds of opening the management page
- **SC-002**: Administrators can create a new user with all required information in under 1 minute
- **SC-003**: Administrators can edit user information and see changes reflected in the list within 1 second of saving
- **SC-004**: 95% of user creation attempts succeed on first try when all required fields are provided correctly
- **SC-005**: Administrators can successfully change user roles and see immediate effect on user access permissions
- **SC-006**: Newly created users can successfully authenticate via email magic link within 5 minutes of account creation
- **SC-007**: System prevents 100% of duplicate email creation attempts with clear error messages
- **SC-008**: Administrators can complete user management tasks (view, create, edit, delete) without requiring technical support or documentation

## Assumptions

- Administrators have been properly authenticated and have ADMIN role before accessing user management features
- Email provider (magic link) and Yandex authentication are already configured and functional in the system
- User management interface is part of the admin dashboard
- System uses existing user data model with required fields: unique identifier, name (optional), email (unique), role, active status, timestamps
- All user management actions are performed by authenticated administrators only
- System maintains audit trail of user management operations for security and compliance
- UI text and error messages are displayed in Russian language as per project requirements
- Password is not set during user creation - users authenticate via email magic link or OAuth providers

## Dependencies

- Existing authentication system with role-based access control
- User data model in database with User entity
- Admin role verification mechanism
- Email provider configuration for magic link authentication
- Yandex OAuth provider configuration

## Out of Scope

- Bulk user operations (import/export, bulk edit)
- User password management (password reset, password change)
- Advanced user search and filtering (beyond basic list display)
- User activity logs and audit history viewing
- Email notification to users when their account is created or modified
- User profile management (users editing their own profiles)
- Two-factor authentication setup
- User groups or organization management
