package com.garepas.garepasapp.dto.response;

import com.garepas.garepasapp.entity.DetalleProduccion;
import java.math.BigDecimal;

public record DetalleProduccionResponse(
        Long id,
        Long insumoId,
        String insumoNombre,
        BigDecimal cantidadRequerida,
        BigDecimal cantidadUsada,
        Boolean suficiente
) {
    public static DetalleProduccionResponse desde(DetalleProduccion detalle) {
        return new DetalleProduccionResponse(
                detalle.getId(),
                detalle.getInsumo().getId(),
                detalle.getInsumo().getNombre(),
                detalle.getCantidadRequerida(),
                detalle.getCantidadUsada(),
                detalle.getSuficiente()
        );
    }
}
