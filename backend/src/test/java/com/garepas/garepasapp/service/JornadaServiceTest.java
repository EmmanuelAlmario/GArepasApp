package com.garepas.garepasapp.service;

import com.garepas.garepasapp.entity.Jornada;
import com.garepas.garepasapp.entity.Venta;
import com.garepas.garepasapp.exception.OperacionInvalidaException;
import com.garepas.garepasapp.exception.RecursoNoEncontradoException;
import com.garepas.garepasapp.repository.JornadaRepository;
import com.garepas.garepasapp.repository.VentaRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.math.BigDecimal;
import java.util.List;
import java.util.Optional;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class JornadaServiceTest {

    @Mock private JornadaRepository jornadaRepository;
    @Mock private VentaRepository ventaRepository;

    private JornadaService jornadaService;

    @BeforeEach
    void setUp() {
        jornadaService = new JornadaService(jornadaRepository, ventaRepository);
    }

    @Test
    void abrir_cuandoYaHayJornadaActiva_lanza() {
        when(jornadaRepository.findFirstByActivaTrueOrderByFechaAperturaDesc())
                .thenReturn(Optional.of(Jornada.builder().id(5L).activa(true).build()));

        assertThatThrownBy(() -> jornadaService.abrir("admin"))
                .isInstanceOf(OperacionInvalidaException.class)
                .hasMessageContaining("jornada abierta");
    }

    @Test
    void abrir_exitosoCreaJornadaConActor() {
        when(jornadaRepository.findFirstByActivaTrueOrderByFechaAperturaDesc()).thenReturn(Optional.empty());
        when(jornadaRepository.save(any(Jornada.class))).thenAnswer(inv -> inv.getArgument(0));

        var resp = jornadaService.abrir("admin");

        verify(jornadaRepository).save(argThat(j ->
                Boolean.TRUE.equals(j.getActiva()) &&
                "admin".equals(j.getAbiertaPor()) &&
                j.getFechaApertura() != null));
        assertThat(resp.activa()).isTrue();
    }

    @Test
    void cerrar_yaCerrada_lanza() {
        Jornada cerrada = Jornada.builder().id(1L).activa(false).build();
        when(jornadaRepository.findById(1L)).thenReturn(Optional.of(cerrada));

        assertThatThrownBy(() -> jornadaService.cerrar(1L))
                .isInstanceOf(OperacionInvalidaException.class)
                .hasMessageContaining("cerrada");
    }

    @Test
    void cerrar_exitosoMarcaInactivaYFechaCierre() {
        Jornada activa = Jornada.builder().id(1L).activa(true).build();
        when(jornadaRepository.findById(1L)).thenReturn(Optional.of(activa));
        when(jornadaRepository.save(any(Jornada.class))).thenAnswer(inv -> inv.getArgument(0));

        jornadaService.cerrar(1L);

        assertThat(activa.getActiva()).isFalse();
        assertThat(activa.getFechaCierre()).isNotNull();
    }

    @Test
    void cerrar_inexistente_lanza() {
        when(jornadaRepository.findById(any())).thenReturn(Optional.empty());
        assertThatThrownBy(() -> jornadaService.cerrar(1L))
                .isInstanceOf(RecursoNoEncontradoException.class);
    }

    @Test
    void arqueo_sumaSoloVentasDeLaJornada() {
        Jornada jornada = Jornada.builder().id(7L).activa(true).build();
        when(jornadaRepository.findFirstByActivaTrueOrderByFechaAperturaDesc())
                .thenReturn(Optional.of(jornada));
        when(ventaRepository.findAllByOrderByFechaDesc()).thenReturn(List.of(
                Venta.builder().id(1L).jornadaId(7L).total(new BigDecimal("4000")).build(),
                Venta.builder().id(2L).jornadaId(7L).total(new BigDecimal("2500")).build(),
                Venta.builder().id(3L).jornadaId(99L).total(new BigDecimal("90000")).build()));

        var resp = jornadaService.activa();

        assertThat(resp.id()).isEqualTo(7L);
        assertThat(resp.nroVentas()).isEqualTo(2);
        assertThat(resp.totalVentas()).isEqualByComparingTo(new BigDecimal("6500"));
    }
}