package com.xwiggy.food.controller;

import com.xwiggy.food.dao.OrderRepository;
import com.xwiggy.food.dao.UserEmailDao;
import com.xwiggy.food.model.Order;
import com.xwiggy.food.model.User;
import com.xwiggy.food.service.EmailService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.util.Random;

@RestController
@CrossOrigin
@RequestMapping("/orders")
public class OrderController {

    @Autowired
    private OrderRepository orderRepository;

    @Autowired
    private UserEmailDao userEmailDao;

    @Autowired
    private EmailService emailService;

    /** Customer — place a new order */
    @PostMapping
    public ResponseEntity<Map<String, Object>> placeOrder(@RequestBody Map<String, Object> body) {
        Map<String, Object> response = new HashMap<>();
        try {
            Order order = new Order();
            order.setUsername((String) body.get("username"));
            order.setItems((String) body.get("items"));
            Object totalObj = body.get("total");
            order.setTotal(totalObj instanceof Number ? ((Number) totalObj).doubleValue() : 0.0);
            order.setDeliveryCode(String.format("%04d", new Random().nextInt(10000)));
            Order saved = orderRepository.save(order);
            response.put("status", true);
            response.put("orderId", saved.getId());
            response.put("orderStatus", saved.getStatus().name());
            response.put("deliveryCode", saved.getDeliveryCode());

            // Send confirmation email asynchronously
            try {
                userEmailDao.findById(saved.getUsername()).ifPresent(user -> {
                    if (user.getEmail() != null && !user.getEmail().isEmpty()) {
                        emailService.sendOrderConfirmation(
                                user.getEmail(), saved.getId(), saved.getItems(), saved.getTotal());
                    }
                });
            } catch (Exception ignored) {}

            return ResponseEntity.ok(response);
        } catch (Exception e) {
            response.put("status", false);
            response.put("msg", e.getMessage());
            return ResponseEntity.ok(response);
        }
    }

    /** Customer — get own order history (paginated) */
    @GetMapping("/user/{username}")
    public ResponseEntity<Map<String, Object>> getUserOrders(
            @PathVariable String username,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size) {
        Map<String, Object> response = new HashMap<>();
        Page<Order> pageResult = orderRepository.findByUsernameOrderByCreatedAtDesc(
                username, PageRequest.of(page, size));
        response.put("orders", pageResult.getContent());
        response.put("totalPages", pageResult.getTotalPages());
        response.put("totalOrders", pageResult.getTotalElements());
        response.put("currentPage", page);
        return ResponseEntity.ok(response);
    }

    /** Merchant — get all orders */
    @GetMapping("/all")
    public List<Order> getAllOrders() {
        return orderRepository.findAllByOrderByCreatedAtDesc();
    }

    /** Merchant — update order status */
    @PutMapping("/{id}/status")
    public ResponseEntity<Map<String, Object>> updateStatus(
            @PathVariable Long id,
            @RequestBody Map<String, String> body) {
        Map<String, Object> response = new HashMap<>();
        Optional<Order> opt = orderRepository.findById(id);
        if (!opt.isPresent()) {
            response.put("status", false);
            response.put("msg", "Order not found.");
            return ResponseEntity.ok(response);
        }
        try {
            Order order = opt.get();
            order.setStatus(Order.Status.valueOf(body.get("status")));
            orderRepository.save(order);
            response.put("status", true);
            response.put("orderStatus", order.getStatus().name());
            return ResponseEntity.ok(response);
        } catch (IllegalArgumentException e) {
            response.put("status", false);
            response.put("msg", "Invalid status value.");
            return ResponseEntity.ok(response);
        }
    }
}
