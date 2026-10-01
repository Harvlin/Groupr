CREATE TABLE score_calculations (
    id UUID PRIMARY KEY,
    project_id UUID NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
    calculation_version INTEGER NOT NULL,
    algorithm_version VARCHAR(64) NOT NULL,
    status VARCHAR(20) NOT NULL CHECK (status IN ('RUNNING', 'SUCCEEDED', 'FAILED')),
    started_at TIMESTAMPTZ NOT NULL,
    completed_at TIMESTAMPTZ,
    CONSTRAINT score_calculations_version_unique UNIQUE (project_id, calculation_version)
);

CREATE TABLE contribution_scores (
    id UUID PRIMARY KEY,
    calculation_id UUID NOT NULL REFERENCES score_calculations(id) ON DELETE CASCADE,
    project_id UUID NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES users(id),
    raw_score DOUBLE PRECISION NOT NULL,
    final_percentage DOUBLE PRECISION NOT NULL,
    confidence_level VARCHAR(16) NOT NULL CHECK (confidence_level IN ('HIGH', 'MEDIUM', 'LOW')),
    rationale JSONB NOT NULL,
    manual_override_percentage DOUBLE PRECISION,
    override_reason TEXT,
    computed_at TIMESTAMPTZ NOT NULL,
    CONSTRAINT contribution_scores_calculation_user_unique UNIQUE (calculation_id, user_id)
);

CREATE INDEX contribution_scores_project_idx ON contribution_scores(project_id, computed_at DESC);

CREATE TABLE score_overrides (
    id UUID PRIMARY KEY,
    score_id UUID NOT NULL REFERENCES contribution_scores(id) ON DELETE CASCADE,
    teacher_id UUID NOT NULL REFERENCES users(id),
    previous_percentage DOUBLE PRECISION NOT NULL,
    new_percentage DOUBLE PRECISION NOT NULL,
    reason TEXT NOT NULL,
    created_at TIMESTAMPTZ NOT NULL
);

CREATE TABLE score_audit_entries (
    id UUID PRIMARY KEY,
    project_id UUID NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
    action VARCHAR(80) NOT NULL,
    actor_id UUID REFERENCES users(id),
    entity_type VARCHAR(80) NOT NULL,
    entity_id UUID NOT NULL,
    before_json JSONB,
    after_json JSONB,
    created_at TIMESTAMPTZ NOT NULL
);

CREATE INDEX score_audit_project_idx ON score_audit_entries(project_id, created_at DESC);
