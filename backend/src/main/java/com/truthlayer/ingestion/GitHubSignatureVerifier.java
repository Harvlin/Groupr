package com.truthlayer.ingestion;

import java.nio.charset.StandardCharsets;
import java.security.MessageDigest;
import javax.crypto.Mac;
import javax.crypto.spec.SecretKeySpec;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;

@Component
public class GitHubSignatureVerifier {
    private final String secret;
    public GitHubSignatureVerifier(@Value("${truthlayer.github.webhook-secret:}") String secret) { this.secret = secret; }
    public boolean verify(String signature, String payload) {
        if (secret.isBlank() || signature == null || !signature.startsWith("sha256=")) return false;
        try {
            var mac = Mac.getInstance("HmacSHA256");
            mac.init(new SecretKeySpec(secret.getBytes(StandardCharsets.UTF_8), "HmacSHA256"));
            var expected = "sha256=" + hex(mac.doFinal(payload.getBytes(StandardCharsets.UTF_8)));
            return MessageDigest.isEqual(expected.getBytes(StandardCharsets.UTF_8), signature.getBytes(StandardCharsets.UTF_8));
        } catch (Exception exception) { return false; }
    }
    private String hex(byte[] bytes) { var result = new StringBuilder(); for (byte value : bytes) result.append(String.format("%02x", value)); return result.toString(); }
}
