package com.garepas.garepasapp.service;

import com.garepas.garepasapp.dto.request.DetalleVentaRequest;
import com.garepas.garepasapp.dto.request.VentaRequest;
import com.garepas.garepasapp.entity.DetalleVenta;
import com.garepas.garepasapp.entity.Producto;
import com.garepas.garepasapp.entity.Venta;
import com.garepas.garepasapp.exception.OperacionInvalidaException;
import com.garepas.garepasapp.exception.RecursoNoEncontradoException;
import com.garepas.garepasapp.repository.JornadaRepository;
import com.garepas.garepasapp.repository.ProductoRepository;
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
import static org.mockito.ArgumentMatchers.anyLong;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class VentaServiceTest {

    @Mock private VentaRepository ventaRepository;
    @Mock private ProductoRepository productoRepository;
    @Mock private JornadaRepository jornadaRepository;

    private VentaService ventaService;

    @BeforeEach
    void setUp() {
        ventaService = new VentaService(ventaRepository, productoRepository, jornadaRepository);
    }

    private Producto productoConStock(int stock) {
        return Producto.builder()
                .id(1L)
                .nombre("Arepa de huevo")
                .stockActual(stock)
                .precioVenta(new BigDecimal("3000"))
                .activo(true)
                .build();
    }

    private VentaRequest request(int cantidad) {
        return new VentaRequest("Cliente X", List.of(new DetalleVentaRequest(1L, cantidad)));
    }

    @Test
    void registrar_descuentaStockYCalculaTotalDesdePrecioDelServidor() {
        Producto producto = productoCon(100);
        when(productoRepository.findByIdConLock(1L)).thenReturn(Optional.of(producto));
        when(jornadaRepository.findFirstByActivaTrueOrderByFechaAperturaDesc()).thenReturn(Optional.empty());
        when(ventaRepository.save(any(Venta.class))).thenAnswer(inv -> inv.getArgument(0));

        ventaService.registrar(request(2));

        assertThat(producto.getStockActual()).isEqualTo(98);
        verify(ventaRepository).save(argThat(v ->
                v.getTotal().compareTo(new BigDecimal("6000")) == 0 &&
                v.getDetalles().size() == 1 &&
                v.getDetalles().get(0).getPrecioUnitario().compareTo(new BigDecimal("3000")) == 0 &&
                v.getDetalles().get(0).getSubtotal().compareTo(new BigDecimal("6000")) == 0));
    }

    @Test
    void registrar_sinDetalles_lanzaError() {
        assertThatThrownBy(() -> ventaService.registrar(new VentaRequest("X", List.of())))
                .isInstanceOf(OperacionInvalidaException.class)
                .hasMessageContaining("al menos un detalle");
    }

    @Test
    void registrar_productoNoActivo_lanza() {
        Producto producto = productoCon(10);
        producto.setActivo(false);
        when(productoRepository.findByIdConLock(1L)).thenReturn(Optional.of(producto));

        assertThatThrownBy(() -> ventaService.registrar(request(1)))
                .isInstanceOf(OperacionInvalidaException.class)
                .hasMessageContaining("no está activo");
    }

    @Test
    void registrar_stockInsuficiente_lanzaYNoDescuenta() {
        Producto producto = productoCon(3);
        when(productoRepository.findByIdConLock(1L)).thenReturn(Optional.of(producto));

        assertThatThrownBy(() -> ventaService.registrar(request(4)))
                .isInstanceOf(OperacionInvalidaException.class)
                .hasMessageContaining("Stock insuficiente");
        assertThat(producto.getStockActual()).isEqualTo(3);
    }

    @Test
    void registrar_productoInexistente_lanzaNoEncontrado() {
        when(productoRepository.findByIdConLock(anyLong())).thenReturn(Optional.empty());

        assertThatThrownBy(() -> ventaService.registrar(request(1)))
                .isInstanceOf(RecursoNoEncontradoException.class);
    }

    @Test
    void eliminar_vuelveAIncrementarElStock() {
        Producto producto = productoCon(5);
        DetalleVenta detalle = DetalleVenta.builder().producto(producto).cantidad(2).build();
        Venta venta = Venta.builder().id(9L).detalles(List.of(detalle)).build();
        when(ventaRepository.findById(9L)).thenReturn(Optional.of(venta));
        when(productoRepository.findByIdConLock(1L)).thenReturn(Optional.of(producto));

        ventaService.eliminar(9L);

        assertThat(producto.getStockActual()).isEqualTo(7);
        verify(ventaRepository).deleteById(9L);
    }

    @Test
    void eliminar_ventaInexistente_lanza() {
        when(ventaRepository.findById(anyLong())).thenReturn(Optional.empty());
        assertThatThrownBy(() -> ventaService.eliminar(1L))
                .isInstanceOf(RecursoNoEncontradoException.class);
    }

    @Test
    void buscarPorId_inexistente_lanza() {
        when(ventaRepository.findById(anyLong())).thenReturn(Optional.empty());
        assertThatThrownBy(() -> ventaService.buscarPorId(1L))
                .isInstanceOf(RecursoNoEncontradoException.class);
    }

    private Producto productoCon(int stock) {
        return productoCon(stock, true);
    }

    private Producto productoCon(int stock, boolean activo) {
        Producto p = Producto.builder()
                .id(1L)
                .nombre("Arepa de huevo")
                .stockActual(stock)
                .precioVenta(new BigDecimal("3000"))
                .activo(activo)
                .build();
        return p;
    }
}