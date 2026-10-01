package com.truthlayer.common;

import java.nio.ByteBuffer;
import java.util.Base64;
import javax.crypto.Cipher;
import javax.crypto.spec.GCMParameterSpec;
import javax.crypto.spec.SecretKeySpec;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

@Service
public class TokenEncryptionService {
    private final byte[] key;
    public TokenEncryptionService(@Value("${truthlayer.security.token-encryption-key:}") String encodedKey) { if (encodedKey.isBlank()) throw new IllegalStateException("TOKEN_ENCRYPTION_KEY is required for OAuth credentials"); this.key = Base64.getDecoder().decode(encodedKey); if (key.length != 32) throw new IllegalStateException("TOKEN_ENCRYPTION_KEY must decode to 32 bytes"); }
    public String encrypt(String value) { try { var iv = new byte[12]; java.security.SecureRandom.getInstanceStrong().nextBytes(iv); var cipher = Cipher.getInstance("AES/GCM/NoPadding"); cipher.init(Cipher.ENCRYPT_MODE, new SecretKeySpec(key, "AES"), new GCMParameterSpec(128, iv)); var encrypted = cipher.doFinal(value.getBytes(java.nio.charset.StandardCharsets.UTF_8)); return Base64.getEncoder().encodeToString(ByteBuffer.allocate(iv.length + encrypted.length).put(iv).put(encrypted).array()); } catch (Exception exception) { throw new IllegalStateException("Credential encryption failed", exception); } }
    public String decrypt(String value) { try { var all = Base64.getDecoder().decode(value); var iv = java.util.Arrays.copyOfRange(all, 0, 12); var encrypted = java.util.Arrays.copyOfRange(all, 12, all.length); var cipher = Cipher.getInstance("AES/GCM/NoPadding"); cipher.init(Cipher.DECRYPT_MODE, new SecretKeySpec(key, "AES"), new GCMParameterSpec(128, iv)); return new String(cipher.doFinal(encrypted), java.nio.charset.StandardCharsets.UTF_8); } catch (Exception exception) { throw new IllegalStateException("Credential decryption failed", exception); } }
}
