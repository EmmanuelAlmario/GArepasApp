package com.garepas.garepasapp.service;

import com.garepas.garepasapp.dto.request.RecetaRequest;
import com.garepas.garepasapp.dto.response.RecetaResponse;
import com.garepas.garepasapp.entity.DetalleReceta;
import com.garepas.garepasapp.entity.Insumo;
import com.garepas.garepasapp.entity.Receta;
import com.garepas.garepasapp.exception.RecursoDuplicadoException;
import com.garepas.garepasapp.exception.RecursoNoEncontradoException;
import com.garepas.garepasapp.repository.InsumoRepository;
import com.garepas.garepasapp.repository.RecetaRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@RequiredArgsConstructor
public class RecetaService {

    private final RecetaRepository recetaRepository;
    private final InsumoRepository insumoRepository;

    @Transactional(readOnly = true)
    public List<RecetaResponse> listarTodas() {
        return recetaRepository.findAll()
                .stream()
                .map(RecetaResponse::desde)
                .toList();
    }

    @Transactional(readOnly = true)
    public RecetaResponse buscarPorId(Long id) {
        return recetaRepository.findById(id)
                .map(RecetaResponse::desde)
                .orElseThrow(() -> new RecursoNoEncontradoException("Receta", id));
    }

    @Transactional
    public RecetaResponse crear(RecetaRequest request) {
        if (recetaRepository.existsByNombreIgnoreCase(request.nombre())) {
            throw new RecursoDuplicadoException("Receta", "nombre", request.nombre());
        }
        Receta receta = Receta.builder()
                .nombre(request.nombre())
                .descripcion(request.descripcion())
                .build();

        List<DetalleReceta> detalles = request.detalles().stream()
                .map(detalleRequest -> {
                    Insumo insumo = insumoRepository.findById(detalleRequest.insumoId())
                            .orElseThrow(() -> new RecursoNoEncontradoException("Insumo", detalleRequest.insumoId()));
                    return DetalleReceta.builder()
                            .receta(receta)
                            .insumo(insumo)
                            .cantidad(detalleRequest.cantidad())
                            .unidadMedida(detalleRequest.unidadMedida())
                            .build();
                })
                .toList();

        receta.setDetalles(detalles);
        return RecetaResponse.desde(recetaRepository.save(receta));
    }

    @Transactional
    public RecetaResponse actualizar(Long id, RecetaRequest request) {
        Receta receta = recetaRepository.findById(id)
                .orElseThrow(() -> new RecursoNoEncontradoException("Receta", id));

        if (!receta.getNombre().equalsIgnoreCase(request.nombre()) &&
                recetaRepository.existsByNombreIgnoreCase(request.nombre())) {
            throw new RecursoDuplicadoException("Receta", "nombre", request.nombre());
        }

        receta.setNombre(request.nombre());
        receta.setDescripcion(request.descripcion());
        receta.getDetalles().clear();

        List<DetalleReceta> detalles = request.detalles().stream()
                .map(detalleRequest -> {
                    Insumo insumo = insumoRepository.findById(detalleRequest.insumoId())
                            .orElseThrow(() -> new RecursoNoEncontradoException("Insumo", detalleRequest.insumoId()));
                    return DetalleReceta.builder()
                            .receta(receta)
                            .insumo(insumo)
                            .cantidad(detalleRequest.cantidad())
                            .unidadMedida(detalleRequest.unidadMedida())
                            .build();
                })
                .toList();

        receta.getDetalles().addAll(detalles);
        return RecetaResponse.desde(recetaRepository.save(receta));
    }

    @Transactional
    public void eliminar(Long id) {
        if (!recetaRepository.existsById(id)) {
            throw new RecursoNoEncontradoException("Receta", id);
        }
        recetaRepository.deleteById(id);
    }
}
