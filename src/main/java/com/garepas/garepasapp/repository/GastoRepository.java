package com.garepas.garepasapp.repository;

import com.garepas.garepasapp.entity.Gasto;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;

@Repository
public interface GastoRepository extends JpaRepository<Gasto, Long> {

    List<Gasto> findByFechaBetween(LocalDateTime inicio, LocalDateTime fin);

    List<Gasto> findByCategoria(String categoria);

    @Query("SELECT SUM(g.monto) FROM Gasto g WHERE g.fecha BETWEEN :inicio AND :fin")
    BigDecimal sumMontoByFechaBetween(@Param("inicio") LocalDateTime inicio, @Param("fin") LocalDateTime fin);
}
