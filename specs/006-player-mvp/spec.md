# Feature Specification: Player Entity with Admin CRUD and Public Profile Page (MVP)

**Feature Branch**: `006-player-mvp`  
**Created**: 2025-01-27  
**Status**: Draft  
**Input**: User description: "Сущность Player + админский CRUD + публичная страница игрока (MVP)"

## Clarifications

### Session 2025-01-27

- Q: What format should the "position" field use - predefined enum, predefined with manual input option, or free text? → A: Predefined enum with fixed set of positions (e.g., Goalkeeper, Defender, Midfielder, Forward)
- Q: How should the system handle invalid basic statistics values (negative numbers, unrealistically high values)? → A: Validate and block saving - prevent negative values, set reasonable maximum limits (e.g., matches ≤ 1000, goals ≤ 500, minutes ≤ 100000)
- Q: What default values should basic statistics fields have when a new player is created? → A: Zero (0) - all statistics fields are initialized to zero when a player is created
- Q: How should the system handle concurrent editing of the same player by multiple administrators? → A: Last-Write-Wins - the last save overwrites previous changes without warnings
- Q: Should there be a limit on the number of video highlight links per player? → A: Reasonable limit - maximum 10-20 links per player (exact number to be determined during implementation)

## User Scenarios & Testing _(mandatory)_

### User Story 1 - Admin Creates New Player (Priority: P1)

Администратор создаёт нового игрока в системе, указывая его имя, фамилию, позицию, дату рождения и клуб (команду). После создания игрок появляется в списке игроков и доступен для просмотра на публичной странице.

**Why this priority**: Это базовая функциональность для наполнения системы данными об игроках. Без возможности создания игроков система не может хранить информацию о них, что делает невозможным дальнейшую работу со статистикой, матчами и другими фичами.

**Independent Test**: Админ может открыть страницу управления игроками, создать нового игрока с обязательными полями (имя, фамилия, позиция, дата рождения), сохранить, и новый игрок появится в списке. Это можно протестировать независимо, проверив создание записи и её отображение в списке.

**Acceptance Scenarios**:

1. **Given** администратор авторизован в системе и имеет роль ADMIN, **When** он открывает страницу управления игроками, **Then** он видит кнопку "Создать игрока" или возможность открыть форму создания
2. **Given** администратор открывает форму создания игрока, **When** он заполняет обязательные поля (имя, фамилия, позиция, дата рождения), **Then** форма позволяет сохранить игрока
3. **Given** администратор заполняет форму создания игрока, **When** он не указывает обязательные поля (имя, фамилия, позиция, дата рождения), **Then** система показывает ошибки валидации и не создаёт игрока
4. **Given** администратор заполняет все обязательные поля корректно, **When** он сохраняет форму, **Then** новый игрок создаётся в системе и появляется в списке игроков
5. **Given** администратор создал нового игрока, **When** он открывает публичную страницу этого игрока, **Then** он видит профиль игрока с указанными данными
6. **Given** администратор не авторизован или не имеет роли ADMIN, **When** он пытается открыть страницу управления игроками, **Then** доступ запрещён (редирект или ошибка 403)

---

### User Story 2 - Admin Views Players List (Priority: P1)

Администратор открывает раздел управления игроками и видит список всех игроков системы в виде таблицы с основными данными: имя, фамилия, позиция, дата рождения, клуб. Список отображается с пагинацией для обеспечения производительности при большом количестве игроков.

**Why this priority**: Это базовая функциональность для просмотра и управления игроками. Админ должен видеть всех игроков в системе, чтобы иметь возможность их редактировать, удалять или просматривать детальную информацию.

**Independent Test**: Админ может открыть страницу управления игроками и увидеть таблицу со всеми игроками. Это можно протестировать независимо, просто проверив отображение данных из базы.

**Acceptance Scenarios**:

1. **Given** администратор авторизован в системе и имеет роль ADMIN, **When** он открывает страницу управления игроками, **Then** он видит таблицу с игроками (с пагинацией, если игроков больше, чем записей на страницу)
2. **Given** в системе есть игроки, **When** администратор открывает страницу управления игроками, **Then** для каждого игрока отображаются: имя, фамилия, позиция, дата рождения, клуб
3. **Given** в системе есть много игроков (больше 50), **When** администратор открывает страницу управления игроками, **Then** он видит первую страницу с ограниченным количеством записей и может переключаться между страницами
4. **Given** администратор просматривает список игроков, **When** он видит таблицу, **Then** он может кликнуть на игрока, чтобы перейти к его редактированию или просмотру публичной страницы
5. **Given** администратор открывает страницу управления игроками, **When** данные загружаются, **Then** система показывает сообщение "Загрузка..." или индикатор загрузки
6. **Given** в системе нет игроков, **When** администратор открывает страницу управления игроками, **Then** система показывает сообщение "Игроки не найдены" вместо пустой таблицы

