package com.garepas.garepasapp.controller;

import com.garepas.garepasapp.dto.response.CostoProductoResponse;
import com.garepas.garepasapp.dto.response.CostoRecetaResponse;
import com.garepas.garepasapp.dto.response.SugerenciaPrecioResponse;
import com.garepas.garepasapp.service.CostoService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.math.BigDecimal;

@RestController
@RequestMapping("/api/costos")
@RequiredArgsConstructor
@Tag(name = "Costos", description = "Cálculo de costos de producción y sugerencia de precios")
public class CostoController {

    private final CostoService costoService;

    @GetMapping("/recetas/{id}")
    @Operation(summary = "Obtener costo total de una receta")
    public ResponseEntity<CostoRecetaResponse> costoReceta(@PathVariable Long id) {
        return ResponseEntity.ok(costoService.calcularCostoReceta(id));
    }

    @GetMapping("/productos/{id}")
    @Operation(summary = "Obtener costo unitario, margen y margen % de un producto")
    public ResponseEntity<CostoProductoResponse> costoProducto(@PathVariable Long id) {
        return ResponseEntity.ok(costoService.calcularCostoProducto(id));
    }

    @GetMapping("/productos/{id}/sugerir-precio")
    @Operation(summary = "Sugerir precio de venta según margen objetivo (ej. 0.4 = 40%)")
    public ResponseEntity<SugerenciaPrecioResponse> sugerirPrecio(
            @PathVariable Long id,
            @RequestParam(defaultValue = "0.40") BigDecimal margen) {
        return ResponseEntity.ok(costoService.sugerirPrecioVenta(id, margen));
    }
}
