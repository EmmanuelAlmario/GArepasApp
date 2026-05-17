package com.garepas.garepasapp.entity;

import com.garepas.garepasapp.enums.UnidadMedida;
import jakarta.persistence.*;
import lombok.*;
import java.math.BigDecimal;

@Entity
@Table(name = "insumos")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Insumo {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, length = 60)
    private String nombre;

    @Column(nullable = false, length = 30)
    private String categoria;

    @Column(nullable = false, length = 30)
    private String marca;

    @Column(nullable = false, precision = 10, scale = 2)
    private BigDecimal stockActual;

    @Column(nullable = false, precision = 10, scale = 2)
    private BigDecimal precioPorGramo;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 20)
    private UnidadMedida unidadMedida;

    @Column(nullable = false)
    private Boolean activo;
}
