package com.garepas.garepasapp.controller;

import com.garepas.garepasapp.dto.request.NominaRequest;
import com.garepas.garepasapp.dto.response.NominaResponse;
import com.garepas.garepasapp.service.NominaService;
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
@RequestMapping("/api/nomina")
@RequiredArgsConstructor
@Tag(name = "Nómina", description = "Gestión de nómina y deudas de empleados")
public class NominaController {

    private final NominaService nominaService;

    @GetMapping("/empleado/{empleadoId}")
    @Operation(summary = "Listar historial de nómina por empleado")
    public ResponseEntity<List<NominaResponse>> listarPorEmpleado(@PathVariable Long empleadoId) {
        return ResponseEntity.ok(nominaService.listarPorEmpleado(empleadoId));
    }

    @PostMapping
    @Operation(summary = "Registrar pago de nómina")
    public ResponseEntity<NominaResponse> registrar(@Valid @RequestBody NominaRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED).body(nominaService.registrar(request));
    }

    @PatchMapping("/empleado/{empleadoId}/deuda")
    @Operation(summary = "Modificar deuda del empleado")
    public ResponseEntity<NominaResponse> actualizarDeuda(
            @PathVariable Long empleadoId,
            @RequestParam BigDecimal ajuste) {
        return ResponseEntity.ok(nominaService.actualizarDeuda(empleadoId, ajuste));
    }
}
