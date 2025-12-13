# Feature Specification: NextAuth Setup with User Model, Roles, and Private Routes

**Feature Branch**: `004-auth-roles-setup`  
**Created**: 2025-01-27  
**Status**: Draft  
**Input**: User description: "Настройка NextAuth, модели User, ролей (PLAYER/COACH/AGENT/ADMIN) и privateRoute + seed тестового админа"

## Clarifications

### Session 2025-01-27

- Q: What additional fields should be included in the User model beyond basic authentication fields? → A: Base fields (id, email, password hash, role, timestamps) + name (display name) + emailVerified (email verification flag) + isActive (account active status flag)
- Q: How should isActive and emailVerified fields affect authentication behavior? → A: Users with isActive=false cannot sign in (authentication blocked); emailVerified field does not affect sign-in ability (used for display/status only)
- Q: What session storage strategy should NextAuth use (database sessions vs JWT tokens)? → A: Database sessions (sessions stored in database table, enabling session revocation and management)
- Q: How should the system handle role changes for users with active sessions? → A: Session remains valid, but role is verified on each request; if role mismatch detected, user is logged out and must re-authenticate
- Q: How should the seed script handle existing admin user? → A: Skip creation if admin user already exists (idempotent skip behavior)

## User Scenarios & Testing _(mandatory)_

### User Story 1 - Developer Can Authenticate Users (Priority: P1)

A developer needs to have a working authentication system that allows users to sign in and sign out. The system must integrate with the database to store and retrieve user credentials, and provide session management.

**Why this priority**: Without authentication, the system cannot identify users or enforce access control. This is the foundational requirement that enables all role-based features, private routes, and user-specific functionality.

**Independent Test**: Can be fully tested by configuring authentication, creating a test user, signing in, verifying the session exists, and signing out. This delivers a complete authentication flow that can be used by all other features.

**Acceptance Scenarios**:

1. **Given** a developer has configured authentication, **When** a user signs in with valid credentials, **Then** the system creates a session and the user is authenticated
2. **Given** an authenticated user, **When** they sign out, **Then** the session is destroyed and the user is no longer authenticated
3. **Given** an unauthenticated user, **When** they attempt to access a protected route, **Then** they are redirected to the sign-in page
4. **Given** an authenticated user, **When** they access a protected route, **Then** they can view the content without being redirected

---

### User Story 2 - System Can Store and Retrieve User Data with Roles (Priority: P1)

A developer needs to have a User model in the database that stores user information and their role (PLAYER, COACH, AGENT, or ADMIN). The system must be able to create, read, and update users with their roles.

**Why this priority**: User data and roles are essential for all role-based features. Without this, the system cannot differentiate between user types or enforce role-based access control.

**Independent Test**: Can be fully tested by creating a user with a role in the database, retrieving the user with their role, and verifying that role information is correctly stored and accessible. This delivers the data foundation for all role-based functionality.

**Acceptance Scenarios**:

1. **Given** a developer has defined the User model with roles, **When** they create a user with a specific role, **Then** the user is stored in the database with the correct role
2. **Given** a user exists in the database, **When** the system retrieves the user, **Then** it includes the user's role information
3. **Given** a user exists, **When** the system updates the user's role, **Then** the change is persisted in the database
4. **Given** the system queries users, **When** it filters by role, **Then** it returns only users with that role

---

### User Story 3 - Developer Can Protect Routes Based on Authentication Status (Priority: P1)

A developer needs a mechanism to mark routes as private (requiring authentication) and automatically redirect unauthenticated users to the sign-in page. This must work for both page routes and API routes.

**Why this priority**: Without route protection, all content is publicly accessible. This is essential for securing user-specific data, dashboards, and administrative functions.

**Independent Test**: Can be fully tested by marking a route as private, attempting to access it while unauthenticated (should redirect), and accessing it while authenticated (should succeed). This delivers basic access control that protects sensitive content.

**Acceptance Scenarios**:

1. **Given** a route is marked as private, **When** an unauthenticated user attempts to access it, **Then** they are redirected to the sign-in page
2. **Given** a route is marked as private, **When** an authenticated user accesses it, **Then** they can view the content without redirection
3. **Given** an API route is protected, **When** an unauthenticated request is made, **Then** it returns an unauthorized error
4. **Given** an API route is protected, **When** an authenticated request is made, **Then** it processes the request normally

---

### User Story 4 - Developer Can Seed Test Admin User (Priority: P2)

A developer needs a way to create a test admin user in the database for development and testing purposes. This user should have the ADMIN role and be usable immediately after seeding.

**Why this priority**: Having a test admin user enables developers to test admin-only features, verify role-based access control, and develop features that require administrative privileges. While not blocking development, it significantly accelerates testing and development workflows.

**Independent Test**: Can be fully tested by running the seed script, verifying the admin user exists in the database with the ADMIN role, and successfully signing in with the admin credentials. This delivers a ready-to-use test account for development.

