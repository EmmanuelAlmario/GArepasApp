package com.garepas.garepasapp.dto.request;

import jakarta.validation.constraints.*;
import java.math.BigDecimal;

public record DetalleAjusteStockRequest(

        @NotNull(message = "El id del insumo es obligatorio")
        Long insumoId,

        @NotNull(message = "La cantidad es obligatoria")
        @DecimalMin(value = "0.0", inclusive = false, message = "La cantidad debe ser mayor a cero")
        BigDecimal cantidad
) {}
