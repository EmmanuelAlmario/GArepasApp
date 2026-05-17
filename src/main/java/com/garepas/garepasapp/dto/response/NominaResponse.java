package com.garepas.garepasapp.dto.response;

import com.garepas.garepasapp.entity.Nomina;
import java.math.BigDecimal;
import java.time.LocalDateTime;

public record NominaResponse(
        Long id,
        Long empleadoId,
        String empleadoNombre,
        BigDecimal monto,
        LocalDateTime fecha,
        BigDecimal deudaAcumulada
) {
    public static NominaResponse desde(Nomina nomina) {
        return new NominaResponse(
                nomina.getId(),
                nomina.getEmpleado().getId(),
                nomina.getEmpleado().getNombre(),
                nomina.getMonto(),
                nomina.getFecha(),
                nomina.getDeudaAcumulada()
        );
    }
}
