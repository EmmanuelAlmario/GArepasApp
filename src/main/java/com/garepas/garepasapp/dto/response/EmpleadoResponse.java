package com.garepas.garepasapp.dto.response;

import com.garepas.garepasapp.entity.Empleado;
import java.math.BigDecimal;

public record EmpleadoResponse(
        Long id,
        String nombre,
        BigDecimal precioDia,
        Integer diasTrabajados,
        Integer diasPagados,
        Integer diasDebidos,
        BigDecimal deudaTotal,
        Boolean activo
) {
    public static EmpleadoResponse desde(Empleado empleado, Integer diasPagados) {
        int debidos = empleado.getDiasTrabajados() - diasPagados;
        BigDecimal deuda = empleado.getPrecioDia().multiply(BigDecimal.valueOf(Math.max(debidos, 0)));
        return new EmpleadoResponse(
                empleado.getId(),
                empleado.getNombre(),
                empleado.getPrecioDia(),
                empleado.getDiasTrabajados(),
                diasPagados,
                Math.max(debidos, 0),
                deuda,
                empleado.getActivo()
        );
    }
}