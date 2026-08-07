package com.garepas.garepasapp.controller;

import com.garepas.garepasapp.dto.request.UsuarioRequest;
import com.garepas.garepasapp.dto.response.UsuarioResponse;
import com.garepas.garepasapp.service.AuditoriaServicio;
import com.garepas.garepasapp.service.UsuarioService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/usuarios")
@RequiredArgsConstructor
@Tag(name = "Usuarios", description = "Gestión de usuarios (solo administrador)")
public class UsuarioController {

    private final UsuarioService usuarioService;
    private final AuditoriaServicio auditoriaServicio;

    @GetMapping
    @Operation(summary = "Listar usuarios")
    public ResponseEntity<List<UsuarioResponse>> listar() {
        return ResponseEntity.ok(usuarioService.listar());
    }

    @PostMapping
    @Operation(summary = "Crear usuario")
    public ResponseEntity<UsuarioResponse> crear(@Valid @RequestBody UsuarioRequest request) {
        UsuarioResponse creado = usuarioService.crear(request);
        auditoriaServicio.registrar("USUARIO_CREAR", "Usuario " + creado.username() + " (" + creado.rol() + ")");
        return ResponseEntity.status(HttpStatus.CREATED).body(creado);
    }

    @PutMapping("/{id}")
    @Operation(summary = "Modificar usuario (nombre, rol, contraseña, estado)")
    public ResponseEntity<UsuarioResponse> actualizar(
            @PathVariable Long id,
            @Valid @RequestBody UsuarioRequest request) {
        UsuarioResponse actualizado = usuarioService.actualizar(id, request);
        auditoriaServicio.registrar("USUARIO_ACTUALIZAR",
                "Usuario " + actualizado.username() + " -> rol " + actualizado.rol()
                        + ", activo " + actualizado.activo());
        return ResponseEntity.ok(actualizado);
    }

    @DeleteMapping("/{id}")
    @Operation(summary = "Eliminar usuario")
    public ResponseEntity<Void> eliminar(@PathVariable Long id) {
        usuarioService.eliminar(id);
        auditoriaServicio.registrar("USUARIO_ELIMINAR", "Eliminado usuario id " + id);
        return ResponseEntity.noContent().build();
    }
}