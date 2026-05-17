package com.garepas.garepasapp.dto.response;

import com.garepas.garepasapp.entity.DetalleReceta;
import com.garepas.garepasapp.enums.UnidadMedida;
import java.math.BigDecimal;

public record DetalleRecetaResponse(
        Long id,
        Long insumoId,
        String insumoNombre,
        BigDecimal cantidad,
        UnidadMedida unidadMedida
) {
    public static DetalleRecetaResponse desde(DetalleReceta detalle) {
        return new DetalleRecetaResponse(
                detalle.getId(),
                detalle.getInsumo().getId(),
                detalle.getInsumo().getNombre(),
                detalle.getCantidad(),
                detalle.getUnidadMedida()
        );
    }
}
