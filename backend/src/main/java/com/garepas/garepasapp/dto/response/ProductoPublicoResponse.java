package com.garepas.garepasapp.dto.response;

import com.garepas.garepasapp.entity.Producto;
import java.math.BigDecimal;

/** Datos mínimos y públicos de un producto para el menú digital del cliente. */
public record ProductoPublicoResponse(
        Long id,
        String nombre,
        BigDecimal precioVenta,
        Integer stockActual
) {
    public static ProductoPublicoResponse desde(Producto producto) {
        return new ProductoPublicoResponse(
                producto.getId(),
                producto.getNombre(),
                producto.getPrecioVenta(),
                producto.getStockActual()
        );
    }
}