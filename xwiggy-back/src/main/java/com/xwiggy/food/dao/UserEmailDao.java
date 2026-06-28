package com.xwiggy.food.dao;

import com.xwiggy.food.model.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface UserEmailDao extends JpaRepository<User, String> {
    Optional<User> findByEmail(String email);
}
