package com.garepas.garepasapp.dto.response;

import com.garepas.garepasapp.entity.Producto;
import java.math.BigDecimal;

public record ProductoResponse(
        Long id,
        String nombre,
        Integer stockActual,
        BigDecimal precioVenta,
        Long recetaId,
        String recetaNombre,
        Boolean activo
) {
    public static ProductoResponse desde(Producto producto) {
        return new ProductoResponse(
                producto.getId(),
                producto.getNombre(),
                producto.getStockActual(),
                producto.getPrecioVenta(),
                producto.getReceta() != null ? producto.getReceta().getId() : null,
                producto.getReceta() != null ? producto.getReceta().getNombre() : null,
                producto.getActivo()
        );
    }
}
