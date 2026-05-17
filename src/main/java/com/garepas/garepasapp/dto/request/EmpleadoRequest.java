package com.garepas.garepasapp.dto.request;

import jakarta.validation.constraints.*;

public record EmpleadoRequest(

        @NotBlank(message = "El nombre es obligatorio")
        @Size(max = 60, message = "El nombre no puede superar 60 caracteres")
        String nombre,

        @NotNull(message = "El estado activo es obligatorio")
        Boolean activo
) {}
