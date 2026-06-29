package com.xwiggy.food.model;

import javax.persistence.*;

@Entity
@Table(name = "item_stock")
public class ItemStock {

    @Id
    @Column(name = "item_name", length = 200)
    private String itemName;

    @Column(name = "in_stock", nullable = false)
    private boolean inStock = true;

    public ItemStock() {}

    public ItemStock(String itemName, boolean inStock) {
        this.itemName = itemName;
        this.inStock = inStock;
    }

    public String getItemName() { return itemName; }
    public boolean isInStock() { return inStock; }
    public void setItemName(String itemName) { this.itemName = itemName; }
    public void setInStock(boolean inStock) { this.inStock = inStock; }
}
