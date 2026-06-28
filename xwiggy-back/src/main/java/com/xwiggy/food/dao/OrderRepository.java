package com.xwiggy.food.dao;

import com.xwiggy.food.model.Order;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface OrderRepository extends JpaRepository<Order, Long> {
    List<Order> findByUsernameOrderByOrderedAtDesc(String username);
}
