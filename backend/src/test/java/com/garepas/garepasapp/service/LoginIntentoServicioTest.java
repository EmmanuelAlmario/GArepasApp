package com.garepas.garepasapp.service;

import com.garepas.garepasapp.repository.LoginIntentoRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.ArgumentMatchers.anyString;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class LoginIntentoServicioTest {

    @Mock private LoginIntentoRepository loginIntentoRepository;

    private LoginIntentoServicio servicio;

    @BeforeEach
    void setUp() {
        servicio = new LoginIntentoServicio(loginIntentoRepository);
    }

    @Test
    void estaBloqueado_conNullOBlanco_retornaFalse() {
        assertThat(servicio.estaBloqueado(null)).isFalse();
        assertThat(servicio.estaBloqueado("  ")).isFalse();
    }

    @Test
    void estaBloqueado_conCincoFallidos_retornaTrue() {
        when(loginIntentoRepository.countByUsernameAndExitosoFalseAndFechaAfterIgnoreCase(anyString(), any()))
                .thenReturn(5L);
        assertThat(servicio.estaBloqueado("cajero")).isTrue();
    }

    @Test
    void estaBloqueado_conCuatroFallidos_retornaFalse() {
        when(loginIntentoRepository.countByUsernameAndExitosoFalseAndFechaAfterIgnoreCase(anyString(), any()))
                .thenReturn(4L);
        assertThat(servicio.estaBloqueado("cajero")).isFalse();
    }

    @Test
    void estaBloqueado_trimmeaElUsername() {
        servicio.estaBloqueado("  cajero  ");
        org.mockito.Mockito.verify(loginIntentoRepository)
                .countByUsernameAndExitosoFalseAndFechaAfterIgnoreCase(eq("cajero"), any());
    }

    @Test
    void registrarFallido_guardaLasDosVariantes() {
        servicio.registrarFallido("  cajero ", "10.0.0.1");
        org.mockito.Mockito.verify(loginIntentoRepository)
                .save(org.mockito.ArgumentMatchers.argThat(i ->
                        "cajero".equals(i.getUsername()) &&
                        "10.0.0.1".equals(i.getIp()) &&
                        Boolean.FALSE.equals(i.getExitoso()) &&
                        i.getFecha() != null));
    }

    @Test
    void registrarExitoso_limpiaIntentosPrevios() {
        servicio.registrarExitoso("cajero");
        org.mockito.Mockito.verify(loginIntentoRepository).deleteByUsernameIgnoreCase("cajero");
    }
}