package com.garepas.garepasapp.service;

import com.garepas.garepasapp.entity.Auditoria;
import com.garepas.garepasapp.repository.AuditoriaRepository;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.data.domain.Page;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.argThat;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class AuditoriaServicioTest {

    @Mock private AuditoriaRepository auditoriaRepository;

    @Test
    void registrar_truncaDetalleAMax255() {
        AuditoriaServicio servicio = new AuditoriaServicio(auditoriaRepository);
        String largo = "x".repeat(1000);

        servicio.registrar("admin", "USUARIO_CREAR", largo);

        verify(auditoriaRepository).save(argThat(a ->
                a.getDetalle().length() == 255 &&
                "admin".equals(a.getUsuario()) &&
                "USUARIO_CREAR".equals(a.getAccion()) &&
                a.getFecha() != null));
    }

    @Test
    void registrar_usaSistemaCuandoNoHaySesion() {
        AuditoriaServicio servicio = new AuditoriaServicio(auditoriaRepository);
        servicio.registrar("LOGIN_FALLIDO", "boom");
        verify(auditoriaRepository).save(argThat(a -> "sistema".equals(a.getUsuario())));
    }

    @Test
    void porUsuario_delegaConLimiteAcotado() {
        AuditoriaServicio servicio = new AuditoriaServicio(auditoriaRepository);
        when(auditoriaRepository.findByUsuarioIgnoreCaseOrderByFechaDesc(any(), any())).thenReturn(Page.empty());

        servicio.porUsuario("Pepe", 5000);
        verify(auditoriaRepository).findByUsuarioIgnoreCaseOrderByFechaDesc(
                eq("Pepe"), argThat(pr -> pr.getPageSize() == 200));
    }

    @Test
    void registrar_nuncaRompeElFlujoPrincipal() {
        AuditoriaServicio servicio = new AuditoriaServicio(auditoriaRepository);
        doThrow(new RuntimeException("BD caída")).when(auditoriaRepository).save(any());
        servicio.registrar("x", "LOGIN", "");
        verify(auditoriaRepository).save(any());
    }
}