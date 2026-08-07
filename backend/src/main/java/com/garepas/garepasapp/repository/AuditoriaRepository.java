package com.garepas.garepasapp.repository;

import com.garepas.garepasapp.entity.Auditoria;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface AuditoriaRepository extends JpaRepository<Auditoria, Long> {

    Page<Auditoria> findAllByOrderByFechaDesc(Pageable pageable);

    Page<Auditoria> findByUsuarioIgnoreCaseOrderByFechaDesc(String usuario, Pageable pageable);

    long deleteByFechaBefore(java.time.LocalDateTime fecha);
}