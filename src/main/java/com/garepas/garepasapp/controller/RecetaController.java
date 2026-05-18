package com.garepas.garepasapp.controller;

import com.garepas.garepasapp.dto.request.RecetaRequest;
import com.garepas.garepasapp.dto.response.RecetaResponse;
import com.garepas.garepasapp.service.RecetaService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/recetas")
@RequiredArgsConstructor
@Tag(name = "Recetas", description = "Gestión de recetas de productos")
public class RecetaController {

    private final RecetaService recetaService;

    @GetMapping
    @Operation(summary = "Listar todas las recetas")
    public ResponseEntity<List<RecetaResponse>> listarTodas() {
        return ResponseEntity.ok(recetaService.listarTodas());
    }

    @GetMapping("/{id}")
    @Operation(summary = "Buscar receta por id")
    public ResponseEntity<RecetaResponse> buscarPorId(@PathVariable Long id) {
        return ResponseEntity.ok(recetaService.buscarPorId(id));
    }

    @PostMapping
    @Operation(summary = "Agregar receta")
    public ResponseEntity<RecetaResponse> crear(@Valid @RequestBody RecetaRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED).body(recetaService.crear(request));
    }

    @PutMapping("/{id}")
    @Operation(summary = "Modificar receta")
    public ResponseEntity<RecetaResponse> actualizar(@PathVariable Long id, @Valid @RequestBody RecetaRequest request) {
        return ResponseEntity.ok(recetaService.actualizar(id, request));
    }

    @DeleteMapping("/{id}")
    @Operation(summary = "Eliminar receta")
    public ResponseEntity<Void> eliminar(@PathVariable Long id) {
        recetaService.eliminar(id);
        return ResponseEntity.noContent().build();
    }
}
