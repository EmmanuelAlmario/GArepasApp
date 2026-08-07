package com.garepas.garepasapp.service;

import com.garepas.garepasapp.dto.response.ReporteResumen;
import com.garepas.garepasapp.entity.DetalleVenta;
import com.garepas.garepasapp.entity.Gasto;
import com.garepas.garepasapp.entity.Jornada;
import com.garepas.garepasapp.entity.Venta;
import com.garepas.garepasapp.repository.GastoRepository;
import com.garepas.garepasapp.repository.JornadaRepository;
import com.garepas.garepasapp.repository.VentaRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.DayOfWeek;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.temporal.ChronoUnit;
import java.util.ArrayList;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;

@Service
@RequiredArgsConstructor
public class ReporteService {

    private final VentaRepository ventaRepository;
    private final GastoRepository gastoRepository;
    private final JornadaRepository jornadaRepository;

    @Transactional(readOnly = true)
    public ReporteResumen resumen(LocalDate desde, LocalDate hasta) {
        LocalDate hoy = LocalDate.now();
        LocalDate fin = (hasta == null || hasta.isAfter(hoy)) ? hoy : hasta;
        LocalDate ini = (desde == null || desde.isAfter(fin)) ? fin.minusDays(6) : desde;

        LocalDateTime comienzo = ini.atStartOfDay();
        LocalDateTime cierre = fin.plusDays(1).atStartOfDay();

        List<Venta> ventas = ventaRepository.findByFechaBetween(comienzo, cierre);
        List<Gasto> gastos = gastoRepository.findByFechaBetween(comienzo, cierre);

        Map<LocalDate, BigDecimal> ingresosPorDia = new LinkedHashMap<>();
        Map<LocalDate, BigDecimal> gastosPorDia = new LinkedHashMap<>();
        Map<Integer, Integer> ventasPorHora = new LinkedHashMap<>();
        Map<Integer, BigDecimal> totalPorHora = new LinkedHashMap<>();
        Map<DayOfWeek, BigDecimal> totalPorDiaSemana = new LinkedHashMap<>();
        Map<DayOfWeek, Integer> nPorDiaSemana = new LinkedHashMap<>();
        Map<Long, ProductoProd> topProductos = new LinkedHashMap<>();
        Map<String, BigDecimal> gastoPorCategoria = new LinkedHashMap<>();

        BigDecimal ingresoTotal = BigDecimal.ZERO;
        BigDecimal gastoTotal = BigDecimal.ZERO;
        BigDecimal unidadesVendidas = BigDecimal.ZERO;
        int nroVentas = 0;

        for (LocalDate d = ini; !d.isAfter(fin); d = d.plusDays(1)) {
            ingresosPorDia.put(d, BigDecimal.ZERO);
            gastosPorDia.put(d, BigDecimal.ZERO);
        }

        for (Venta v : ventas) {
            LocalDate dia = v.getFecha().toLocalDate();
            ingresosPorDia.merge(dia, v.getTotal(), BigDecimal::add);
            ingresoTotal = ingresoTotal.add(v.getTotal());
            nroVentas++;

            int hora = v.getFecha().getHour();
            totalPorHora.merge(hora, v.getTotal(), BigDecimal::add);
            ventasPorHora.merge(hora, 1, Integer::sum);

            DayOfWeek dow = dia.getDayOfWeek();
            totalPorDiaSemana.merge(dow, v.getTotal(), BigDecimal::add);
            nPorDiaSemana.merge(dow, 1, Integer::sum);

            for (DetalleVenta det : v.getDetalles()) {
                unidadesVendidas = unidadesVendidas.add(BigDecimal.valueOf(det.getCantidad()));
                if (det.getProducto() != null) {
                    ProductoProd pp = topProductos.computeIfAbsent(
                            det.getProducto().getId(), k -> new ProductoProd(det.getProducto().getNombre()));
                    pp.unidades += det.getCantidad();
                    pp.ingreso = pp.ingreso.add(det.getSubtotal());
                }
            }
        }

        for (Gasto g : gastos) {
            gastosPorDia.merge(g.getFecha().toLocalDate(), g.getMonto(), BigDecimal::add);
            gastoTotal = gastoTotal.add(g.getMonto());
            String cat = g.getCategoria() != null ? g.getCategoria().getEtiqueta() : "Otros";
            gastoPorCategoria.merge(cat, g.getMonto(), BigDecimal::add);
        }

        List<ReporteResumen.SerieDia> serieDias = new ArrayList<>();
        for (Map.Entry<LocalDate, BigDecimal> e : ingresosPorDia.entrySet()) {
            serieDias.add(new ReporteResumen.SerieDia(e.getKey(), e.getValue(),
                    gastosPorDia.get(e.getKey())));
        }

        List<ReporteResumen.SerieHora> horas = new ArrayList<>();
        for (int h = 0; h < 24; h++) {
            horas.add(new ReporteResumen.SerieHora(h,
                    ventasPorHora.getOrDefault(h, 0),
                    totalPorHora.getOrDefault(h, BigDecimal.ZERO)));
        }

        List<ReporteResumen.SerieDiaSemana> semana = new ArrayList<>();
        for (DayOfWeek d : DayOfWeek.values()) {
            semana.add(new ReporteResumen.SerieDiaSemana(nombreDia(d),
                    nPorDiaSemana.getOrDefault(d, 0),
                    totalPorDiaSemana.getOrDefault(d, BigDecimal.ZERO)));
        }

        BigDecimal totalIngresosFinal = ingresoTotal;
        BigDecimal totalGastosFinal = gastoTotal;
        List<ReporteResumen.TopProducto> top = topProductos.entrySet().stream()
                .sorted((a, b) -> Integer.compare(b.getValue().unidades, a.getValue().unidades))
                .limit(8)
                .map(e -> new ReporteResumen.TopProducto(
                        e.getKey(), e.getValue().nombre, e.getValue().unidades,
                        e.getValue().ingreso, pct(e.getValue().ingreso, totalIngresosFinal)))
                .toList();

        List<ReporteResumen.GastoCategoria> catGastos = gastoPorCategoria.entrySet().stream()
                .sorted((a, b) -> b.getValue().compareTo(a.getValue()))
                .map(e -> new ReporteResumen.GastoCategoria(
                        e.getKey(), e.getValue(), pct(e.getValue(), totalGastosFinal)))
                .toList();

        List<ReporteResumen.JornadaResumen> porJornada = new ArrayList<>();
        for (Jornada j : jornadaRepository.findAllByOrderByFechaAperturaDesc()) {
            List<Venta> deJornada = ventas.stream()
                    .filter(v -> j.getId().equals(v.getJornadaId()))
                    .toList();
            if (deJornada.isEmpty()) continue;
            int n = deJornada.size();
            BigDecimal totalJ = deJornada.stream()
                    .map(Venta::getTotal).reduce(BigDecimal.ZERO, BigDecimal::add);
            porJornada.add(new ReporteResumen.JornadaResumen(j.getAbiertaPor(), n, totalJ));
        }
        porJornada.sort((a, b) -> b.total().compareTo(a.total()));

        long dias = ChronoUnit.DAYS.between(ini, fin) + 1;
        LocalDateTime iniAnterior = ini.minusDays(dias).atStartOfDay();
        LocalDateTime finAnterior = ini.minusDays(1).plusDays(1).atStartOfDay();
        BigDecimal ingresoAnterior = ventaRepository.sumTotalByFechaBetween(iniAnterior, finAnterior);
        BigDecimal gastoAnterior = gastoRepository.sumMontoByFechaBetween(iniAnterior, finAnterior);

        BigDecimal utilidad = ingresoTotal.subtract(gastoTotal);
        BigDecimal margen = pct(utilidad, ingresoTotal);
        BigDecimal ticket = nroVentas == 0 ? BigDecimal.ZERO
                : ingresoTotal.divide(BigDecimal.valueOf(nroVentas), 2, RoundingMode.HALF_UP);
        BigDecimal variacion = ingresoAnterior.signum() <= 0 ? BigDecimal.ZERO
                : ingresoTotal.subtract(ingresoAnterior)
                        .multiply(BigDecimal.valueOf(100))
                        .divide(ingresoAnterior, 1, RoundingMode.HALF_UP);

        return new ReporteResumen(
                ini, fin,
                nroVentas, unidadesVendidas, ticket,
                ingresoTotal, gastoTotal, utilidad, margen,
                ingresoAnterior, gastoAnterior, variacion,
                serieDias, horas, semana, top, catGastos, porJornada
        );
    }

    private static class ProductoProd {
        final String nombre;
        int unidades;
        BigDecimal ingreso = BigDecimal.ZERO;
        ProductoProd(String nombre) {
            this.nombre = nombre;
        }
    }

    private static String nombreDia(DayOfWeek d) {
        return switch (d) {
            case MONDAY -> "Lunes";
            case TUESDAY -> "Martes";
            case WEDNESDAY -> "Miércoles";
            case THURSDAY -> "Jueves";
            case FRIDAY -> "Viernes";
            case SATURDAY -> "Sábado";
            case SUNDAY -> "Domingo";
        };
    }

    private static BigDecimal pct(BigDecimal parte, BigDecimal total) {
        if (total == null || total.signum() <= 0) return BigDecimal.ZERO;
        return parte.multiply(BigDecimal.valueOf(100)).divide(total, 1, RoundingMode.HALF_UP);
    }
}