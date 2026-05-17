package com.garepas.garepasapp.repository;

import com.garepas.garepasapp.entity.Produccion;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;

@Repository
public interface ProduccionRepository extends JpaRepository<Produccion, Long> {

    List<Produccion> findByProductoId(Long productoId);

    List<Produccion> findByFechaBetween(LocalDateTime inicio, LocalDateTime fin);
}
