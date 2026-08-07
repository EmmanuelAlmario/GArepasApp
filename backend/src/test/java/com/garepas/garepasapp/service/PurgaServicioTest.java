package com.garepas.garepasapp.service;

import com.garepas.garepasapp.repository.AuditoriaRepository;
import com.garepas.garepasapp.repository.LoginIntentoRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.test.util.ReflectionTestUtils;

import java.time.LocalDateTime;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.argThat;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class PurgaServicioTest {

    @Mock private AuditoriaRepository auditoriaRepository;
    @Mock private LoginIntentoRepository loginIntentoRepository;

    private PurgaServicio purgaServicio;

    @BeforeEach
    void setUp() {
        purgaServicio = new PurgaServicio(auditoriaRepository, loginIntentoRepository);
        ReflectionTestUtils.setField(purgaServicio, "retencionAuditoriaDias", 90);
        ReflectionTestUtils.setField(purgaServicio, "retencionLoginHoras", 24);
    }

@Test
    void purgar_borraAuditoriasDeMasDe90DiasEIntentosDeMasDe24Horas() {
        when(auditoriaRepository.deleteByFechaBefore(any())).thenReturn(10L);
        when(loginIntentoRepository.deleteByFechaBefore(any())).thenReturn(3L);

        purgaServicio.purgar();

        verify(auditoriaRepository).deleteByFechaBefore(argThat(f ->
                f.isBefore(LocalDateTime.now().minusMinutes(1))));
        verify(loginIntentoRepository).deleteByFechaBefore(argThat(f ->
                f.isBefore(LocalDateTime.now().minusMinutes(1))));
    }
}