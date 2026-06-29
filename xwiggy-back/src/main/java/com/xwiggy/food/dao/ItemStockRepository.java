package com.xwiggy.food.dao;

import com.xwiggy.food.model.ItemStock;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface ItemStockRepository extends JpaRepository<ItemStock, String> {
    List<ItemStock> findByInStockFalse();
}
