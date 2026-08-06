package com.garepas.garepasapp.security;

import io.jsonwebtoken.Claims;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.security.Keys;
import jakarta.annotation.PostConstruct;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;

import javax.crypto.SecretKey;
import java.nio.charset.StandardCharsets;
import java.util.Date;

@Component
public class JwtTokenProvider {

    @Value("${app.jwt.secret}")
    private String secret;

    @Value("${app.jwt.expiration-ms}")
    private long expirationMs;

    private SecretKey key;

    private static final int MIN_SECRET_BYTES = 32;

    @PostConstruct
    void init() {
        byte[] bytes = normalizeSecret(secret);
        this.key = Keys.hmacShaKeyFor(bytes);
    }

    private byte[] normalizeSecret(String raw) {
        if (raw == null || raw.isBlank()) {
            raw = "garepas-default-secret-reemplazar-en-produccion-2026-32bytes";
        }
        byte[] trimmed = raw.trim().getBytes(StandardCharsets.UTF_8);
        if (trimmed.length >= MIN_SECRET_BYTES) {
            return trimmed;
        }
        byte[] padded = new byte[MIN_SECRET_BYTES];
        for (int i = 0; i < padded.length; i++) {
            padded[i] = trimmed[i % trimmed.length];
        }
        return padded;
    }

    public String generar(String username, String rol) {
        Date ahora = new Date();
        Date expiracion = new Date(ahora.getTime() + expirationMs);
        return Jwts.builder()
                .subject(username)
                .claim("rol", rol)
                .issuedAt(ahora)
                .expiration(expiracion)
                .signWith(key)
                .compact();
    }

    public String obtenerUsername(String token) {
        return claims(token).getSubject();
    }

    public String obtenerRol(String token) {
        Object rol = claims(token).get("rol");
        return rol != null ? rol.toString() : null;
    }

    public boolean esValido(String token) {
        try {
            claims(token);
            return true;
        } catch (Exception ex) {
            return false;
        }
    }

    private Claims claims(String token) {
        return Jwts.parser()
                .verifyWith(key)
                .build()
                .parseSignedClaims(token)
                .getPayload();
    }
}