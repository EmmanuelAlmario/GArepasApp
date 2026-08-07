package com.garepas.garepasapp.service;

import com.garepas.garepasapp.repository.AuditoriaRepository;
import com.garepas.garepasapp.repository.LoginIntentoRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;

/** Elimina registros antiguos de auditoría y de intentos de login para mantener la BD ligera. */
@Service
@RequiredArgsConstructor
@Slf4j
public class PurgaServicio {

    private final AuditoriaRepository auditoriaRepository;
    private final LoginIntentoRepository loginIntentoRepository;

    @Value("${app.auditoria.retencion-dias:90}")
    private int retencionAuditoriaDias;

    @Value("${app.auditoria.retencion-login-horas:24}")
    private int retencionLoginHoras;

    @Scheduled(cron = "${app.auditoria.cron:0 30 4 * * *}")
    @Transactional
    public void purgar() {
        LocalDateTime limiteAuditoria = LocalDateTime.now().minusDays(retencionAuditoriaDias);
        long auditorias = auditoriaRepository.deleteByFechaBefore(limiteAuditoria);

        LocalDateTime limiteLogin = LocalDateTime.now().minusHours(retencionLoginHoras);
        long intentos = loginIntentoRepository.deleteByFechaBefore(limiteLogin);

        if (auditorias > 0 || intentos > 0) {
            log.info("Purga automática: {} auditorías y {} intentos de login eliminados.", auditorias, intentos);
        }
    }
}