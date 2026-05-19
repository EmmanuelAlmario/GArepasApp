package com.garepas.garepasapp.dto.response;

import com.garepas.garepasapp.entity.Nomina;
import java.time.LocalDateTime;

public record NominaResponse(
        Long id,
        Long empleadoId,
        String empleadoNombre,
        Integer diasPagados,
        LocalDateTime fecha
) {
    public static NominaResponse desde(Nomina nomina) {
        return new NominaResponse(
                nomina.getId(),
                nomina.getEmpleado().getId(),
                nomina.getEmpleado().getNombre(),
                nomina.getDiasPagados(),
                nomina.getFecha()
        );
    }
}