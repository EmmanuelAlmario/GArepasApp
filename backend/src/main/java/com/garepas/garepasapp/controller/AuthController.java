package com.garepas.garepasapp.controller;

import com.garepas.garepasapp.dto.request.LoginRequest;
import com.garepas.garepasapp.dto.response.AuthResponse;
import com.garepas.garepasapp.entity.Usuario;
import com.garepas.garepasapp.exception.OperacionInvalidaException;
import com.garepas.garepasapp.repository.UsuarioRepository;
import com.garepas.garepasapp.security.JwtTokenProvider;
import com.garepas.garepasapp.service.AuditoriaServicio;
import com.garepas.garepasapp.service.LoginIntentoServicio;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.AuthenticationException;
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
    private final LoginIntentoServicio loginIntentoServicio;
    private final AuditoriaServicio auditoriaServicio;

    @PostMapping("/login")
    @Operation(summary = "Autenticar y obtener token JWT")
    public ResponseEntity<AuthResponse> login(
            @Valid @RequestBody LoginRequest request,
            HttpServletRequest httpRequest) {

        if (loginIntentoServicio.estaBloqueado(request.username())) {
            throw new OperacionInvalidaException(
                    "Demasiados intentos fallidos. Espera 15 minutos e inténtalo de nuevo.");
        }

        String ip = ipCliente(httpRequest);
        try {
            Authentication auth = authenticationManager.authenticate(
                    new UsernamePasswordAuthenticationToken(request.username(), request.password()));
            String username = auth.getName();
            Usuario usuario = usuarioRepository.findByUsernameIgnoreCase(username)
                    .orElseThrow();
            String token = tokenProvider.generar(username, usuario.getRol().name());
            loginIntentoServicio.registrarExitoso(username);
            auditoriaServicio.registrar(username, "LOGIN", "Inicio de sesión exitoso");
            return ResponseEntity.ok(new AuthResponse(token, username, usuario.getRol().name()));
        } catch (AuthenticationException ex) {
            loginIntentoServicio.registrarFallido(request.username(), ip);
            auditoriaServicio.registrar("sistema", "LOGIN_FALLIDO", "Intento fallido de " + request.username() + " (" + ip + ")");
            throw ex;
        }
    }

    private String ipCliente(HttpServletRequest request) {
        String fwd = request.getHeader("X-Forwarded-For");
        if (fwd != null && !fwd.isBlank()) {
            return fwd.split(",")[0].trim();
        }
        return request.getRemoteAddr();
    }
}