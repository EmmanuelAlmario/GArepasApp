package com.garepas.garepasapp.service;

import com.garepas.garepasapp.dto.request.ProduccionRequest;
import com.garepas.garepasapp.dto.response.ProduccionResponse;
import com.garepas.garepasapp.entity.*;
import com.garepas.garepasapp.exception.OperacionInvalidaException;
import com.garepas.garepasapp.exception.RecursoNoEncontradoException;
import com.garepas.garepasapp.repository.InsumoRepository;
import com.garepas.garepasapp.repository.ProduccionRepository;
import com.garepas.garepasapp.repository.ProductoRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@Service
@RequiredArgsConstructor
public class ProduccionService {

    private final ProduccionRepository produccionRepository;
    private final ProductoRepository productoRepository;
    private final InsumoRepository insumoRepository;

    @Transactional(readOnly = true)
    public List<ProduccionResponse> listarTodas() {
        return produccionRepository.findAll()
                .stream()
                .map(ProduccionResponse::desde)
                .toList();
    }

    @Transactional(readOnly = true)
    public ProduccionResponse buscarPorId(Long id) {
        return produccionRepository.findById(id)
                .map(ProduccionResponse::desde)
                .orElseThrow(() -> new RecursoNoEncontradoException("Produccion", id));
    }

    @Transactional
    public ProduccionResponse registrar(ProduccionRequest request) {
        Producto producto = productoRepository.findById(request.productoId())
                .orElseThrow(() -> new RecursoNoEncontradoException("Producto", request.productoId()));

        if (producto.getReceta() == null) {
            throw new OperacionInvalidaException("El producto '" + producto.getNombre() + "' no tiene una receta asignada");
        }

        Produccion produccion = Produccion.builder()
                .producto(producto)
                .cantidad(request.cantidad())
                .fecha(LocalDateTime.now())
                .build();

        // UC23 - Calcular insumos requeridos para la produccion
        List<DetalleProduccion> detalles = new ArrayList<>();
        List<String> alertas = new ArrayList<>();

        for (DetalleReceta detalleReceta : producto.getReceta().getDetalles()) {
            Insumo insumo = detalleReceta.getInsumo();
            BigDecimal cantidadRequerida = detalleReceta.getCantidad()
                    .multiply(BigDecimal.valueOf(request.cantidad()));

            boolean suficiente = insumo.getStockActual().compareTo(cantidadRequerida) >= 0;

            // UC24 - Alertar si faltan insumos
            if (!suficiente) {
                alertas.add("Insumo '" + insumo.getNombre() + "': requerido " + cantidadRequerida +
                        ", disponible " + insumo.getStockActual());
            }

            detalles.add(DetalleProduccion.builder()
                    .produccion(produccion)
                    .insumo(insumo)
                    .cantidadRequerida(cantidadRequerida)
                    .cantidadUsada(suficiente ? cantidadRequerida : insumo.getStockActual())
                    .suficiente(suficiente)
                    .build());
        }

        if (!alertas.isEmpty()) {
            throw new OperacionInvalidaException("Stock insuficiente para registrar la producción. " +
                    String.join(" | ", alertas));
        }

        // Descontar stock de insumos
        detalles.forEach(detalle -> {
            Insumo insumo = detalle.getInsumo();
            insumo.setStockActual(insumo.getStockActual().subtract(detalle.getCantidadRequerida()));
            insumoRepository.save(insumo);
        });

        // Aumentar stock del producto
        producto.setStockActual(producto.getStockActual() + request.cantidad());
        productoRepository.save(producto);

        produccion.setDetalles(detalles);
        return ProduccionResponse.desde(produccionRepository.save(produccion));
    }

    @Transactional
    public void eliminar(Long id) {
        Produccion produccion = produccionRepository.findById(id)
                .orElseThrow(() -> new RecursoNoEncontradoException("Produccion", id));

        // Revertir stock de insumos
        produccion.getDetalles().forEach(detalle -> {
            Insumo insumo = detalle.getInsumo();
            insumo.setStockActual(insumo.getStockActual().add(detalle.getCantidadUsada()));
            insumoRepository.save(insumo);
        });

        // Revertir stock del producto
        Producto producto = produccion.getProducto();
        producto.setStockActual(producto.getStockActual() - produccion.getCantidad());
        productoRepository.save(producto);

        produccionRepository.deleteById(id);
    }
}
