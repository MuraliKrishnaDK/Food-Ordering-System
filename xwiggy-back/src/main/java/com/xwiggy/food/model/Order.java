package com.xwiggy.food.model;

import com.fasterxml.jackson.annotation.JsonProperty;

import javax.persistence.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "orders")
public class Order {

    public enum Status {
        PLACED, CONFIRMED, PREPARING, OUT_FOR_DELIVERY, DELIVERED
    }

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private String username;

    @Column(columnDefinition = "TEXT", nullable = false)
    private String items;

    @Column(nullable = false)
    private Double total;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private Status status = Status.PLACED;

    @Column(name = "delivery_code", length = 4)
    private String deliveryCode;

    /** Legacy/production Neon column — required NOT NULL on some databases. */
    @Column(name = "ordered_at", nullable = false)
    private LocalDateTime orderedAt;

    @Column(name = "created_at")
    private LocalDateTime createdAt;

    @Column(name = "updated_at")
    private LocalDateTime updatedAt;

    public Order() {}

    @PrePersist
    void onCreate() {
        LocalDateTime now = LocalDateTime.now();
        if (orderedAt == null) {
            orderedAt = now;
        }
        if (createdAt == null) {
            createdAt = orderedAt;
        }
        if (updatedAt == null) {
            updatedAt = now;
        }
    }

    @PreUpdate
    void onUpdate() {
        updatedAt = LocalDateTime.now();
    }

    public Long getId() { return id; }
    public String getUsername() { return username; }
    public String getItems() { return items; }
    public Double getTotal() { return total; }
    public Status getStatus() { return status; }
    public String getDeliveryCode() { return deliveryCode; }

    @JsonProperty("createdAt")
    public LocalDateTime getCreatedAt() {
        return createdAt != null ? createdAt : orderedAt;
    }

    public LocalDateTime getOrderedAt() { return orderedAt; }
    public LocalDateTime getUpdatedAt() { return updatedAt; }

    public void setUsername(String username) { this.username = username; }
    public void setItems(String items) { this.items = items; }
    public void setTotal(Double total) { this.total = total; }
    public void setStatus(Status status) { this.status = status; }
    public void setDeliveryCode(String deliveryCode) { this.deliveryCode = deliveryCode; }
    public void setOrderedAt(LocalDateTime orderedAt) { this.orderedAt = orderedAt; }
    public void setCreatedAt(LocalDateTime createdAt) { this.createdAt = createdAt; }
    public void setUpdatedAt(LocalDateTime updatedAt) { this.updatedAt = updatedAt; }
}
