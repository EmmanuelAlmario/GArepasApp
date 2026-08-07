package com.garepas.garepasapp;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.scheduling.annotation.EnableScheduling;

@SpringBootApplication
@EnableScheduling
public class GarepasappApplication {

	public static void main(String[] args) {
		SpringApplication.run(GarepasappApplication.class, args);
	}

}
