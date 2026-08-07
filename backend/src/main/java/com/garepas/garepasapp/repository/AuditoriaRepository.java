package com.garepas.garepasapp.repository;

import com.garepas.garepasapp.entity.Auditoria;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface AuditoriaRepository extends JpaRepository<Auditoria, Long> {

    List<Auditoria> findAllByOrderByFechaDesc(Pageable pageable);

    List<Auditoria> findByUsuarioIgnoreCaseOrderByFechaDesc(String usuario, Pageable pageable);
}