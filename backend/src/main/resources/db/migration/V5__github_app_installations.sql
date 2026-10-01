CREATE TABLE github_installations (
    id UUID PRIMARY KEY,
    installation_id BIGINT NOT NULL UNIQUE,
    project_id UUID REFERENCES projects(id) ON DELETE SET NULL,
    connected_by UUID NOT NULL REFERENCES users(id),
    account_id BIGINT,
    account_login VARCHAR(255),
    status VARCHAR(20) NOT NULL DEFAULT 'ACTIVE' CHECK (status IN ('ACTIVE', 'SUSPENDED', 'DELETED')),
    created_at TIMESTAMPTZ NOT NULL,
    updated_at TIMESTAMPTZ NOT NULL
);

CREATE INDEX github_installations_project_idx ON github_installations(project_id);

CREATE TABLE github_oauth_states (
    id UUID PRIMARY KEY,
    state_hash VARCHAR(128) NOT NULL UNIQUE,
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    project_id UUID NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
    expires_at TIMESTAMPTZ NOT NULL,
    consumed_at TIMESTAMPTZ
);

CREATE TABLE github_webhook_deliveries (
    id UUID PRIMARY KEY,
    delivery_id VARCHAR(255) NOT NULL UNIQUE,
    event_type VARCHAR(120) NOT NULL,
    received_at TIMESTAMPTZ NOT NULL
);

ALTER TABLE connected_sources ADD COLUMN installation_id BIGINT;
CREATE INDEX connected_sources_installation_idx ON connected_sources(installation_id);
