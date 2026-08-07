package com.garepas.garepasapp.service;

import com.garepas.garepasapp.entity.Auditoria;
import com.garepas.garepasapp.repository.AuditoriaRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.PageRequest;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Propagation;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;

@Service
@RequiredArgsConstructor
@Slf4j
public class AuditoriaServicio {

    private final AuditoriaRepository auditoriaRepository;

    public static String usuarioActual() {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        return (auth != null && auth.getName() != null && !"anonymousUser".equals(auth.getName()))
                ? auth.getName()
                : "sistema";
    }

    /** Guarda el registro en una transacción propia para que persista aunque la acción falle. */
    @Transactional(propagation = Propagation.REQUIRES_NEW)
    public void registrar(String usuario, String accion, String detalle) {
        try {
            auditoriaRepository.save(Auditoria.builder()
                    .usuario(usuario)
                    .accion(accion)
                    .detalle(detalle != null && detalle.length() > 255 ? detalle.substring(0, 255) : detalle)
                    .fecha(LocalDateTime.now())
                    .build());
        } catch (Exception ex) {
            log.warn("No se pudo auditar acción [{}]: {}", accion, ex.getMessage());
        }
    }

    public void registrar(String accion, String detalle) {
        registrar(usuarioActual(), accion, detalle);
    }

    @Transactional(readOnly = true)
    public List<Auditoria> ultimas(int limite) {
        return auditoriaRepository.findAllByOrderByFechaDesc(PageRequest.of(0, Math.min(Math.max(limite, 1), 200)));
    }

    @Transactional(readOnly = true)
    public List<Auditoria> porUsuario(String usuario, int limite) {
        return auditoriaRepository.findByUsuarioIgnoreCaseOrderByFechaDesc(
                usuario, PageRequest.of(0, Math.min(Math.max(limite, 1), 200)));
    }
}