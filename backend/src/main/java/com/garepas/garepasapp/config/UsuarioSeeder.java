package com.garepas.garepasapp.config;

import com.garepas.garepasapp.entity.Usuario;
import com.garepas.garepasapp.enums.Rol;
import com.garepas.garepasapp.repository.UsuarioRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.CommandLineRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;

@Component
@RequiredArgsConstructor
@Slf4j
public class UsuarioSeeder implements CommandLineRunner {

    private final UsuarioRepository usuarioRepository;
    private final PasswordEncoder passwordEncoder;

    @Value("${app.seed.admin-password:admin123}")
    private String adminPassword;

    @Value("${app.seed.ventas-password:ventas123}")
    private String ventasPassword;

    @Override
    public void run(String... args) {
        crearSiNoExiste("admin", adminPassword, Rol.ADMIN);
        crearSiNoExiste("ventas", ventasPassword, Rol.VENTAS);
    }

    private void crearSiNoExiste(String username, String password, Rol rol) {
        if (usuarioRepository.existsByUsernameIgnoreCase(username)) {
            return;
        }
        usuarioRepository.save(Usuario.builder()
                .username(username)
                .password(passwordEncoder.encode(password))
                .rol(rol)
                .activo(true)
                .build());
        log.info("Usuario por defecto creado: '{}' con rol {}", username, rol);
    }
}