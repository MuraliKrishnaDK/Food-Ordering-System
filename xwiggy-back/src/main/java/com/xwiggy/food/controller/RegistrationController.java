package com.xwiggy.food.controller;

import com.xwiggy.food.dao.UserDaoImpl;
import com.xwiggy.food.model.User;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.ui.Model;
import org.springframework.validation.BindingResult;
import org.springframework.web.bind.annotation.*;

import org.springframework.dao.DataIntegrityViolationException;

import javax.validation.Valid;
import java.util.HashMap;
import java.util.Map;
import java.util.stream.Collectors;

@RestController
@CrossOrigin
public class RegistrationController {

    @Autowired
    private UserDaoImpl userDao;

    @RequestMapping("/api/register")
    public User showRegister() { return new User(); }

    @PostMapping("/register")
    public ResponseEntity<?> addUser(@Valid @RequestBody User user, BindingResult result) {
        if (result.hasErrors()) {
            Map<String, Object> errors = new HashMap<>();
            errors.put("status", false);
            errors.put("errors", result.getFieldErrors().stream()
                    .map(fe -> fe.getField() + ": " + fe.getDefaultMessage())
                    .collect(Collectors.toList()));
            return ResponseEntity.badRequest().body(errors);
        }
        if (userDao.usernameExists(user.getUsername())) {
            Map<String, Object> errors = new HashMap<>();
            errors.put("status", false);
            errors.put("message", "Username already taken");
            return ResponseEntity.badRequest().body(errors);
        }
        try {
            userDao.register(user);
            user.setPassword(null);
            return ResponseEntity.ok(user);
        } catch (DataIntegrityViolationException e) {
            Map<String, Object> errors = new HashMap<>();
            errors.put("status", false);
            errors.put("message", "Registration failed. Please check your details and try again.");
            return ResponseEntity.badRequest().body(errors);
        }
    }

    @PostMapping("/checkUserName")
    public boolean checkAvailability(@RequestBody String username, Model model) {
        return userDao.usernameExists(username);
    }
}
