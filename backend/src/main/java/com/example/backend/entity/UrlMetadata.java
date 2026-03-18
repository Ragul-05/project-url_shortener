package com.example.backend.entity;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.FetchType;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.OneToOne;
import jakarta.persistence.Table;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Entity
@Table(name = "url_metadata")
@Getter
@Setter
@NoArgsConstructor
public class UrlMetadata {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @OneToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "url_id", nullable = false, unique = true)
    private Url url;

    @Column(name = "category", length = 64)
    private String category;

    @Column(name = "risk_score", nullable = false)
    private int riskScore;

    @Column(name = "tags", columnDefinition = "TEXT")
    private String tags;
}
