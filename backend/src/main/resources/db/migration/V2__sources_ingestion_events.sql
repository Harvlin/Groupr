CREATE TABLE connected_sources (
    id UUID PRIMARY KEY,
    project_id UUID NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
    provider VARCHAR(32) NOT NULL CHECK (provider IN ('GOOGLE_DOCS', 'GITHUB_REPO')),
    external_id VARCHAR(500) NOT NULL,
    connected_by UUID NOT NULL REFERENCES users(id),
    status VARCHAR(20) NOT NULL DEFAULT 'CONNECTED' CHECK (status IN ('CONNECTED', 'SYNCING', 'ERROR', 'DISCONNECTED')),
    consent_confirmed BOOLEAN NOT NULL DEFAULT FALSE,
    connected_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    last_synced_at TIMESTAMPTZ,
    sync_cursor VARCHAR(500),
    CONSTRAINT connected_sources_external_unique UNIQUE (project_id, provider, external_id)
);

CREATE INDEX connected_sources_project_idx ON connected_sources(project_id);

CREATE TABLE source_credentials (
    source_id UUID PRIMARY KEY REFERENCES connected_sources(id) ON DELETE CASCADE,
    encrypted_access_token TEXT,
    encrypted_refresh_token TEXT,
    scopes TEXT,
    expires_at TIMESTAMPTZ,
    updated_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE member_consents (
    id UUID PRIMARY KEY,
    project_id UUID NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES users(id),
    source_id UUID REFERENCES connected_sources(id) ON DELETE CASCADE,
    status VARCHAR(20) NOT NULL CHECK (status IN ('PENDING', 'ACCEPTED', 'DECLINED')),
    consented_at TIMESTAMPTZ,
    revoked_at TIMESTAMPTZ,
    CONSTRAINT member_consents_unique UNIQUE (project_id, user_id, source_id)
);

CREATE TABLE sync_runs (
    id UUID PRIMARY KEY,
    source_id UUID NOT NULL REFERENCES connected_sources(id) ON DELETE CASCADE,
    status VARCHAR(20) NOT NULL CHECK (status IN ('QUEUED', 'RUNNING', 'SUCCEEDED', 'FAILED')),
    started_at TIMESTAMPTZ,
    completed_at TIMESTAMPTZ,
    cursor_before VARCHAR(500),
    cursor_after VARCHAR(500),
    error_code VARCHAR(120),
    retry_count INTEGER NOT NULL DEFAULT 0
);

CREATE INDEX sync_runs_source_idx ON sync_runs(source_id, started_at DESC);

CREATE TABLE raw_source_events (
    id UUID PRIMARY KEY,
    source_id UUID NOT NULL REFERENCES connected_sources(id) ON DELETE CASCADE,
    provider_event_id VARCHAR(255) NOT NULL,
    event_type VARCHAR(120) NOT NULL,
    payload_location TEXT,
    payload_hash VARCHAR(128) NOT NULL,
    received_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT raw_source_events_unique UNIQUE (source_id, provider_event_id)
);

CREATE TABLE contribution_events (
    id UUID PRIMARY KEY,
    project_id UUID NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
    source_id UUID NOT NULL REFERENCES connected_sources(id) ON DELETE CASCADE,
    user_id UUID REFERENCES users(id),
    external_user_ref VARCHAR(255) NOT NULL,
    timestamp_at TIMESTAMPTZ NOT NULL,
    event_type VARCHAR(32) NOT NULL CHECK (event_type IN ('DOC_EDIT', 'COMMIT', 'COMMENT')),
    raw_diff_location TEXT,
    char_delta_raw INTEGER NOT NULL DEFAULT 0,
    unique_content_delta INTEGER NOT NULL DEFAULT 0,
    category VARCHAR(32),
    time_bucket VARCHAR(16) NOT NULL CHECK (time_bucket IN ('EARLY', 'MIDDLE', 'LATE')),
    possibly_ai_generated BOOLEAN NOT NULL DEFAULT FALSE,
    flagged_duplicate BOOLEAN NOT NULL DEFAULT FALSE,
    file_or_section VARCHAR(500),
    provider_event_id VARCHAR(255) NOT NULL,
    CONSTRAINT contribution_events_unique UNIQUE (source_id, provider_event_id)
);

CREATE INDEX contribution_events_project_time_idx ON contribution_events(project_id, timestamp_at);
CREATE INDEX contribution_events_user_idx ON contribution_events(user_id);
