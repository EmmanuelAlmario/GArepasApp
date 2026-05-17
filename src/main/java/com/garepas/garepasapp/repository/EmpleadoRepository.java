package com.garepas.garepasapp.repository;

import com.garepas.garepasapp.entity.Empleado;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface EmpleadoRepository extends JpaRepository<Empleado, Long> {

    List<Empleado> findByActivoTrue();

    boolean existsByNombreIgnoreCase(String nombre);
}
