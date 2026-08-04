package com.garepas.garepasapp.controller;

import com.garepas.garepasapp.dto.request.ProduccionRequest;
import com.garepas.garepasapp.dto.response.ProduccionResponse;
import com.garepas.garepasapp.service.ProduccionService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/producciones")
@RequiredArgsConstructor
@Tag(name = "Producciones", description = "Gestión de producciones")
public class ProduccionController {

    private final ProduccionService produccionService;

    @GetMapping
    @Operation(summary = "Listar todas las producciones")
    public ResponseEntity<List<ProduccionResponse>> listarTodas() {
        return ResponseEntity.ok(produccionService.listarTodas());
    }

    @GetMapping("/paginado")
    @Operation(summary = "Listar producciones paginadas")
    public ResponseEntity<Page<ProduccionResponse>> listarPaginado(Pageable pageable) {
        return ResponseEntity.ok(produccionService.listarPaginado(pageable));
    }

    @GetMapping("/{id}")
    @Operation(summary = "Buscar produccion por id")
    public ResponseEntity<ProduccionResponse> buscarPorId(@PathVariable Long id) {
        return ResponseEntity.ok(produccionService.buscarPorId(id));
    }

    @PostMapping
    @Operation(summary = "Registrar produccion")
    public ResponseEntity<ProduccionResponse> registrar(@Valid @RequestBody ProduccionRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED).body(produccionService.registrar(request));
    }

    @PatchMapping("/{id}/verificar")
    @Operation(summary = "Re-verificar stock de una produccion PENDIENTE y completarla si ya hay insumos suficientes")
    public ResponseEntity<ProduccionResponse> verificar(@PathVariable Long id) {
        return ResponseEntity.ok(produccionService.verificarYCompletar(id));
    }

    @DeleteMapping("/{id}")
    @Operation(summary = "Eliminar produccion")
    public ResponseEntity<Void> eliminar(@PathVariable Long id) {
        produccionService.eliminar(id);
        return ResponseEntity.noContent().build();
    }
}
