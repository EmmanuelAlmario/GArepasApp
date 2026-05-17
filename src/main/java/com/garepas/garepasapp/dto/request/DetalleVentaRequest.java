package com.garepas.garepasapp.dto.request;

import jakarta.validation.constraints.*;

import java.math.BigDecimal;

public record DetalleVentaRequest(

        @NotNull(message = "El id del producto es obligatorio")
        Long productoId,

        @NotNull(message = "La cantidad es obligatoria")
        @Min(value = 1, message = "La cantidad debe ser al menos 1")
        Integer cantidad,

        @NotNull(message = "El precio unitario es obligatorio")
        @DecimalMin(value = "0.0", inclusive = false, message = "El precio debe ser mayor a cero")
        BigDecimal precioUnitario
) {}
