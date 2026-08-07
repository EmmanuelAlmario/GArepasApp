package com.garepas.garepasapp.security;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.test.util.ReflectionTestUtils;

import static org.assertj.core.api.Assertions.assertThat;

class JwtTokenProviderTest {

    private JwtTokenProvider provider;

    @BeforeEach
    void setUp() {
        provider = new JwtTokenProvider();
        ReflectionTestUtils.setField(provider, "secret",
                "secreto-de-test-para-jwt-suite-2026-mas-de-32-caracteres");
        ReflectionTestUtils.setField(provider, "expirationMs", 3600000L);
        provider.init();
    }

    @Test
    void generar_y_parsear_roundtrip() {
        String token = provider.generar("admin", "ADMIN");

        assertThat(token).isNotBlank();
        assertThat(provider.esValido(token)).isTrue();
        assertThat(provider.obtenerUsername(token)).isEqualTo("admin");
        assertThat(provider.obtenerRol(token)).isEqualTo("ADMIN");
    }

    @Test
    void secretosCortosSeRellenanA32Bytes() {
        ReflectionTestUtils.setField(provider, "secret", "corto");
        provider.init();

        String token = provider.generar("cajero", "VENTAS");
        assertThat(provider.esValido(token)).isTrue();
    }

    @Test
    void tokenModificado_esInvalido() {
        String token = provider.generar("admin", "ADMIN");
        String manipulado = token.substring(0, token.length() - 4) + "AAAA";
        assertThat(provider.esValido(manipulado)).isFalse();
    }

    @Test
    void tokenBasura_esInvalidoSinExcepcion() {
        assertThat(provider.esValido("no-es-un-token")).isFalse();
        assertThat(provider.esValido(null)).isFalse();
    }

    @Test
    void tokenExpirado_esInvalido() {
        ReflectionTestUtils.setField(provider, "expirationMs", -1L);
        provider.init();
        String token = provider.generar("admin", "ADMIN");
        assertThat(provider.esValido(token)).isFalse();
    }

    @Test
    void tokenDeOtroProveedor_esInvalido() {
        JwtTokenProvider otro = new JwtTokenProvider();
        ReflectionTestUtils.setField(otro, "secret",
                "otro-secreto-totalmente-distinto-de-la-suite-2026-largo");
        ReflectionTestUtils.setField(otro, "expirationMs", 3600000L);
        otro.init();

        String tokenDeOtro = otro.generar("hacker", "ADMIN");
        assertThat(provider.esValido(tokenDeOtro)).isFalse();
    }
}