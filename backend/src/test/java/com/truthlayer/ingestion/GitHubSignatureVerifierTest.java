package com.truthlayer.ingestion;

import static org.junit.jupiter.api.Assertions.assertFalse;
import static org.junit.jupiter.api.Assertions.assertTrue;
import java.nio.charset.StandardCharsets;
import javax.crypto.Mac;
import javax.crypto.spec.SecretKeySpec;
import org.junit.jupiter.api.Test;

class GitHubSignatureVerifierTest {
    @Test
    void acceptsSignatureCreatedWithConfiguredSecret() throws Exception {
        var payload = "{\"ref\":\"refs/heads/main\"}";
        var secret = "test-secret";
        var mac = Mac.getInstance("HmacSHA256");
        mac.init(new SecretKeySpec(secret.getBytes(StandardCharsets.UTF_8), "HmacSHA256"));
        var signature = "sha256=" + java.util.HexFormat.of().formatHex(mac.doFinal(payload.getBytes(StandardCharsets.UTF_8)));

        var verifier = new GitHubSignatureVerifier(secret);

        assertTrue(verifier.verify(signature, payload));
        assertFalse(verifier.verify("sha256=invalid", payload));
    }
}
