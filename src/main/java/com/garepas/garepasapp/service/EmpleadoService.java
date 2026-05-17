package com.garepas.garepasapp.service;

import com.garepas.garepasapp.dto.request.EmpleadoRequest;
import com.garepas.garepasapp.dto.response.EmpleadoResponse;
import com.garepas.garepasapp.entity.Empleado;
import com.garepas.garepasapp.exception.RecursoDuplicadoException;
import com.garepas.garepasapp.exception.RecursoNoEncontradoException;
import com.garepas.garepasapp.repository.EmpleadoRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@RequiredArgsConstructor
public class EmpleadoService {

    private final EmpleadoRepository empleadoRepository;

    @Transactional(readOnly = true)
    public List<EmpleadoResponse> listarTodos() {
        return empleadoRepository.findAll()
                .stream()
                .map(EmpleadoResponse::desde)
                .toList();
    }

    @Transactional(readOnly = true)
    public EmpleadoResponse buscarPorId(Long id) {
        return empleadoRepository.findById(id)
                .map(EmpleadoResponse::desde)
                .orElseThrow(() -> new RecursoNoEncontradoException("Empleado", id));
    }

    @Transactional
    public EmpleadoResponse crear(EmpleadoRequest request) {
        if (empleadoRepository.existsByNombreIgnoreCase(request.nombre())) {
            throw new RecursoDuplicadoException("Empleado", "nombre", request.nombre());
        }
        Empleado empleado = Empleado.builder()
                .nombre(request.nombre())
                .activo(request.activo())
                .build();
        return EmpleadoResponse.desde(empleadoRepository.save(empleado));
    }

    @Transactional
    public EmpleadoResponse actualizar(Long id, EmpleadoRequest request) {
        Empleado empleado = empleadoRepository.findById(id)
                .orElseThrow(() -> new RecursoNoEncontradoException("Empleado", id));
        if (!empleado.getNombre().equalsIgnoreCase(request.nombre()) &&
                empleadoRepository.existsByNombreIgnoreCase(request.nombre())) {
            throw new RecursoDuplicadoException("Empleado", "nombre", request.nombre());
        }
        empleado.setNombre(request.nombre());
        empleado.setActivo(request.activo());
        return EmpleadoResponse.desde(empleadoRepository.save(empleado));
    }
}
