package com.garepas.garepasapp.dto.response;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;

public record ReporteResumen(
        LocalDate desde,
        LocalDate hasta,
        // KPIs
        int nroVentas,
        BigDecimal unidadesVendidas,
        BigDecimal ticketPromedio,
        // Rentabilidad
        BigDecimal ingresoTotal,
        BigDecimal gastoTotal,
        BigDecimal utilidadNeta,
        BigDecimal margenPorcentaje,
        // Comparativo vs periodo anterior
        BigDecimal ingresoPeriodoAnterior,
        BigDecimal gastoPeriodoAnterior,
        BigDecimal variacionIngresos,
        // Series
        List<SerieDia> serieIngresosVsGastos,
        List<SerieHora> ventasPorHora,
        List<SerieDiaSemana> ventasPorDiaSemana,
        List<TopProducto> topProductos,
        List<GastoCategoria> gastosPorCategoria,
        List<JornadaResumen> porJornada
) {
    public record SerieDia(LocalDate fecha, BigDecimal ingresos, BigDecimal gastos) {}
    public record SerieHora(int hora, int nroVentas, BigDecimal total) {}
    public record SerieDiaSemana(String dia, int nroVentas, BigDecimal total) {}
    public record TopProducto(Long productoId, String nombre, int unidades, BigDecimal ingreso, BigDecimal pctDelTotal) {}
public record GastoCategoria(String categoria, BigDecimal monto, BigDecimal pctDelTotal) {}
    public record JornadaResumen(String abiertaPor, int nroVentas, BigDecimal total) {}
}