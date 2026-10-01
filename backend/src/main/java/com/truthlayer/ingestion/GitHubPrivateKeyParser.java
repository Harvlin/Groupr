package com.truthlayer.ingestion;

import java.io.ByteArrayOutputStream;
import java.security.KeyFactory;
import java.security.PrivateKey;
import java.security.spec.PKCS8EncodedKeySpec;
import java.util.Base64;
import java.util.HexFormat;

final class GitHubPrivateKeyParser {
    private GitHubPrivateKeyParser() {}

    static PrivateKey parse(String pem) {
        if (pem == null || pem.isBlank()) throw new IllegalStateException("GitHub App private key is not configured");
        var normalized = pem.replace("\\n", "\n").trim();
        var pkcs1 = normalized.contains("BEGIN RSA PRIVATE KEY");
        var body = normalized.replaceAll("-----BEGIN (RSA )?PRIVATE KEY-----", "").replaceAll("-----END (RSA )?PRIVATE KEY-----", "").replaceAll("\\s", "");
        var encoded = Base64.getDecoder().decode(body);
        try {
            if (pkcs1) encoded = pkcs1ToPkcs8(encoded);
            return KeyFactory.getInstance("RSA").generatePrivate(new PKCS8EncodedKeySpec(encoded));
        } catch (Exception exception) {
            throw new IllegalStateException("GitHub App private key could not be parsed", exception);
        }
    }

    private static byte[] pkcs1ToPkcs8(byte[] key) throws Exception {
        var algorithm = sequence(oid("2A864886F70D010101"), bytes(0x05, 0x00));
        return sequence(bytes(0x02, 0x01, 0x00), algorithm, bytes(0x04, key));
    }

    private static byte[] oid(String hex) { return bytes(0x06, HexFormat.of().parseHex(hex)); }
    private static byte[] sequence(byte[]... values) { return bytes(0x30, concat(values)); }
    private static byte[] bytes(int tag, int... values) { var result = new byte[values.length]; for (var i = 0; i < values.length; i++) result[i] = (byte) values[i]; return bytes(tag, result); }
    private static byte[] bytes(int tag, byte[] value) { try { var output = new ByteArrayOutputStream(); output.write(tag); writeLength(output, value.length); output.write(value); return output.toByteArray(); } catch (Exception exception) { throw new IllegalStateException(exception); } }
    private static byte[] concat(byte[]... values) { var length = 0; for (var value : values) length += value.length; var result = new byte[length]; var offset = 0; for (var value : values) { System.arraycopy(value, 0, result, offset, value.length); offset += value.length; } return result; }
    private static void writeLength(ByteArrayOutputStream output, int length) { if (length < 128) { output.write(length); return; } var bytes = Integer.toHexString(length).length() / 2 + Integer.toHexString(length).length() % 2; output.write(0x80 | bytes); for (var shift = (bytes - 1) * 8; shift >= 0; shift -= 8) output.write((length >> shift) & 0xff); }
}
