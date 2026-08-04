package com.garepas.garepasapp.config;

import com.garepas.garepasapp.enums.CategoriaGasto;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.boot.CommandLineRunner;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.stereotype.Component;

import java.util.List;

/**
 * Normaliza valores legacy de gastos.categoria a los nombres canónicos del enum
 * CategoriaGasto. Se ejecuta al arranque de la app; es idempotente.
 *
 * Sólo actualiza filas cuya categoria NO coincida ya con un name() del enum.
 */
@Component
@RequiredArgsConstructor
@Slf4j
public class DataMigrationRunner implements CommandLineRunner {

    private final JdbcTemplate jdbc;

    @Override
    public void run(String... args) {
        try {
            // Verificar existencia de la tabla antes de intentar migrar (primer arranque).
            Integer existeTabla = jdbc.query(
                    "SELECT COUNT(*) FROM information_schema.tables " +
                            "WHERE table_name = 'gastos'",
                    rs -> rs.next() ? rs.getInt(1) : 0);
            if (existeTabla == null || existeTabla == 0) return;

            List<String> valoresActuales = jdbc.query(
                    "SELECT DISTINCT categoria FROM gastos",
                    (rs, i) -> rs.getString(1));

            int actualizados = 0;
            for (String raw : valoresActuales) {
                if (raw == null) continue;
                boolean yaCanonico = false;
                for (CategoriaGasto c : CategoriaGasto.values()) {
                    if (c.name().equals(raw)) {
                        yaCanonico = true;
                        break;
                    }
                }
                if (yaCanonico) continue;
                CategoriaGasto destino = CategoriaGasto.desdeTexto(raw);
                int n = jdbc.update(
                        "UPDATE gastos SET categoria = ? WHERE categoria = ?",
                        destino.name(), raw);
                if (n > 0) {
                    log.info("Migración categorías: '{}' → {} ({} filas)", raw, destino.name(), n);
                    actualizados += n;
                }
            }
            if (actualizados > 0) {
                log.info("Migración de categorías de gastos completada: {} filas normalizadas", actualizados);
            }
        } catch (Exception ex) {
            log.warn("No se pudo ejecutar la migración de categorías de gastos: {}", ex.getMessage());
        }
    }
}
