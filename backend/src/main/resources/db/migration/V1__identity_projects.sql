CREATE TABLE users (
    id UUID PRIMARY KEY,
    email VARCHAR(320) NOT NULL,
    display_name VARCHAR(120) NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    role VARCHAR(20) NOT NULL CHECK (role IN ('STUDENT', 'TEACHER')),
    school VARCHAR(160),
    grade VARCHAR(80),
    status VARCHAR(20) NOT NULL DEFAULT 'ACTIVE' CHECK (status IN ('ACTIVE', 'DISABLED')),
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT users_email_unique UNIQUE (email)
);

CREATE TABLE projects (
    id UUID PRIMARY KEY,
    name VARCHAR(160) NOT NULL,
    subject VARCHAR(160),
    description TEXT,
    created_by UUID NOT NULL REFERENCES users(id),
    deadline TIMESTAMPTZ,
    status VARCHAR(20) NOT NULL DEFAULT 'SETUP' CHECK (status IN ('SETUP', 'ACTIVE', 'COMPLETED', 'FINALISED', 'ARCHIVED')),
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    finalized_at TIMESTAMPTZ
);

CREATE TABLE project_settings (
    project_id UUID PRIMARY KEY REFERENCES projects(id) ON DELETE CASCADE,
    expected_distribution VARCHAR(20) NOT NULL DEFAULT 'EQUAL' CHECK (expected_distribution IN ('EQUAL', 'CUSTOM')),
    custom_distribution JSONB,
    language VARCHAR(8) NOT NULL DEFAULT 'en',
    allow_offline_log BOOLEAN NOT NULL DEFAULT TRUE,
    auto_warn_threshold INTEGER NOT NULL DEFAULT 15 CHECK (auto_warn_threshold BETWEEN 0 AND 100)
);

CREATE TABLE project_members (
    id UUID PRIMARY KEY,
    project_id UUID NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES users(id),
    role VARCHAR(20) NOT NULL CHECK (role IN ('MEMBER', 'LEADER')),
    joined_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    left_at TIMESTAMPTZ,
    CONSTRAINT project_members_unique UNIQUE (project_id, user_id)
);

CREATE INDEX project_members_user_idx ON project_members(user_id);
CREATE INDEX projects_created_by_idx ON projects(created_by);

CREATE TABLE project_invitations (
    id UUID PRIMARY KEY,
    project_id UUID NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
    email VARCHAR(320) NOT NULL,
    role VARCHAR(20) NOT NULL CHECK (role IN ('MEMBER', 'LEADER')),
    token_hash VARCHAR(128) NOT NULL UNIQUE,
    status VARCHAR(20) NOT NULL DEFAULT 'PENDING' CHECK (status IN ('PENDING', 'ACCEPTED', 'DECLINED', 'EXPIRED')),
    expires_at TIMESTAMPTZ NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX project_invitations_email_idx ON project_invitations(email);
