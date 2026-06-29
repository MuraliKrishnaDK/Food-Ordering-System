package com.xwiggy.food.dao;

import com.xwiggy.food.model.Order;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface OrderRepository extends JpaRepository<Order, Long> {
    List<Order> findByUsernameOrderByCreatedAtDesc(String username);
    Page<Order> findByUsernameOrderByCreatedAtDesc(String username, Pageable pageable);
    List<Order> findAllByOrderByCreatedAtDesc();
}
