package com.garepas.garepasapp.controller;

import com.garepas.garepasapp.dto.response.JornadaResponse;
import com.garepas.garepasapp.service.JornadaService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/jornadas")
@RequiredArgsConstructor
@Tag(name = "Jornadas", description = "Días/turnos de operación activados manualmente")
public class JornadaController {

    private final JornadaService jornadaService;

    @GetMapping("/activa")
    @Operation(summary = "Devuelve la jornada activa (o null)")
    public ResponseEntity<JornadaResponse> activa() {
        return ResponseEntity.ok(jornadaService.activa());
    }

    @GetMapping
    @Operation(summary = "Historial de jornadas")
    public ResponseEntity<List<JornadaResponse>> historial() {
        return ResponseEntity.ok(jornadaService.historial());
    }

    @PostMapping
    @Operation(summary = "Abrir una nueva jornada")
    public ResponseEntity<JornadaResponse> abrir(Authentication auth) {
        String usuario = auth instanceof Authentication a && a.getName() != null ? a.getName() : null;
        return ResponseEntity.status(HttpStatus.CREATED).body(jornadaService.abrir(usuario));
    }

    @PostMapping("/{id}/cerrar")
    @Operation(summary = "Cerrar una jornada y devolver su arqueo")
    public ResponseEntity<JornadaResponse> cerrar(@PathVariable Long id) {
        return ResponseEntity.ok(jornadaService.cerrar(id));
    }
}