**Acceptance Scenarios**:

1. **Given** a developer runs the seed script, **When** the script completes, **Then** a test admin user exists in the database with the ADMIN role
2. **Given** the seed script has run, **When** a developer signs in with the test admin credentials, **Then** authentication succeeds and the user has ADMIN role
3. **Given** the seed script is run multiple times, **When** it executes, **Then** it handles existing users gracefully (either updates or skips without errors)
4. **Given** the database is empty, **When** the seed script runs, **Then** it creates the admin user successfully

---

### User Story 5 - System Can Enforce Role-Based Access Control (Priority: P2)

A developer needs the ability to restrict access to routes or functionality based on user roles. The system must support checking if a user has a specific role (PLAYER, COACH, AGENT, ADMIN) and allow or deny access accordingly.

**Why this priority**: Role-based access control enables different user types to have different capabilities and access levels. While basic authentication protection is P1, role-based restrictions are essential for features like admin panels, coach dashboards, and player-specific views.

**Independent Test**: Can be fully tested by creating users with different roles, attempting to access role-protected routes with each user, and verifying that only users with the correct role can access the content. This delivers fine-grained access control beyond basic authentication.

**Acceptance Scenarios**:

1. **Given** a route is protected for ADMIN role only, **When** a user with ADMIN role accesses it, **Then** they can view the content
2. **Given** a route is protected for ADMIN role only, **When** a user with PLAYER role attempts to access it, **Then** they are denied access (redirected or shown error)
3. **Given** an API endpoint requires COACH role, **When** a request is made by a user with COACH role, **Then** the request is processed
4. **Given** an API endpoint requires COACH role, **When** a request is made by a user with AGENT role, **Then** the request returns a forbidden error

---

### Edge Cases