---

### User Story 3 - View Public Player Profile (Priority: P1)

Любой пользователь (авторизованный или нет) может открыть публичную страницу игрока по URL `/players/[id]` и увидеть профиль игрока с основной информацией: имя, фамилия, позиция, дата рождения, клуб, базовая статистика (матчи, голы, ассисты, время на поле), список матчей (блок под будущую привязку через PlayerMatchStats) и видео хайлайты (список ссылок).

**Why this priority**: Публичные профили игроков — это ключевая ценность платформы. Без них невозможно демонстрировать игроков тренерам, агентам и другим заинтересованным сторонам. Это базовая функциональность для видимости платформы.

**Independent Test**: Пользователь может открыть публичную страницу любого существующего игрока по его ID и увидеть его профиль с основными данными. Это можно протестировать независимо, проверив отображение данных игрока на публичной странице.

**Acceptance Scenarios**:

1. **Given** в системе существует игрок с идентификатором `player-123`, **When** пользователь открывает URL `/players/player-123`, **Then** он видит публичную страницу игрока с именем, фамилией, позицией, датой рождения и клубом
2. **Given** пользователь открывает публичную страницу игрока, **When** он просматривает профиль, **Then** он видит блок с базовой статистикой: количество матчей, количество голов, количество ассистов, общее время на поле
3. **Given** пользователь открывает публичную страницу игрока, **When** он прокручивает страницу, **Then** он видит блок "Матчи" (пока пустой или с заглушкой, так как связь через PlayerMatchStats будет реализована позже)
4. **Given** пользователь открывает публичную страницу игрока, **When** он прокручивает страницу, **Then** он видит блок "Видео хайлайты" со списком ссылок на видео (если они есть)
5. **Given** пользователь открывает URL `/players/nonexistent-id`, **When** страница загружается, **Then** система показывает ошибку 404 "Игрок не найден"
6. **Given** пользователь не авторизован в системе, **When** он открывает публичную страницу игрока, **Then** он всё равно может просматривать профиль (публичная страница доступна без авторизации)
7. **Given** пользователь открывает публичную страницу игрока, **When** данные загружаются, **Then** система показывает индикатор загрузки

---

### User Story 4 - Admin Edits Player (Priority: P2)

Администратор редактирует данные существующего игрока: изменяет имя, фамилию, позицию, дату рождения, клуб, базовую статистику, добавляет или удаляет видео хайлайты. После сохранения изменения отображаются в списке игроков и на публичной странице.

**Why this priority**: Админ должен иметь возможность обновлять информацию об игроках (исправлять ошибки, обновлять статистику, добавлять видео). Это важная функциональность для поддержания актуальности данных, но менее критична, чем создание и просмотр.

**Independent Test**: Админ может открыть форму редактирования для любого игрока из списка, изменить его данные и сохранить изменения. Это можно протестировать независимо, проверив обновление данных в списке и на публичной странице.

**Acceptance Scenarios**:

1. **Given** администратор находится на странице управления игроками, **When** он нажимает кнопку редактирования для игрока, **Then** открывается форма редактирования с текущими данными игрока
2. **Given** администратор редактирует игрока, **When** он изменяет имя, фамилию или позицию, **Then** изменения сохраняются и отображаются в списке игроков и на публичной странице
3. **Given** администратор редактирует игрока, **When** он обновляет базовую статистику (матчи, голы, ассисты, время на поле), **Then** изменения сохраняются и отображаются на публичной странице игрока
4. **Given** администратор редактирует игрока, **When** он добавляет новую ссылку на видео в список хайлайтов, **Then** ссылка сохраняется и отображается на публичной странице игрока
5. **Given** администратор редактирует игрока, **When** он удаляет ссылку на видео из списка хайлайтов, **Then** ссылка удаляется и больше не отображается на публичной странице
6. **Given** администратор редактирует игрока, **When** он сохраняет изменения, **Then** обновлённые данные отображаются в списке игроков и на публичной странице в течение нескольких секунд

---

### User Story 5 - Admin Deletes Player (Priority: P3)

Администратор удаляет игрока из системы. При удалении игрок полностью удаляется из системы, его публичная страница становится недоступной (404), и он исчезает из списка игроков.

