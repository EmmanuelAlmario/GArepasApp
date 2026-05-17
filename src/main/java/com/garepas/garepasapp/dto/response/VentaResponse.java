package com.garepas.garepasapp.dto.response;

import com.garepas.garepasapp.entity.Venta;
import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;

public record VentaResponse(
        Long id,
        LocalDateTime fecha,
        BigDecimal total,
        List<DetalleVentaResponse> detalles
) {
    public static VentaResponse desde(Venta venta) {
        return new VentaResponse(
                venta.getId(),
                venta.getFecha(),
                venta.getTotal(),
                venta.getDetalles().stream()
                        .map(DetalleVentaResponse::desde)
                        .toList()
        );
    }
}
