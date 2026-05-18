package com.garepas.garepasapp.controller;

import com.garepas.garepasapp.dto.request.InsumoRequest;
import com.garepas.garepasapp.dto.response.InsumoResponse;
import com.garepas.garepasapp.service.InsumoService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/insumos")
@RequiredArgsConstructor
@Tag(name = "Insumos", description = "Gestión de insumos del inventario")
public class InsumoController {

    private final InsumoService insumoService;

    @GetMapping
    @Operation(summary = "Listar todos los insumos")
    public ResponseEntity<List<InsumoResponse>> listarTodos() {
        return ResponseEntity.ok(insumoService.listarTodos());
    }

    @GetMapping("/activos")
    @Operation(summary = "Listar insumos activos")
    public ResponseEntity<List<InsumoResponse>> listarActivos() {
        return ResponseEntity.ok(insumoService.listarActivos());
    }

    @GetMapping("/{id}")
    @Operation(summary = "Buscar insumo por id")
    public ResponseEntity<InsumoResponse> buscarPorId(@PathVariable Long id) {
        return ResponseEntity.ok(insumoService.buscarPorId(id));
    }

    @PostMapping
    @Operation(summary = "Agregar insumo")
    public ResponseEntity<InsumoResponse> crear(@Valid @RequestBody InsumoRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED).body(insumoService.crear(request));
    }

    @PutMapping("/{id}")
    @Operation(summary = "Modificar insumo")
    public ResponseEntity<InsumoResponse> actualizar(@PathVariable Long id, @Valid @RequestBody InsumoRequest request) {
        return ResponseEntity.ok(insumoService.actualizar(id, request));
    }

    @DeleteMapping("/{id}")
    @Operation(summary = "Eliminar insumo")
    public ResponseEntity<Void> eliminar(@PathVariable Long id) {
        insumoService.eliminar(id);
        return ResponseEntity.noContent().build();
    }
}
