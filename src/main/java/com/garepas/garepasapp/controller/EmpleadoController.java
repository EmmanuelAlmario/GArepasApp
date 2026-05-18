package com.garepas.garepasapp.controller;

import com.garepas.garepasapp.dto.request.EmpleadoRequest;
import com.garepas.garepasapp.dto.response.EmpleadoResponse;
import com.garepas.garepasapp.service.EmpleadoService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/empleados")
@RequiredArgsConstructor
@Tag(name = "Empleados", description = "Gestión de empleados y nómina")
public class EmpleadoController {

    private final EmpleadoService empleadoService;

    @GetMapping
    @Operation(summary = "Listar todos los empleados")
    public ResponseEntity<List<EmpleadoResponse>> listarTodos() {
        return ResponseEntity.ok(empleadoService.listarTodos());
    }

    @GetMapping("/{id}")
    @Operation(summary = "Buscar empleado por id")
    public ResponseEntity<EmpleadoResponse> buscarPorId(@PathVariable Long id) {
        return ResponseEntity.ok(empleadoService.buscarPorId(id));
    }

    @PostMapping
    @Operation(summary = "Registrar empleado")
    public ResponseEntity<EmpleadoResponse> crear(@Valid @RequestBody EmpleadoRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED).body(empleadoService.crear(request));
    }

    @PutMapping("/{id}")
    @Operation(summary = "Modificar empleado")
    public ResponseEntity<EmpleadoResponse> actualizar(@PathVariable Long id, @Valid @RequestBody EmpleadoRequest request) {
        return ResponseEntity.ok(empleadoService.actualizar(id, request));
    }
}
