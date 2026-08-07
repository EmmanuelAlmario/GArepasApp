package com.garepas.garepasapp.config;

import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.CommandLineRunner;
import org.springframework.stereotype.Component;

/**
 * Endurece la configuración en producción: si STRICT_SECRETS=true (default) y
 * se usan los valores por defecto para el secreto JWT o la contraseña del admin,
 * la aplicación NO arranca. Obliga a definir JWT_SECRET y ADMIN_PASSWORD.
 */
@Component
@Slf4j
public class ConfiguracionValidador implements CommandLineRunner {

    private static final String JWT_DEFAULT = "garepas-secret-cambiar-en-produccion-2026-minimo-32-bytes";
    private static final String ADMIN_DEFAULT = "admin123";

    @Value("${app.jwt.secret}")
    private String jwtSecret;

    @Value("${app.seed.admin-password}")
    private String adminPassword;

    @Value("${app.security.strict-secrets:true}")
    private boolean estricto;

    @Override
    public void run(String... args) {
        boolean jwtDefault = JWT_DEFAULT.equals(jwtSecret) || jwtSecret == null || jwtSecret.isBlank();
        boolean adminDefault = ADMIN_DEFAULT.equals(adminPassword) || adminPassword == null || adminPassword.isBlank();

        if (!estricto) {
            if (jwtDefault || adminDefault) {
                log.warn("SECURIDAD: se están usando valores por defecto (JWT/ADMIN). "
                        + "Define JWT_SECRET y ADMIN_PASSWORD. Para bloquear el arranque usa STRICT_SECRETS=true.");
            }
            return;
        }

        if (jwtDefault || adminDefault) {
            throw new IllegalStateException(
                    "FALLO DE SEGURIDAD: no se definieron secretos propios. "
                            + "Configura las variables JWT_SECRET (≥32 caracteres) y ADMIN_PASSWORD "
                            + "en Railway. Para desactivar este control define STRICT_SECRETS=false.");
        }
        log.info("Secretos JWT/ADMIN configurados correctamente.");
    }
}