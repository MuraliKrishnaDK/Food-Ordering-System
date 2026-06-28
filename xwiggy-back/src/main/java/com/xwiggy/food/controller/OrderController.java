package com.xwiggy.food.controller;

import com.xwiggy.food.dao.OrderRepository;
import com.xwiggy.food.model.Order;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@RestController
@CrossOrigin
@RequestMapping("/orders")
public class OrderController {

    @Autowired
    private OrderRepository orderRepository;

    /** Called by the frontend on successful payment to persist the order */
    @PostMapping("/place")
    public Map<String, Object> placeOrder(@RequestBody Map<String, Object> body) {
        Map<String, Object> response = new HashMap<>();
        String username = (String) body.get("username");
        String items    = (String) body.get("items");
        Object totalObj = body.get("total");

        if (username == null || username.isBlank() || items == null || totalObj == null) {
            response.put("status", false);
            response.put("msg", "username, items, and total are required.");
            return response;
        }

        double total;
        try {
            total = Double.parseDouble(totalObj.toString());
        } catch (NumberFormatException e) {
            response.put("status", false);
            response.put("msg", "Invalid total value.");
            return response;
        }

        Order order = new Order(username, items, total, LocalDateTime.now());
        orderRepository.save(order);

        response.put("status", true);
        response.put("orderId", order.getId());
        return response;
    }

    /** Returns all past orders for a given user, most recent first */
    @GetMapping("/history/{username}")
    public List<Order> getHistory(@PathVariable String username) {
        return orderRepository.findByUsernameOrderByOrderedAtDesc(username);
    }
}
