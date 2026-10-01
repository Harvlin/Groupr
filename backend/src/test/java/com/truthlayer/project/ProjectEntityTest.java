package com.truthlayer.project;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertNotNull;
import org.junit.jupiter.api.Test;
import java.util.UUID;

class ProjectEntityTest {
    @Test
    void newProjectStartsInSetupAndCanBeFinalized() {
        var project = new ProjectEntity("Research project", "History", "Description", UUID.randomUUID(), null);

        assertNotNull(project.getId());
        assertEquals(ProjectStatus.SETUP, project.getStatus());
        assertNotNull(project.getCreatedAt());

        project.finalizeProject();

        assertEquals(ProjectStatus.FINALISED, project.getStatus());
        assertNotNull(project.getFinalizedAt());
    }

    @Test
    void archiveChangesProjectLifecycleState() {
        var project = new ProjectEntity("Research project", null, null, UUID.randomUUID(), null);

        project.archive();

        assertEquals(ProjectStatus.ARCHIVED, project.getStatus());
    }
}
