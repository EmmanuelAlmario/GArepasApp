package com.garepas.garepasapp.dto.request;

import jakarta.validation.constraints.*;

public record NominaRequest(

        @NotNull(message = "El id del empleado es obligatorio")
        Long empleadoId,

        @NotNull(message = "Los días pagados son obligatorios")
        @Min(value = 1, message = "Debe pagar al menos 1 día")
        Integer diasPagados
) {}