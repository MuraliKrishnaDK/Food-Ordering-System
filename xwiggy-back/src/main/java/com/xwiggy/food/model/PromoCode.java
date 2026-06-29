package com.xwiggy.food.model;

import javax.persistence.*;
import java.time.LocalDate;

@Entity
@Table(name = "promo_code")
public class PromoCode {

    @Id
    @Column(length = 30)
    private String code;

    /** Percentage discount, e.g. 10 = 10% off */
    @Column(nullable = false)
    private int discountPercent;

    /** Optional flat discount in dollars, e.g. 5 = $5 off (used if discountPercent == 0) */
    @Column(nullable = false)
    private double discountFlat = 0.0;

    @Column(nullable = false)
    private double minOrderAmount = 0.0;

    @Column(nullable = false)
    private boolean active = true;

    @Column(name = "expires_on")
    private LocalDate expiresOn;

    public PromoCode() {}

    public String getCode() { return code; }
    public int getDiscountPercent() { return discountPercent; }
    public double getDiscountFlat() { return discountFlat; }
    public double getMinOrderAmount() { return minOrderAmount; }
    public boolean isActive() { return active; }
    public LocalDate getExpiresOn() { return expiresOn; }

    public void setCode(String code) { this.code = code; }
    public void setDiscountPercent(int p) { this.discountPercent = p; }
    public void setDiscountFlat(double f) { this.discountFlat = f; }
    public void setMinOrderAmount(double m) { this.minOrderAmount = m; }
    public void setActive(boolean a) { this.active = a; }
    public void setExpiresOn(LocalDate d) { this.expiresOn = d; }
}