**Why this priority**: Это менее критичная функциональность, но важная для управления данными. Админ должен иметь возможность удалять игроков, которые больше не актуальны (например, игрок перестал участвовать в турнирах). Однако это можно делать вручную через базу данных, поэтому приоритет ниже.

**Independent Test**: Админ может выбрать игрока и удалить его с подтверждением. Это можно протестировать независимо, проверив исчезновение игрока из списка и недоступность его публичной страницы.

**Acceptance Scenarios**:

1. **Given** администратор находится на странице управления игроками, **When** он нажимает кнопку удаления для игрока, **Then** система показывает диалог подтверждения удаления
2. **Given** администратор подтверждает удаление игрока, **When** он нажимает "Удалить" в диалоге, **Then** игрок удаляется из системы и исчезает из списка игроков
3. **Given** администратор отменяет удаление, **When** он нажимает "Отмена" в диалоге, **Then** игрок остаётся в системе, диалог закрывается
4. **Given** администратор удалил игрока, **When** пользователь пытается открыть публичную страницу этого игрока, **Then** система показывает ошибку 404 "Игрок не найден"
5. **Given** в системе есть игрок с привязанными данными (например, будущая связь с матчами), **When** администратор удаляет игрока, **Then** система обрабатывает удаление в соответствии с правилами каскадного удаления или блокирует удаление с предупреждением о зависимостях

---

### Edge Cases

- Что происходит, когда администратор пытается создать игрока с некорректной датой рождения (например, дата в будущем)?
- Как система обрабатывает ситуацию, когда администратор редактирует игрока, а тот одновременно просматривается на публичной странице? → A: При сохранении изменений они сразу отображаются на публичной странице; для конкурентного редактирования используется стратегия Last-Write-Wins (последнее сохранение перезаписывает предыдущее)
- Что происходит, когда администратор добавляет некорректную ссылку на видео (не URL или недоступный URL)? → A: Система валидирует формат URL и блокирует добавление некорректных ссылок с сообщением об ошибке
- Что происходит, когда администратор пытается добавить больше видео-ссылок, чем установленный максимум? → A: Система блокирует добавление новых ссылок и показывает сообщение о достижении максимального количества
- Как система обрабатывает ситуацию, когда администратор удаляет игрока, у которого есть активные связи с другими сущностями (матчи, статистика)?
- Что происходит, если пользователь открывает публичную страницу игрока, а данные загружаются медленно (более 5 секунд)?
- Как система обрабатывает ситуацию, когда базовая статистика игрока (матчи, голы) имеет отрицательные значения или нереалистичные значения? → A: Система валидирует значения при сохранении и блокирует сохранение с сообщением об ошибке, если значения отрицательные или превышают установленные максимальные лимиты
- Что происходит, когда администратор пытается создать игрока без указания клуба (если клуб является обязательным полем)?

## Requirements _(mandatory)_

### Functional Requirements

- **FR-001**: System MUST allow administrators to create new players with required fields: first name, last name, position (selected from predefined enum), date of birth
- **FR-025**: System MUST validate that player position is selected from predefined enum values (e.g., Goalkeeper, Defender, Midfielder, Forward)
- **FR-002**: System MUST allow administrators to optionally specify club/team for a player during creation or editing
- **FR-003**: System MUST validate that date of birth is a valid date and is not in the future
- **FR-004**: System MUST restrict access to player management interface (create, edit, delete) to users with ADMIN role only
- **FR-005**: System MUST allow administrators to view a list of all players with pagination support (20-50 records per page)
- **FR-006**: System MUST display for each player in the list: first name, last name, position, date of birth, club/team
- **FR-007**: System MUST show explicit loading message (e.g., "Загрузка...") while player list is being fetched
- **FR-008**: System MUST show explicit empty state message (e.g., "Игроки не найдены") when no players exist in the system
- **FR-009**: System MUST allow any user (authenticated or not) to view public player profile page at `/players/[id]`
- **FR-010**: System MUST display on public player page: first name, last name, position, date of birth, club/team
- **FR-011**: System MUST display basic statistics on public player page: total matches, total goals, total assists, total minutes played
- **FR-012**: System MUST display a "Matches" section on public player page (placeholder for future PlayerMatchStats integration)
- **FR-013**: System MUST display a "Video Highlights" section on public player page with list of video links
- **FR-014**: System MUST allow administrators to add video highlight links (URLs) to a player's profile
- **FR-015**: System MUST allow administrators to remove video highlight links from a player's profile
- **FR-016**: System MUST validate that video highlight links are valid URLs
- **FR-029**: System MUST enforce a reasonable maximum limit on the number of video highlight links per player (e.g., 10-20 links, exact number to be determined during implementation) and prevent adding more links once the limit is reached
- **FR-017**: System MUST allow administrators to edit player information: first name, last name, position, date of birth, club/team
- **FR-018**: System MUST allow administrators to update basic statistics (matches, goals, assists, minutes played) for a player
- **FR-026**: System MUST validate basic statistics values: prevent negative numbers, enforce reasonable maximum limits (e.g., matches ≤ 1000, goals ≤ 500, assists ≤ 500, minutes ≤ 100000), and block saving with clear error messages if validation fails
- **FR-019**: System MUST allow administrators to delete players with confirmation dialog
- **FR-020**: System MUST show 404 error page when user attempts to access non-existent player profile
- **FR-021**: System MUST handle errors gracefully and show user-friendly error messages in Russian language
- **FR-022**: System MUST store player data persistently in the database
- **FR-023**: System MUST store basic statistics (matches, goals, assists, minutes played) as aggregate fields in player entity (MVP approach)
- **FR-027**: System MUST initialize all basic statistics fields (matches, goals, assists, minutes played) to zero (0) when a new player is created
- **FR-028**: System MUST handle concurrent editing using Last-Write-Wins strategy (last save overwrites previous changes without warnings or conflict resolution)
- **FR-024**: System MUST store video highlight links as a list (array) associated with player entity

