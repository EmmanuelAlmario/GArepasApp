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

    @PostConstruct
    void init() {
        byte[] bytes = secret == null
                ? new byte[32]
                : secret.getBytes(StandardCharsets.UTF_8);
        this.key = Keys.hmacShaKeyFor(bytes);
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