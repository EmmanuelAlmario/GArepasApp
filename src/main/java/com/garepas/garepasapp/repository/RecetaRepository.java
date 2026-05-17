package com.garepas.garepasapp.repository;

import com.garepas.garepasapp.entity.Receta;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface RecetaRepository extends JpaRepository<Receta, Long> {

    boolean existsByNombreIgnoreCase(String nombre);

    List<Receta> findByNombreContainingIgnoreCase(String nombre);
}
