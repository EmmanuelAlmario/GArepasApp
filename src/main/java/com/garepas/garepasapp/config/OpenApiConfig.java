package com.garepas.garepasapp.config;

import io.swagger.v3.oas.models.OpenAPI;
import io.swagger.v3.oas.models.info.Info;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

@Configuration
public class OpenApiConfig {

    @Bean
    public OpenAPI openAPI() {
        return new OpenAPI()
                .info(new Info()
                        .title("GArepas API")
                        .description("Sistema de Gestion de inventario y finanzas para GArepas.")
                        .version("1.0.0"));
    }
}
