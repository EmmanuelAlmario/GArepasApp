package com.garepas.garepasapp.service;

import com.garepas.garepasapp.dto.request.UsuarioRequest;
import com.garepas.garepasapp.entity.Usuario;
import com.garepas.garepasapp.enums.Rol;
import com.garepas.garepasapp.exception.OperacionInvalidaException;
import com.garepas.garepasapp.exception.RecursoDuplicadoException;
import com.garepas.garepasapp.exception.RecursoNoEncontradoException;
import com.garepas.garepasapp.repository.UsuarioRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;

import java.util.Optional;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class UsuarioServiceTest {

    @Mock private UsuarioRepository usuarioRepository;

    private UsuarioService usuarioService;

    @BeforeEach
    void setUp() {
        usuarioService = new UsuarioService(usuarioRepository, new BCryptPasswordEncoder());
    }

    private UsuarioRequest request(String username, String password) {
        return new UsuarioRequest(username, password, Rol.VENTAS, true);
    }

    @Test
    void crear_sinPassword_lanza() {
        assertThatThrownBy(() -> usuarioService.crear(request("cajero", null)))
                .isInstanceOf(OperacionInvalidaException.class)
                .hasMessageContaining("contraseña");
    }

    @Test
    void crear_usernameDuplicado_lanza() {
        when(usuarioRepository.existsByUsernameIgnoreCase("cajero")).thenReturn(true);
        assertThatThrownBy(() -> usuarioService.crear(request("cajero", "secreta123")))
                .isInstanceOf(RecursoDuplicadoException.class);
    }

    @Test
    void crear_exitosoEncriptaPasswordYActivoPorDefecto() {
        when(usuarioRepository.existsByUsernameIgnoreCase("cajero")).thenReturn(false);
        when(usuarioRepository.save(any(Usuario.class))).thenAnswer(inv -> inv.getArgument(0));

        var resp = usuarioService.crear(request("cajero", "secreta123"));

        assertThat(resp.username()).isEqualTo("cajero");
        org.mockito.Mockito.verify(usuarioRepository).save(org.mockito.ArgumentMatchers.argThat(u ->
                !"secreta123".equals(u.getPassword()) &&
                Boolean.TRUE.equals(u.getActivo()) &&
                u.getRol() == Rol.VENTAS));
    }

    @Test
    void actualizar_uidUsuarioDuplicado_lanza() {
        when(usuarioRepository.findById(1L))
                .thenReturn(Optional.of(Usuario.builder().id(1L).username("cajero").build()));
        when(usuarioRepository.existsByUsernameIgnoreCase("otro")).thenReturn(true);

        assertThatThrownBy(() -> usuarioService.actualizar(1L, request("otro", "x")))
                .isInstanceOf(RecursoDuplicadoException.class);
    }

    @Test
    void actualizar_conPasswordVaciaNoLaCambia() {
        Usuario usuario = Usuario.builder().id(1L).username("cajero").password("hash-original").build();
        when(usuarioRepository.findById(1L)).thenReturn(Optional.of(usuario));
        when(usuarioRepository.save(any(Usuario.class))).thenAnswer(inv -> inv.getArgument(0));

        usuarioService.actualizar(1L, new UsuarioRequest("cajero", "", Rol.VENTAS, true));

        assertThat(usuario.getPassword()).isEqualTo("hash-original");
    }

    @Test
    void eliminar_adminRespaldo_lanza() {
        when(usuarioRepository.findById(1L))
                .thenReturn(Optional.of(Usuario.builder().id(1L).username("admin").build()));

        assertThatThrownBy(() -> usuarioService.eliminar(1L))
                .isInstanceOf(OperacionInvalidaException.class)
                .hasMessageContaining("admin");
    }

    @Test
    void eliminar_inexistente_lanza() {
        when(usuarioRepository.findById(any())).thenReturn(Optional.empty());
        assertThatThrownBy(() -> usuarioService.eliminar(1L))
                .isInstanceOf(RecursoNoEncontradoException.class);
    }
}