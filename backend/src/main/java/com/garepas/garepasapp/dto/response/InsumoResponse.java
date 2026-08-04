package com.garepas.garepasapp.dto.response;

import com.garepas.garepasapp.entity.Insumo;
import com.garepas.garepasapp.enums.UnidadMedida;
import java.math.BigDecimal;

public record InsumoResponse(
        Long id,
        String nombre,
        String categoria,
        String marca,
        BigDecimal stockActual,
        BigDecimal precioPorGramo,
        UnidadMedida unidadMedida,
        Boolean activo
) {
    public static InsumoResponse desde(Insumo insumo) {
        return new InsumoResponse(
                insumo.getId(),
                insumo.getNombre(),
                insumo.getCategoria(),
                insumo.getMarca(),
                insumo.getStockActual(),
                insumo.getPrecioPorGramo(),
                insumo.getUnidadMedida(),
                insumo.getActivo()
        );
    }
}