- What happens when a user's session expires while they are using the application? (System should redirect to sign-in page and preserve the intended destination)
- How does the system handle authentication when the database is unavailable? (System should provide clear error messages and prevent authentication)
- What happens when a user attempts to sign in with invalid credentials? (System should show an error message without revealing whether the email or password is incorrect)
- What happens when a user with isActive=false attempts to sign in? (System should block authentication and show an appropriate error message)
- How does the system handle concurrent sign-in attempts from the same user? (System should allow multiple sessions or handle appropriately)
- What happens when a user's role is changed while they have an active session? (Session remains valid, but role is verified on each request; if role mismatch is detected, user is logged out and must re-authenticate)
- How does the system handle sign-in attempts with a non-existent email? (System should show a generic error message without revealing the email doesn't exist)
- What happens when the seed script runs but the admin user already exists? (System skips creation and continues without errors, maintaining idempotent behavior)
- How does the system handle private route access when authentication service is unavailable? (System should treat as unauthenticated and redirect to sign-in)
- What happens when a user tries to access a role-protected route but their role is null or undefined? (System should deny access and treat as unauthenticated)
- How does the system handle session token tampering or invalid tokens? (System should invalidate the session and require re-authentication)

## Requirements _(mandatory)_

### Functional Requirements

- **FR-001**: System MUST provide user authentication functionality that allows users to sign in and sign out
- **FR-002**: System MUST store user credentials and session data in the database
- **FR-028**: System MUST store sessions in a database table (not JWT tokens) to enable session management and revocation (clarifies FR-002 implementation choice)
- **FR-003**: System MUST provide a User model in the database schema with required fields (id, email, password hash, role, name, emailVerified, isActive, timestamps)
- **FR-004**: System MUST support four user roles: PLAYER, COACH, AGENT, and ADMIN
- **FR-005**: System MUST store user roles as an enum type in the database
- **FR-006**: System MUST provide a mechanism to mark routes as private (requiring authentication)
- **FR-007**: System MUST automatically redirect unauthenticated users from private routes to the sign-in page
- **FR-008**: System MUST preserve the intended destination URL when redirecting unauthenticated users to sign-in
- **FR-009**: System MUST provide a way to check user authentication status in route handlers and components
- **FR-010**: System MUST provide a way to access the current user's information (including role) in authenticated contexts
- **FR-011**: System MUST provide a seed script that creates a test admin user with predefined credentials
- **FR-012**: System MUST ensure the seed script can be run multiple times without errors (idempotent)
- **FR-031**: System MUST skip admin user creation if a user with the same email already exists (idempotent skip - implements FR-012)
- **FR-013**: System MUST provide a way to check if a user has a specific role
- **FR-014**: System MUST support role-based access control for routes and API endpoints
- **FR-015**: System MUST deny access to role-protected resources when the user doesn't have the required role
- **FR-016**: System MUST hash user passwords before storing them in the database
- **FR-017**: System MUST never return password hashes in API responses or user objects
- **FR-018**: System MUST validate user credentials during sign-in
- **FR-026**: System MUST block sign-in attempts for users with isActive=false
- **FR-027**: System MUST allow sign-in for users regardless of emailVerified status (emailVerified is informational only)
- **FR-019**: System MUST provide clear error messages for authentication failures without revealing sensitive information
- **FR-020**: System MUST handle session expiration and invalidate expired sessions
- **FR-029**: System MUST verify user role from database on each protected request (not rely solely on session data)
- **FR-030**: System MUST log out users automatically if their role changes and no longer matches session role
- **FR-021**: System MUST support both page routes and API routes for authentication protection
- **FR-022**: System MUST integrate authentication with the existing database setup (Prisma + PostgreSQL)
- **FR-023**: System MUST store user display name (name field) in the User model
- **FR-024**: System MUST track email verification status (emailVerified field) in the User model
- **FR-025**: System MUST track account active status (isActive field) in the User model

### Non-Functional Requirements

- **NFR-001**: Authentication system MUST respond to sign-in requests within 2 seconds under normal conditions
- **NFR-002**: Session validation MUST complete within 500 milliseconds for protected route access
- **NFR-003**: System MUST support at least 1000 concurrent authenticated sessions
- **NFR-004**: Password hashing MUST use industry-standard secure hashing algorithms
- **NFR-005**: System MUST protect against common authentication vulnerabilities (brute force, session hijacking, etc.). MVP phase includes secure session management and error logging; rate limiting and CSRF protection deferred to production hardening phase
- **NFR-006**: Authentication errors MUST be logged for security monitoring without exposing sensitive data
- **NFR-007**: Seed script MUST complete within 5 seconds for creating a single admin user

### Key Entities _(include if feature involves data)_

- **User**: Represents a user account in the system. Key attributes include: unique identifier, email address (unique), password hash (encrypted), role (enum: PLAYER, COACH, AGENT, ADMIN), name (display name), emailVerified (boolean flag indicating email verification status), isActive (boolean flag indicating account active status), creation timestamp, last update timestamp. Relationships: can be extended in future features to relate to players, teams, matches, etc.

- **Session**: Represents an active user authentication session. Key attributes include: session identifier, user reference, expiration timestamp, creation timestamp. The session links an authenticated user to their current login state.

- **Role**: Represents a user's permission level and access rights. Values: PLAYER (basic user), COACH (can manage teams/players), AGENT (can manage player contracts), ADMIN (full system access). This is stored as an enum in the database and used for access control decisions.

## Assumptions

- NextAuth.js v5 will be used as the authentication library, as it integrates well with Next.js App Router and Prisma
- Authentication will use email/password credentials (credentials provider) as the primary method
- Session storage will use database sessions (sessions stored in database table via NextAuth, enabling session revocation and management)
- The User model will be the first domain model added to the existing Prisma schema
- Password hashing will use bcrypt or similar secure hashing algorithm
- The seed script will be a standalone script that can be run via npm command
- Test admin credentials will be documented in development documentation (not in production)
- Role-based access control will be implemented using middleware or route-level checks
- Private routes will be implemented using Next.js middleware or higher-order components
- The authentication system will work with the existing Next.js App Router structure
- Session management will persist across page refreshes and browser restarts (within expiration period)
- Multiple users can have the same role (many-to-one relationship between users and roles)
- Users can only have one role at a time (no multi-role support in initial implementation)
- The seed script will create exactly one test admin user with known credentials
- Future features may extend the User model with additional fields (name, avatar, preferences, etc.)

## Success Criteria _(mandatory)_

### Measurable Outcomes

- **SC-001**: A developer can set up authentication and create a test user in under 15 minutes from starting the setup process to successful sign-in
- **SC-002**: Sign-in operation completes successfully and creates a session within 2 seconds in 95% of attempts
- **SC-003**: Unauthenticated users attempting to access private routes are redirected to sign-in page 100% of the time
- **SC-004**: Authenticated users can access private routes without redirection 100% of the time
- **SC-005**: Seed script successfully creates test admin user on first run in 95% of attempts
- **SC-006**: Seed script can be run multiple times without errors (idempotent operation)
- **SC-007**: Role-based access control correctly denies access to unauthorized roles 100% of the time
- **SC-008**: Role-based access control correctly allows access to authorized roles 100% of the time
- **SC-009**: Session validation for protected routes completes within 500 milliseconds in 95% of requests
- **SC-010**: Authentication system integrates successfully with existing Prisma database setup without conflicts
- **SC-011**: Password hashing prevents password recovery from stored hashes (one-way hashing verified)
- **SC-012**: User model supports all four roles (PLAYER, COACH, AGENT, ADMIN) and stores them correctly in the database
- **SC-013**: Developers can check user authentication status and role in route handlers within 30 seconds of setup completion
- **SC-014**: Test admin user can successfully sign in and access admin-protected routes immediately after seeding
