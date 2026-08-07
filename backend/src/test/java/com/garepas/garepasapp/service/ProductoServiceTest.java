package com.garepas.garepasapp.service;

import com.garepas.garepasapp.dto.request.ProductoRequest;
import com.garepas.garepasapp.entity.Producto;
import com.garepas.garepasapp.entity.Receta;
import com.garepas.garepasapp.exception.OperacionInvalidaException;
import com.garepas.garepasapp.exception.RecursoDuplicadoException;
import com.garepas.garepasapp.exception.RecursoNoEncontradoException;
import com.garepas.garepasapp.repository.ProductoRepository;
import com.garepas.garepasapp.repository.RecetaRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.math.BigDecimal;
import java.util.Optional;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class ProductoServiceTest {

    @Mock private ProductoRepository productoRepository;
    @Mock private RecetaRepository recetaRepository;

    private ProductoService productoService;

    @BeforeEach
    void setUp() {
        productoService = new ProductoService(productoRepository, recetaRepository);
    }

    private ProductoRequest request() {
        return new ProductoRequest("Arepa dulce", 10, 2, new BigDecimal("2500"), null, true);
    }

    @Test
    void crear_nombreDuplicado_lanza() {
        when(productoRepository.existsByNombreIgnoreCase("Arepa dulce")).thenReturn(true);
        assertThatThrownBy(() -> productoService.crear(request()))
                .isInstanceOf(RecursoDuplicadoException.class);
    }

    @Test
    void crear_sinRecetaOmiteRecetaYStockPorDefectoCero() {
        when(productoRepository.existsByNombreIgnoreCase(any())).thenReturn(false);
        when(productoRepository.save(any(Producto.class))).thenAnswer(inv -> inv.getArgument(0));

        var resp = productoService.crear(new ProductoRequest("X", null, 0, new BigDecimal("1000"), null, true));

        verify(productoRepository).save(argThat(p -> p.getStockActual() == 0 && p.getReceta() == null));
    }

    @Test
    void crear_recetaInexistente_lanza() {
        when(productoRepository.existsByNombreIgnoreCase(any())).thenReturn(false);
        when(recetaRepository.findById(999L)).thenReturn(Optional.empty());

        assertThatThrownBy(() -> productoService.crear(
                new ProductoRequest("X", 1, 0, new BigDecimal("1000"), 999L, true)))
                .isInstanceOf(RecursoNoEncontradoException.class);
    }

    @Test
    void actualizar_actualizaLosCampos() {
        Producto producto = Producto.builder().id(1L).nombre("Viejo").stockActual(5).build();
        when(productoRepository.findById(1L)).thenReturn(Optional.of(producto));
        when(productoRepository.save(any(Producto.class))).thenAnswer(inv -> inv.getArgument(0));

        var resp = productoService.actualizar(1L, request());

        assertThat(resp.nombre()).isEqualTo("Arepa dulce");
        assertThat(producto.getStockActual()).isEqualTo(10);
        assertThat(producto.getPrecioVenta()).isEqualByComparingTo(new BigDecimal("2500"));
    }

    @Test
    void ajustarStock_deltaCero_lanza() {
        assertThatThrownBy(() -> productoService.ajustarStock(1L, 0, "x"))
                .isInstanceOf(OperacionInvalidaException.class);
    }

    @Test
    void ajustarStock_dejaNegativo_lanza() {
        when(productoRepository.findById(1L))
                .thenReturn(Optional.of(Producto.builder().id(1L).stockActual(2).build()));

        assertThatThrownBy(() -> productoService.ajustarStock(1L, -5, "merma"))
                .isInstanceOf(OperacionInvalidaException.class)
                .hasMessageContaining("negativo");
    }

    @Test
    void ajustarStock_okAplicaDelta() {
        Producto producto = Producto.builder().id(1L).stockActual(2).build();
        when(productoRepository.findById(1L)).thenReturn(Optional.of(producto));
        when(productoRepository.save(any(Producto.class))).thenAnswer(inv -> inv.getArgument(0));

        productoService.ajustarStock(1L, 3, "compra");

        assertThat(producto.getStockActual()).isEqualTo(5);
    }

    @Test
    void eliminar_inexistente_lanza() {
        when(productoRepository.existsById(any())).thenReturn(false);
        assertThatThrownBy(() -> productoService.eliminar(1L))
                .isInstanceOf(RecursoNoEncontradoException.class);
    }
}