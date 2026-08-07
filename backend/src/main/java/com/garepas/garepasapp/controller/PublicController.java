package com.garepas.garepasapp.controller;

import com.garepas.garepasapp.dto.response.ProductoPublicoResponse;
import com.garepas.garepasapp.service.ProductoService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/api/publico")
@RequiredArgsConstructor
@Tag(name = "Menú público", description = "Endpoints sin autenticación para el menú digital")
public class PublicController {

    private final ProductoService productoService;

    @GetMapping("/productos/activos")
    @Operation(summary = "Productos activos para el menú del cliente (sin autenticación)")
    public ResponseEntity<List<ProductoPublicoResponse>> menu() {
        return ResponseEntity.ok(productoService.listarMenuPublico());
    }
}