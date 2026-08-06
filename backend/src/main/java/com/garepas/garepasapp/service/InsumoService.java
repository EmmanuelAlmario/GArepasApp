package com.garepas.garepasapp.service;

import com.garepas.garepasapp.dto.request.AjusteStockRequest;
import com.garepas.garepasapp.dto.request.DetalleAjusteStockRequest;
import com.garepas.garepasapp.dto.request.InsumoRequest;
import com.garepas.garepasapp.dto.response.AjusteStockResponse;
import com.garepas.garepasapp.dto.response.InsumoResponse;
import com.garepas.garepasapp.entity.Insumo;
import com.garepas.garepasapp.exception.OperacionInvalidaException;
import com.garepas.garepasapp.exception.RecursoDuplicadoException;
import com.garepas.garepasapp.exception.RecursoNoEncontradoException;
import com.garepas.garepasapp.repository.InsumoRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.util.HashMap;
import java.util.ArrayList;
import java.util.List;
import java.util.Map;

@Service
@RequiredArgsConstructor
public class InsumoService {

    private final InsumoRepository insumoRepository;

    @Transactional(readOnly = true)
    public List<InsumoResponse> listarTodos() {
        return insumoRepository.findAll()
                .stream()
                .map(InsumoResponse::desde)
                .toList();
    }

    @Transactional(readOnly = true)
    public List<InsumoResponse> listarActivos() {
        return insumoRepository.findByActivoTrue()
                .stream()
                .map(InsumoResponse::desde)
                .toList();
    }

    @Transactional(readOnly = true)
    public InsumoResponse buscarPorId(Long id) {
        return insumoRepository.findById(id)
                .map(InsumoResponse::desde)
                .orElseThrow(() -> new RecursoNoEncontradoException("Insumo", id));
    }

    @Transactional
    public InsumoResponse crear(InsumoRequest request) {
        if (insumoRepository.existsByNombreIgnoreCase(request.nombre())) {
            throw new RecursoDuplicadoException("Insumo", "nombre", request.nombre());
        }
        Insumo insumo = Insumo.builder()
                .nombre(request.nombre())
                .categoria(request.categoria())
                .marca(request.marca())
                .stockActual(request.stockActual())
                .stockMinimo(request.stockMinimo())
                .precioPorGramo(request.precioPorGramo())
                .unidadMedida(request.unidadMedida())
                .activo(request.activo())
                .build();
        return InsumoResponse.desde(insumoRepository.save(insumo));
    }

    @Transactional
    public InsumoResponse actualizar(Long id, InsumoRequest request) {
        Insumo insumo = insumoRepository.findById(id)
                .orElseThrow(() -> new RecursoNoEncontradoException("Insumo", id));
        if (!insumo.getNombre().equalsIgnoreCase(request.nombre()) &&
                insumoRepository.existsByNombreIgnoreCase(request.nombre())) {
            throw new RecursoDuplicadoException("Insumo", "nombre", request.nombre());
        }
        insumo.setNombre(request.nombre());
        insumo.setCategoria(request.categoria());
        insumo.setMarca(request.marca());
        insumo.setStockActual(request.stockActual());
        insumo.setStockMinimo(request.stockMinimo());
        insumo.setPrecioPorGramo(request.precioPorGramo());
        insumo.setUnidadMedida(request.unidadMedida());
        insumo.setActivo(request.activo());
        return InsumoResponse.desde(insumoRepository.save(insumo));
    }

    @Transactional
    public void eliminar(Long id) {
        if (!insumoRepository.existsById(id)) {
            throw new RecursoNoEncontradoException("Insumo", id);
        }
        insumoRepository.deleteById(id);
    }

    /**
     * Reduce el stock de múltiples insumos en una sola transacción atómica.
     * Las cantidades deben venir en la unidad base del insumo (gramo, ml o unidad).
     * Si algún insumo no existe o su stock sería negativo, no se aplica ningún cambio.
     */
    @Transactional
    public AjusteStockResponse ajustarStock(AjusteStockRequest request) {
        List<Long> ids = request.detalles().stream()
                .map(DetalleAjusteStockRequest::insumoId)
                .distinct()
                .toList();

        Map<Long, Insumo> insumosMap = new HashMap<>();
        for (Insumo i : insumoRepository.findAllById(ids)) {
            insumosMap.put(i.getId(), i);
        }
        for (Long id : ids) {
            if (!insumosMap.containsKey(id)) {
                throw new RecursoNoEncontradoException("Insumo", id);
            }
        }

        List<String> errores = new ArrayList<>();
        Map<Long, BigDecimal> totales = new HashMap<>();
        for (DetalleAjusteStockRequest d : request.detalles()) {
            Insumo insumo = insumosMap.get(d.insumoId());
            totales.merge(d.insumoId(), d.cantidad(), BigDecimal::add);
        }
        for (Map.Entry<Long, BigDecimal> e : totales.entrySet()) {
            Insumo insumo = insumosMap.get(e.getKey());
            BigDecimal nuevoStock = insumo.getStockActual().subtract(e.getValue());
            if (nuevoStock.compareTo(BigDecimal.ZERO) < 0) {
                errores.add("Insumo '" + insumo.getNombre() + "': stock actual "
                        + insumo.getStockActual() + ", intentas descontar " + e.getValue());
            }
        }
        if (!errores.isEmpty()) {
            throw new OperacionInvalidaException(
                    "Stock insuficiente para uno o más insumos. " + String.join(" | ", errores));
        }

        BigDecimal valorTotal = BigDecimal.ZERO;
        List<InsumoResponse> actualizados = new ArrayList<>();
        for (Map.Entry<Long, BigDecimal> e : totales.entrySet()) {
            Insumo insumo = insumosMap.get(e.getKey());
            insumo.setStockActual(insumo.getStockActual().subtract(e.getValue()));
            insumoRepository.save(insumo);
            valorTotal = valorTotal.add(e.getValue().multiply(insumo.getPrecioPorGramo()));
            actualizados.add(InsumoResponse.desde(insumo));
        }

        return new AjusteStockResponse(actualizados.size(), valorTotal, actualizados);
    }
}