### Key Entities _(include if feature involves data)_

- **Player**: Represents a player in the system with attributes: unique identifier, first name (required), last name (required), position (required, enum with predefined values: Goalkeeper, Defender, Midfielder, Forward), date of birth (required), club/team (optional, reference to Team entity), basic statistics (total matches, total goals, total assists, total minutes played - stored as aggregate fields with default value of 0), video highlight links (list of URLs), creation timestamp, last update timestamp. Players can be associated with teams (future relation), match statistics (future PlayerMatchStats relation), and video links.

## Success Criteria _(mandatory)_

### Measurable Outcomes

- **SC-001**: Administrators can create a new player with all required information in under 2 minutes
- **SC-002**: Administrators can view the first page of players (20-50 records) in the system within 2 seconds of opening the management page
- **SC-003**: Administrators can edit player information and see changes reflected in the list and public page within 1 second of saving
- **SC-004**: Any user can view a public player profile page within 3 seconds of accessing the URL
- **SC-005**: 95% of player creation attempts succeed on first try when all required fields are provided correctly
- **SC-006**: System prevents 100% of invalid date of birth entries (future dates, invalid formats) with clear error messages
- **SC-010**: System prevents 100% of invalid basic statistics entries (negative values, values exceeding maximum limits) with clear error messages
- **SC-007**: Administrators can complete player management tasks (view, create, edit, delete) without requiring technical support or documentation
- **SC-008**: Public player profiles display correctly for 100% of existing players in the system
- **SC-009**: System handles up to 1000 players in the database without performance degradation for list views and public profiles

## Assumptions

- Administrators have been properly authenticated and have ADMIN role before accessing player management features
- Player management interface is part of the admin dashboard (similar to user management)
- System uses existing authentication and authorization mechanisms (NextAuth with role-based access control)
- Team/Club entity may exist in the future, but for MVP player can be created without team (teamId is optional)
- Basic statistics (matches, goals, assists, minutes) are stored as aggregate fields in Player entity (not computed from PlayerMatchStats, which will be added later) and are initialized to zero (0) when a player is created
- Video highlights are stored as a simple list of URLs in Player entity (not as separate VideoLink entity, which will be added later) with a reasonable maximum limit (e.g., 10-20 links per player)
- Public player pages are accessible without authentication (no login required)
- UI text and error messages are displayed in Russian language as per project requirements
- Player date of birth is used to calculate age for display purposes (if needed)
- Position is a predefined enum with fixed values (e.g., Goalkeeper, Defender, Midfielder, Forward) - specific enum values to be defined during implementation

## Dependencies

- Existing authentication system with role-based access control (NextAuth)
- Admin role verification mechanism
- Database connection and Prisma setup
- Existing admin dashboard structure (for consistency with user management)
- Team/Club entity structure (if teamId is required, otherwise optional for MVP)

## Out of Scope

- Player search and filtering functionality
- Advanced statistics visualization (charts, graphs)
- Player comparison features
- PlayerMatchStats integration (connection to match statistics - future feature)
- VideoLink entity with metadata (separate entity for videos - future feature)
- Player images/photos management
- Player profile editing by players themselves
- Bulk player operations (import/export, bulk edit)
- Player activity logs and audit history viewing
- Email notifications related to player creation or updates
- Player social media links
- Player agent relationships
- Player contract information
