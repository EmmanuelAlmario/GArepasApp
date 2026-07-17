package com.garepas.garepasapp.controller;

import com.garepas.garepasapp.dto.request.ProductoRequest;
import com.garepas.garepasapp.dto.response.CostoProductoResponse;
import com.garepas.garepasapp.dto.response.ProductoResponse;
import com.garepas.garepasapp.dto.response.SugerenciaPrecioResponse;
import com.garepas.garepasapp.service.CostoService;
import com.garepas.garepasapp.service.ProductoService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.math.BigDecimal;
import java.util.List;

@RestController
@RequestMapping("/api/productos")
@RequiredArgsConstructor
@Tag(name = "Productos", description = "Gestión de productos del inventario")
public class ProductoController {

    private final ProductoService productoService;
    private final CostoService costoService;

    @GetMapping
    @Operation(summary = "Listar todos los productos")
    public ResponseEntity<List<ProductoResponse>> listarTodos() {
        return ResponseEntity.ok(productoService.listarTodos());
    }

    @GetMapping("/activos")
    @Operation(summary = "Listar productos activos")
    public ResponseEntity<List<ProductoResponse>> listarActivos() {
        return ResponseEntity.ok(productoService.listarActivos());
    }

    @GetMapping("/{id}")
    @Operation(summary = "Buscar producto por id")
    public ResponseEntity<ProductoResponse> buscarPorId(@PathVariable Long id) {
        return ResponseEntity.ok(productoService.buscarPorId(id));
    }

    @GetMapping("/{id}/costo")
    @Operation(summary = "Obtener costo unitario y margen de un producto")
    public ResponseEntity<CostoProductoResponse> costo(@PathVariable Long id) {
        return ResponseEntity.ok(costoService.calcularCostoProducto(id));
    }

    @PostMapping("/{id}/sugerir-precio")
    @Operation(summary = "Sugerir precio según margen objetivo (0.4 = 40%)")
    public ResponseEntity<SugerenciaPrecioResponse> sugerirPrecio(
            @PathVariable Long id,
            @RequestParam(defaultValue = "0.40") BigDecimal margen) {
        return ResponseEntity.ok(costoService.sugerirPrecioVenta(id, margen));
    }

    @PostMapping
    @Operation(summary = "Agregar producto")
    public ResponseEntity<ProductoResponse> crear(@Valid @RequestBody ProductoRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED).body(productoService.crear(request));
    }

    @PutMapping("/{id}")
    @Operation(summary = "Modificar producto")
    public ResponseEntity<ProductoResponse> actualizar(@PathVariable Long id, @Valid @RequestBody ProductoRequest request) {
        return ResponseEntity.ok(productoService.actualizar(id, request));
    }

    @PatchMapping("/{id}/ajustar-stock")
    @Operation(summary = "Ajustar stock manualmente (delta positivo o negativo)")
    public ResponseEntity<ProductoResponse> ajustarStock(
            @PathVariable Long id,
            @RequestParam Integer delta,
            @RequestParam(required = false) String motivo) {
        return ResponseEntity.ok(productoService.ajustarStock(id, delta, motivo));
    }

    @DeleteMapping("/{id}")
    @Operation(summary = "Eliminar producto")
    public ResponseEntity<Void> eliminar(@PathVariable Long id) {
        productoService.eliminar(id);
        return ResponseEntity.noContent().build();
    }
}
