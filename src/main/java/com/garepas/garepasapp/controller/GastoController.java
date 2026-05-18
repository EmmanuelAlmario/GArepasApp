package com.garepas.garepasapp.controller;

import com.garepas.garepasapp.dto.request.GastoRequest;
import com.garepas.garepasapp.dto.response.GastoResponse;
import com.garepas.garepasapp.service.GastoService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/gastos")
@RequiredArgsConstructor
@Tag(name = "Gastos", description = "Gestión de gastos")
public class GastoController {

    private final GastoService gastoService;

    @GetMapping
    @Operation(summary = "Listar todos los gastos")
    public ResponseEntity<List<GastoResponse>> listarTodos() {
        return ResponseEntity.ok(gastoService.listarTodos());
    }

    @GetMapping("/{id}")
    @Operation(summary = "Buscar gasto por id")
    public ResponseEntity<GastoResponse> buscarPorId(@PathVariable Long id) {
        return ResponseEntity.ok(gastoService.buscarPorId(id));
    }

    @PostMapping
    @Operation(summary = "Registrar gasto")
    public ResponseEntity<GastoResponse> registrar(@Valid @RequestBody GastoRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED).body(gastoService.registrar(request));
    }

    @PutMapping("/{id}")
    @Operation(summary = "Modificar gasto")
    public ResponseEntity<GastoResponse> actualizar(@PathVariable Long id, @Valid @RequestBody GastoRequest request) {
        return ResponseEntity.ok(gastoService.actualizar(id, request));
    }

    @DeleteMapping("/{id}")
    @Operation(summary = "Eliminar gasto")
    public ResponseEntity<Void> eliminar(@PathVariable Long id) {
        gastoService.eliminar(id);
        return ResponseEntity.noContent().build();
    }
}
