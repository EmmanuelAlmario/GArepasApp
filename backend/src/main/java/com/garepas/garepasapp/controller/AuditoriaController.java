package com.garepas.garepasapp.controller;

import com.garepas.garepasapp.entity.Auditoria;
import com.garepas.garepasapp.service.AuditoriaServicio;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.format.DateTimeFormatter;
import java.util.List;

@RestController
@RequestMapping("/api/auditoria")
@RequiredArgsConstructor
@Tag(name = "Auditoría", description = "Registro de acciones críticas (solo administrador)")
public class AuditoriaController {

    private final AuditoriaServicio auditoriaServicio;
    private static final DateTimeFormatter FMT = DateTimeFormatter.ofPattern("yyyy-MM-dd HH:mm");

    @GetMapping
    @Operation(summary = "Últimas acciones auditadas (por defecto 100)")
    public ResponseEntity<List<Auditoria>> ultimas(
            @RequestParam(defaultValue = "100") int limite) {
        return ResponseEntity.ok(auditoriaServicio.ultimas(limite));
    }

    @GetMapping("/paginado")
    @Operation(summary = "Acciones auditadas paginadas")
    public ResponseEntity<Page<Auditoria>> paginado(Pageable pageable) {
        return ResponseEntity.ok(auditoriaServicio.paginar(pageable));
    }

    @GetMapping("/usuario/{username}")
    @Operation(summary = "Auditoría de un usuario específico")
    public ResponseEntity<List<Auditoria>> porUsuario(
            @PathVariable String username,
            @RequestParam(defaultValue = "100") int limite) {
        return ResponseEntity.ok(auditoriaServicio.porUsuario(username, limite));
    }

    @GetMapping("/usuario/{username}/paginado")
    @Operation(summary = "Auditoría de un usuario específico paginada")
    public ResponseEntity<Page<Auditoria>> porUsuarioPaginado(
            @PathVariable String username, Pageable pageable) {
        return ResponseEntity.ok(auditoriaServicio.porUsuarioPaginado(username, pageable));
    }
}