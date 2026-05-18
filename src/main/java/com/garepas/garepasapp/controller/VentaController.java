package com.garepas.garepasapp.controller;

import com.garepas.garepasapp.dto.request.VentaRequest;
import com.garepas.garepasapp.dto.response.VentaResponse;
import com.garepas.garepasapp.service.VentaService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/ventas")
@RequiredArgsConstructor
@Tag(name = "Ventas", description = "Gestión de ventas")
public class VentaController {

    private final VentaService ventaService;

    @GetMapping
    @Operation(summary = "Listar todas las ventas")
    public ResponseEntity<List<VentaResponse>> listarTodas() {
        return ResponseEntity.ok(ventaService.listarTodas());
    }

    @GetMapping("/{id}")
    @Operation(summary = "Buscar venta por id")
    public ResponseEntity<VentaResponse> buscarPorId(@PathVariable Long id) {
        return ResponseEntity.ok(ventaService.buscarPorId(id));
    }

    @PostMapping
    @Operation(summary = "Registrar venta")
    public ResponseEntity<VentaResponse> registrar(@Valid @RequestBody VentaRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED).body(ventaService.registrar(request));
    }

    @DeleteMapping("/{id}")
    @Operation(summary = "Eliminar venta")
    public ResponseEntity<Void> eliminar(@PathVariable Long id) {
        ventaService.eliminar(id);
        return ResponseEntity.noContent().build();
    }
}
