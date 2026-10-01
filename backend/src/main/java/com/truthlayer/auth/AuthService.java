package com.truthlayer.auth;

import com.truthlayer.user.UserEntity;
import com.truthlayer.user.UserRepository;
import com.truthlayer.user.UserRole;
import java.time.Instant;
import java.time.temporal.ChronoUnit;
import java.util.Locale;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.oauth2.jose.jws.MacAlgorithm;
import org.springframework.security.oauth2.jwt.JwsHeader;
import org.springframework.security.oauth2.jwt.JwtClaimsSet;
import org.springframework.security.oauth2.jwt.JwtEncoder;
import org.springframework.security.oauth2.jwt.JwtEncoderParameters;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class AuthService {
    private final UserRepository users;
    private final PasswordEncoder passwordEncoder;
    private final JwtEncoder jwtEncoder;
    private final long tokenHours;

    public AuthService(UserRepository users, PasswordEncoder passwordEncoder, JwtEncoder jwtEncoder,
                       @Value("${truthlayer.security.token-hours}") long tokenHours) {
        this.users = users;
        this.passwordEncoder = passwordEncoder;
        this.jwtEncoder = jwtEncoder;
        this.tokenHours = tokenHours;
    }

    @Transactional
    public AuthDtos.AuthResponse register(AuthDtos.RegisterRequest request) {
        var email = request.email().trim().toLowerCase(Locale.ROOT);
        if (users.existsByEmailIgnoreCase(email)) {
            throw new IllegalArgumentException("An account with this email already exists");
        }
        var role = parseRole(request.role());
        var user = new UserEntity(email, request.name().trim(), passwordEncoder.encode(request.password()), role);
        users.save(user);
        return response(user);
    }

    @Transactional(readOnly = true)
    public AuthDtos.AuthResponse login(AuthDtos.LoginRequest request) {
        var user = users.findByEmailIgnoreCase(request.email().trim())
            .orElseThrow(() -> new BadCredentialsException("Invalid email or password"));
        if (!passwordEncoder.matches(request.password(), user.getPasswordHash()) || !"ACTIVE".equals(user.getStatus())) {
            throw new BadCredentialsException("Invalid email or password");
        }
        return response(user);
    }

    private AuthDtos.AuthResponse response(UserEntity user) {
        var now = Instant.now();
        var claims = JwtClaimsSet.builder()
            .issuer("truth-layer")
            .issuedAt(now)
            .expiresAt(now.plus(tokenHours, ChronoUnit.HOURS))
            .subject(user.getId().toString())
            .claim("email", user.getEmail())
            .claim("role", user.getRole().name())
            .build();
        var token = jwtEncoder.encode(JwtEncoderParameters.from(JwsHeader.with(MacAlgorithm.HS256).build(), claims)).getTokenValue();
        return new AuthDtos.AuthResponse(token, user.getId(), user.getDisplayName(), user.getEmail(),
            user.getRole().name().toLowerCase(Locale.ROOT), user.getSchool(), user.getGrade(), initials(user.getDisplayName()), user.getCreatedAt());
    }

    private UserRole parseRole(String value) {
        if (value == null || value.isBlank()) return UserRole.STUDENT;
        try {
            return UserRole.valueOf(value.trim().toUpperCase(Locale.ROOT));
        } catch (IllegalArgumentException exception) {
            throw new IllegalArgumentException("Role must be student or teacher");
        }
    }

    private String initials(String name) {
        var parts = name.trim().split("\\s+");
        var result = new StringBuilder();
        for (var i = 0; i < Math.min(parts.length, 2); i++) result.append(parts[i].charAt(0));
        return result.toString().toUpperCase(Locale.ROOT);
    }
}
