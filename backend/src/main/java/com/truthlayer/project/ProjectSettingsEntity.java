package com.truthlayer.project;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.Id;
import jakarta.persistence.Table;
import org.hibernate.annotations.JdbcTypeCode;
import org.hibernate.type.SqlTypes;
import java.util.UUID;

@Entity
@Table(name = "project_settings")
public class ProjectSettingsEntity {
    public enum Distribution { EQUAL, CUSTOM }

    @Id
    @Column(name = "project_id")
    private UUID projectId;

    @Enumerated(EnumType.STRING)
    @Column(name = "expected_distribution", nullable = false)
    private Distribution expectedDistribution;

    @Column(name = "custom_distribution", columnDefinition = "jsonb")
    @JdbcTypeCode(SqlTypes.JSON)
    private String customDistribution;

    @Column(nullable = false, length = 8)
    private String language;

    @Column(name = "allow_offline_log", nullable = false)
    private boolean allowOfflineLog;

    @Column(name = "auto_warn_threshold", nullable = false)
    private int autoWarnThreshold;

    protected ProjectSettingsEntity() {}

    public ProjectSettingsEntity(UUID projectId) {
        this.projectId = projectId;
        this.expectedDistribution = Distribution.EQUAL;
        this.language = "en";
        this.allowOfflineLog = true;
        this.autoWarnThreshold = 15;
    }

    public UUID getProjectId() { return projectId; }
    public Distribution getExpectedDistribution() { return expectedDistribution; }
    public String getCustomDistribution() { return customDistribution; }
    public String getLanguage() { return language; }
    public boolean isAllowOfflineLog() { return allowOfflineLog; }
    public int getAutoWarnThreshold() { return autoWarnThreshold; }

    public void update(Distribution distribution, String customDistribution, String language, boolean allowOfflineLog, int threshold) {
        this.expectedDistribution = distribution;
        this.customDistribution = customDistribution;
        this.language = language;
        this.allowOfflineLog = allowOfflineLog;
        this.autoWarnThreshold = threshold;
    }
}
