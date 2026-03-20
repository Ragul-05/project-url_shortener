package com.example.backend.repository;

import com.example.backend.entity.Url;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface UrlRepository extends JpaRepository<Url, Long> {

    boolean existsByShortCode(String shortCode);

    Optional<Url> findByShortCode(String shortCode);

    List<Url> findAllByOrderByCreatedAtDesc();
}
