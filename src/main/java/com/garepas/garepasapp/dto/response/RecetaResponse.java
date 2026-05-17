package com.garepas.garepasapp.dto.response;

import com.garepas.garepasapp.entity.Receta;
import java.util.List;

public record RecetaResponse(
        Long id,
        String nombre,
        String descripcion,
        List<DetalleRecetaResponse> detalles
) {
    public static RecetaResponse desde(Receta receta) {
        return new RecetaResponse(
                receta.getId(),
                receta.getNombre(),
                receta.getDescripcion(),
                receta.getDetalles().stream()
                        .map(DetalleRecetaResponse::desde)
                        .toList()
        );
    }
}
