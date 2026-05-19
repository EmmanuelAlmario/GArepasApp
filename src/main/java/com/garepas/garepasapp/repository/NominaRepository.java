package com.garepas.garepasapp.repository;

import com.garepas.garepasapp.entity.Nomina;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface NominaRepository extends JpaRepository<Nomina, Long> {

    List<Nomina> findByEmpleadoIdOrderByFechaDesc(Long empleadoId);

    @Query("SELECT COALESCE(SUM(n.diasPagados), 0) FROM Nomina n WHERE n.empleado.id = :empleadoId")
    Integer sumDiasPagadosByEmpleadoId(@Param("empleadoId") Long empleadoId);
}