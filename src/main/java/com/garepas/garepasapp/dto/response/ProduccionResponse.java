package com.garepas.garepasapp.dto.response;

import com.garepas.garepasapp.entity.Produccion;
import java.time.LocalDateTime;
import java.util.List;

public record ProduccionResponse(
        Long id,
        Long productoId,
        String productoNombre,
        Integer cantidad,
        LocalDateTime fecha,
        List<DetalleProduccionResponse> detalles
) {
    public static ProduccionResponse desde(Produccion produccion) {
        return new ProduccionResponse(
                produccion.getId(),
                produccion.getProducto().getId(),
                produccion.getProducto().getNombre(),
                produccion.getCantidad(),
                produccion.getFecha(),
                produccion.getDetalles().stream()
                        .map(DetalleProduccionResponse::desde)
                        .toList()
        );
    }
}
