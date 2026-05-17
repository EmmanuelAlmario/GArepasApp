package com.garepas.garepasapp.dto.request;

import jakarta.validation.constraints.*;
import java.math.BigDecimal;

public record NominaRequest(

        @NotNull(message = "El id del empleado es obligatorio")
        Long empleadoId,

        @NotNull(message = "El monto es obligatorio")
        BigDecimal monto
) {}
