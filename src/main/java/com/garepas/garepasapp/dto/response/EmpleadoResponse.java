package com.garepas.garepasapp.dto.response;

import com.garepas.garepasapp.entity.Empleado;

public record EmpleadoResponse(
        Long id,
        String nombre,
        Boolean activo
) {
    public static EmpleadoResponse desde(Empleado empleado) {
        return new EmpleadoResponse(
                empleado.getId(),
                empleado.getNombre(),
                empleado.getActivo()
        );
    }
}
