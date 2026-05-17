package com.garepas.garepasapp.repository;

import com.garepas.garepasapp.entity.Nomina;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.math.BigDecimal;
import java.util.List;
import java.util.Optional;

@Repository
public interface NominaRepository extends JpaRepository<Nomina, Long> {

    List<Nomina> findByEmpleadoId(Long empleadoId);

    @Query("SELECT n FROM Nomina n WHERE n.empleado.id = :empleadoId ORDER BY n.fecha DESC")
    Optional<Nomina> findUltimaByEmpleadoId(@Param("empleadoId") Long empleadoId);

    @Query("SELECT SUM(n.monto) FROM Nomina n WHERE n.empleado.id = :empleadoId")
    BigDecimal sumMontoByEmpleadoId(@Param("empleadoId") Long empleadoId);
}
