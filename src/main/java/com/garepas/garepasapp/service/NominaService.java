package com.garepas.garepasapp.service;

import com.garepas.garepasapp.dto.request.NominaRequest;
import com.garepas.garepasapp.dto.response.NominaResponse;
import com.garepas.garepasapp.entity.Empleado;
import com.garepas.garepasapp.entity.Nomina;
import com.garepas.garepasapp.exception.RecursoNoEncontradoException;
import com.garepas.garepasapp.repository.EmpleadoRepository;
import com.garepas.garepasapp.repository.NominaRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;

@Service
@RequiredArgsConstructor
public class NominaService {

    private final NominaRepository nominaRepository;
    private final EmpleadoRepository empleadoRepository;

    @Transactional(readOnly = true)
    public List<NominaResponse> listarPorEmpleado(Long empleadoId) {
        if (!empleadoRepository.existsById(empleadoId)) {
            throw new RecursoNoEncontradoException("Empleado", empleadoId);
        }
        return nominaRepository.findByEmpleadoId(empleadoId)
                .stream()
                .map(NominaResponse::desde)
                .toList();
    }

    @Transactional
    public NominaResponse registrar(NominaRequest request) {
        Empleado empleado = empleadoRepository.findById(request.empleadoId())
                .orElseThrow(() -> new RecursoNoEncontradoException("Empleado", request.empleadoId()));

        // UC26 - La deuda acumulada se calcula sumando el monto al ultimo registro
        BigDecimal deudaAnterior = nominaRepository.findUltimaByEmpleadoId(empleado.getId())
                .map(Nomina::getDeudaAcumulada)
                .orElse(BigDecimal.ZERO);

        BigDecimal nuevaDeuda = deudaAnterior.add(request.monto());

        Nomina nomina = Nomina.builder()
                .empleado(empleado)
                .monto(request.monto())
                .fecha(LocalDateTime.now())
                .deudaAcumulada(nuevaDeuda)
                .build();

        return NominaResponse.desde(nominaRepository.save(nomina));
    }

    @Transactional
    public NominaResponse actualizarDeuda(Long empleadoId, BigDecimal ajuste) {
        Empleado empleado = empleadoRepository.findById(empleadoId)
                .orElseThrow(() -> new RecursoNoEncontradoException("Empleado", empleadoId));

        BigDecimal deudaAnterior = nominaRepository.findUltimaByEmpleadoId(empleadoId)
                .map(Nomina::getDeudaAcumulada)
                .orElse(BigDecimal.ZERO);

        Nomina ajusteNomina = Nomina.builder()
                .empleado(empleado)
                .monto(ajuste)
                .fecha(LocalDateTime.now())
                .deudaAcumulada(deudaAnterior.add(ajuste))
                .build();

        return NominaResponse.desde(nominaRepository.save(ajusteNomina));
    }
}
