package com.garepas.garepasapp.entity;

import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "nomina")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Nomina {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "empleado_id", nullable = false)
    private Empleado empleado;

    @Column(nullable = false)
    private Integer diasPagados;

    @Column(nullable = false)
    private LocalDateTime fecha;
}