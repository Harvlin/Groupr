package com.truthlayer.membership;

import static org.junit.jupiter.api.Assertions.assertEquals;
import java.time.Instant;
import java.util.UUID;
import org.junit.jupiter.api.Test;

class InvitationEntityTest {
    @Test
    void invitationTransitionsFromPendingToAccepted() {
        var invitation = new InvitationEntity(UUID.randomUUID(), "student@example.edu", MembershipRole.MEMBER, "hash", Instant.now().plusSeconds(3600));

        assertEquals("PENDING", invitation.getStatus());

        invitation.accept();

        assertEquals("ACCEPTED", invitation.getStatus());
    }

    @Test
    void invitationCanBeDeclined() {
        var invitation = new InvitationEntity(UUID.randomUUID(), "student@example.edu", MembershipRole.MEMBER, "hash", Instant.now().plusSeconds(3600));

        invitation.decline();

        assertEquals("DECLINED", invitation.getStatus());
    }
}
