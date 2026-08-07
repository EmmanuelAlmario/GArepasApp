package com.garepas.garepasapp.config;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.test.util.ReflectionTestUtils;

import static org.assertj.core.api.Assertions.assertThatCode;
import static org.assertj.core.api.Assertions.assertThatThrownBy;

class ConfiguracionValidadorTest {

    private static final String JWT_DEFAULT =
            "garepas-secret-cambiar-en-produccion-2026-minimo-32-bytes";

    private ConfiguracionValidador validador;

    @BeforeEach
    void setUp() {
        validador = new ConfiguracionValidador();
    }

    @Test
    void enModoEstricto_secretosPorDefecto_lanzanExcepcion() {
        ReflectionTestUtils.setField(validador, "jwtSecret", JWT_DEFAULT);
        ReflectionTestUtils.setField(validador, "adminPassword", "admin123");
        ReflectionTestUtils.setField(validador, "estricto", true);

        assertThatThrownBy(() -> validador.run())
                .isInstanceOf(IllegalStateException.class)
                .hasMessageContaining("secretos propios");
    }

    @Test
    void enModoEstricto_secretosNulos_lanzan() {
        ReflectionTestUtils.setField(validador, "jwtSecret", null);
        ReflectionTestUtils.setField(validador, "adminPassword", "  ");
        ReflectionTestUtils.setField(validador, "estricto", true);

        assertThatThrownBy(() -> validador.run())
                .isInstanceOf(IllegalStateException.class);
    }

    @Test
    void enModoEstricto_secretosPropios_noLanzan() {
        ReflectionTestUtils.setField(validador, "jwtSecret", "mi-propio-secreto-largo-y-dificil-2026");
        ReflectionTestUtils.setField(validador, "adminPassword", "s3cr3t0!");
        ReflectionTestUtils.setField(validador, "estricto", true);

        assertThatCode(() -> validador.run()).doesNotThrowAnyException();
    }

    @Test
    void enModoNoEstricto_conSecretosPorDefecto_noLanza() {
        ReflectionTestUtils.setField(validador, "jwtSecret", JWT_DEFAULT);
        ReflectionTestUtils.setField(validador, "adminPassword", "admin123");
        ReflectionTestUtils.setField(validador, "estricto", false);

        assertThatCode(() -> validador.run()).doesNotThrowAnyException();
    }

    @Test
    void enModoEstricto_secretoJwtCorto_lanza() {
        ReflectionTestUtils.setField(validador, "jwtSecret", "corto");
        ReflectionTestUtils.setField(validador, "adminPassword", "clave-larga-segura");
        ReflectionTestUtils.setField(validador, "estricto", true);

        assertThatThrownBy(() -> validador.run())
                .isInstanceOf(IllegalStateException.class)
                .hasMessageContaining("JWT_SECRET");
    }

    @Test
    void enModoEstricto_secretoDe32BytesJustos_noLanza() {
        ReflectionTestUtils.setField(validador, "jwtSecret",
                "01234567890123456789012345678901");
        ReflectionTestUtils.setField(validador, "adminPassword", "clave-segura-2026");
        ReflectionTestUtils.setField(validador, "estricto", true);

        assertThatCode(() -> validador.run()).doesNotThrowAnyException();
    }
}