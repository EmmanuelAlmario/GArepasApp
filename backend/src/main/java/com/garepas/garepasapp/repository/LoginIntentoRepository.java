package com.garepas.garepasapp.repository;

import com.garepas.garepasapp.entity.LoginIntento;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;

@Repository
public interface LoginIntentoRepository extends JpaRepository<LoginIntento, Long> {

    long countByUsernameAndExitosoFalseAndFechaAfterIgnoreCase(
            String username, LocalDateTime fecha);

    void deleteByUsernameIgnoreCase(String username);

    long deleteByFechaBefore(LocalDateTime fecha);
}