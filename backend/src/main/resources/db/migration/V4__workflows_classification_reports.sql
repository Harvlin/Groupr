CREATE TABLE event_classifications (
    id UUID PRIMARY KEY,
    event_id UUID NOT NULL REFERENCES contribution_events(id) ON DELETE CASCADE,
    provider VARCHAR(80) NOT NULL,
    model_name VARCHAR(120) NOT NULL,
    prompt_version VARCHAR(64) NOT NULL,
    category VARCHAR(32),
    confidence DOUBLE PRECISION,
    flags JSONB,
    rationale TEXT,
    created_at TIMESTAMPTZ NOT NULL
);

CREATE TABLE tasks (
    id UUID PRIMARY KEY,
    project_id UUID NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
    title VARCHAR(240) NOT NULL,
    description TEXT,
    assigned_to_member_id UUID REFERENCES project_members(id),
    status VARCHAR(20) NOT NULL CHECK (status IN ('OPEN', 'IN_PROGRESS', 'DONE')),
    created_by_member_id UUID REFERENCES project_members(id),
    due_date TIMESTAMPTZ,
    from_coach_suggestion BOOLEAN NOT NULL DEFAULT FALSE,
    source VARCHAR(40) NOT NULL DEFAULT 'TRUTH_LAYER',
    external_id VARCHAR(255),
    external_url TEXT,
    external_status VARCHAR(80),
    external_updated_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ NOT NULL
);

CREATE INDEX tasks_project_idx ON tasks(project_id, status);

CREATE TABLE offline_logs (
    id UUID PRIMARY KEY,
    project_id UUID NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES users(id),
    description TEXT NOT NULL,
    hours DOUBLE PRECISION NOT NULL CHECK (hours > 0 AND hours <= 24),
    date_value DATE NOT NULL,
    category VARCHAR(40) NOT NULL,
    status VARCHAR(20) NOT NULL CHECK (status IN ('UNVERIFIED', 'CORROBORATED', 'DISPUTED')),
    created_at TIMESTAMPTZ NOT NULL
);

CREATE TABLE corroboration_requests (
    id UUID PRIMARY KEY,
    log_id UUID NOT NULL REFERENCES offline_logs(id) ON DELETE CASCADE,
    requesting_member_id UUID NOT NULL REFERENCES project_members(id),
    target_member_id UUID NOT NULL REFERENCES project_members(id),
    description TEXT NOT NULL,
    hours DOUBLE PRECISION NOT NULL,
    date_value DATE NOT NULL,
    status VARCHAR(20) NOT NULL CHECK (status IN ('PENDING', 'CONFIRMED', 'DECLINED')),
    responded_at TIMESTAMPTZ
);

CREATE TABLE disputes (
    id UUID PRIMARY KEY,
    project_id UUID NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES users(id),
    reason TEXT NOT NULL,
    status VARCHAR(20) NOT NULL CHECK (status IN ('OPEN', 'RESOLVED')),
    resolution TEXT,
    created_at TIMESTAMPTZ NOT NULL,
    resolved_at TIMESTAMPTZ
);

CREATE TABLE notifications (
    id UUID PRIMARY KEY,
    recipient_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    project_id UUID REFERENCES projects(id) ON DELETE CASCADE,
    type VARCHAR(40) NOT NULL,
    project_name VARCHAR(160),
    message TEXT NOT NULL,
    action_label VARCHAR(120),
    action_route VARCHAR(255),
    is_read BOOLEAN NOT NULL DEFAULT FALSE,
    created_at TIMESTAMPTZ NOT NULL
);

CREATE INDEX notifications_recipient_idx ON notifications(recipient_id, is_read, created_at DESC);

CREATE TABLE report_exports (
    id UUID PRIMARY KEY,
    project_id UUID NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
    requested_by UUID NOT NULL REFERENCES users(id),
    status VARCHAR(20) NOT NULL CHECK (status IN ('QUEUED', 'READY', 'FAILED')),
    object_storage_key TEXT,
    expires_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ NOT NULL
);
