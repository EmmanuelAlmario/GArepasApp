package com.garepas.garepasapp.repository;

import com.garepas.garepasapp.entity.Producto;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface ProductoRepository extends JpaRepository<Producto, Long> {

    List<Producto> findByActivoTrue();

    boolean existsByNombreIgnoreCase(String nombre);

    List<Producto> findByRecetaId(Long recetaId);
}
