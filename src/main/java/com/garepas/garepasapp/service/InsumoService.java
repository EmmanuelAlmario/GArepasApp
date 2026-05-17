package com.garepas.garepasapp.service;

import com.garepas.garepasapp.dto.request.InsumoRequest;
import com.garepas.garepasapp.dto.response.InsumoResponse;
import com.garepas.garepasapp.entity.Insumo;
import com.garepas.garepasapp.exception.RecursoDuplicadoException;
import com.garepas.garepasapp.exception.RecursoNoEncontradoException;
import com.garepas.garepasapp.repository.InsumoRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

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
}
