package com.garepas.garepasapp.service;

import com.garepas.garepasapp.entity.LoginIntento;
import com.garepas.garepasapp.repository.LoginIntentoRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;

/** Bloquea cuentas tras 5 intentos fallidos de login en 15 minutos (protección fuerza bruta). */
@Service
@RequiredArgsConstructor
public class LoginIntentoServicio {

    public static final int MAX_FALLIDOS = 5;
    public static final int VENTANA_MINUTOS = 15;

    private final LoginIntentoRepository loginIntentoRepository;

    @Transactional(readOnly = true)
    public boolean estaBloqueado(String username) {
        if (username == null || username.isBlank()) return false;
        LocalDateTime desde = LocalDateTime.now().minusMinutes(VENTANA_MINUTOS);
        return loginIntentoRepository
                .countByUsernameAndExitosoFalseAndFechaAfterIgnoreCase(username.trim(), desde) >= MAX_FALLIDOS;
    }

    @Transactional
    public void registrarFallido(String username, String ip) {
        loginIntentoRepository.save(LoginIntento.builder()
                .username(username == null ? "" : username.trim())
                .ip(ip)
                .fecha(LocalDateTime.now())
                .exitoso(Boolean.FALSE)
                .build());
    }

    @Transactional
    public void registrarExitoso(String username) {
        if (username != null && !username.isBlank()) {
            loginIntentoRepository.deleteByUsernameIgnoreCase(username.trim());
        }
    }
}