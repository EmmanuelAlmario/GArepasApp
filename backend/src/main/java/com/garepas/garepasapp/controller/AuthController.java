package com.garepas.garepasapp.controller;

import com.garepas.garepasapp.dto.request.LoginRequest;
import com.garepas.garepasapp.dto.response.AuthResponse;
import com.garepas.garepasapp.entity.Usuario;
import com.garepas.garepasapp.repository.UsuarioRepository;
import com.garepas.garepasapp.security.JwtTokenProvider;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/auth")
@RequiredArgsConstructor
@Tag(name = "Autenticación", description = "Login y emisión de token")
public class AuthController {

    private final AuthenticationManager authenticationManager;
    private final JwtTokenProvider tokenProvider;
    private final UsuarioRepository usuarioRepository;

    @PostMapping("/login")
    @Operation(summary = "Autenticar y obtener token JWT")
    public ResponseEntity<AuthResponse> login(@Valid @RequestBody LoginRequest request) {
        Authentication auth = authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(request.username(), request.password()));
        String username = auth.getName();
        Usuario usuario = usuarioRepository.findByUsernameIgnoreCase(username)
                .orElseThrow();
        String token = tokenProvider.generar(username, usuario.getRol().name());
        return ResponseEntity.ok(new AuthResponse(token, username, usuario.getRol().name()));
    }
}