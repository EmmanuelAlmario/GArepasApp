package com.garepas.garepasapp.dto.request;

import jakarta.validation.Valid;
import jakarta.validation.constraints.*;
import java.util.List;

public record VentaRequest(

        @NotEmpty(message = "La venta debe tener al menos un producto")
        @Valid
        List<DetalleVentaRequest> detalles
) {}
