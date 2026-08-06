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
        BigDecimal stockMinimo,
        Boolean stockBajo,
        BigDecimal precioPorGramo,
        UnidadMedida unidadMedida,
        Boolean activo
) {
    public static InsumoResponse desde(Insumo insumo) {
        BigDecimal min = insumo.getStockMinimo();
        boolean bajo = min != null && insumo.getStockActual().compareTo(min) < 0;
        return new InsumoResponse(
                insumo.getId(),
                insumo.getNombre(),
                insumo.getCategoria(),
                insumo.getMarca(),
                insumo.getStockActual(),
                min,
                bajo,
                insumo.getPrecioPorGramo(),
                insumo.getUnidadMedida(),
                insumo.getActivo()
        );
    }
}