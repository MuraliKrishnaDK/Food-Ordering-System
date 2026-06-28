package com.xwiggy.food.model;

import javax.persistence.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "orders")
public class Order {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private String username;

    @Column(nullable = false)
    private String items;

    @Column(nullable = false)
    private double total;

    @Column(nullable = false)
    private LocalDateTime orderedAt;

    public Order() {}

    public Order(String username, String items, double total, LocalDateTime orderedAt) {
        this.username = username;
        this.items = items;
        this.total = total;
        this.orderedAt = orderedAt;
    }

    public Long getId() { return id; }
    public String getUsername() { return username; }
    public String getItems() { return items; }
    public double getTotal() { return total; }
    public LocalDateTime getOrderedAt() { return orderedAt; }

    public void setUsername(String username) { this.username = username; }
    public void setItems(String items) { this.items = items; }
    public void setTotal(double total) { this.total = total; }
    public void setOrderedAt(LocalDateTime orderedAt) { this.orderedAt = orderedAt; }
}
