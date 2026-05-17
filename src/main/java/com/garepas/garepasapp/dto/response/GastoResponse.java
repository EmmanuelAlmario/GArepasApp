package com.garepas.garepasapp.dto.response;

import com.garepas.garepasapp.entity.Gasto;
import java.math.BigDecimal;
import java.time.LocalDateTime;

public record GastoResponse(
        Long id,
        String descripcion,
        BigDecimal monto,
        String categoria,
        LocalDateTime fecha
) {
    public static GastoResponse desde(Gasto gasto) {
        return new GastoResponse(
                gasto.getId(),
                gasto.getDescripcion(),
                gasto.getMonto(),
                gasto.getCategoria(),
                gasto.getFecha()
        );
    }
}
