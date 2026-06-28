package com.xwiggy.food.controller;

import com.xwiggy.food.dao.UserDao;
import com.xwiggy.food.model.User;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.Map;
import java.util.Optional;

@RestController
@CrossOrigin
@RequestMapping("/profile")
public class ProfileController {

    @Autowired
    private UserDao userDao;

    @PutMapping("/update")
    public Map<String, Object> updateProfile(@RequestBody Map<String, String> body) {
        Map<String, Object> response = new HashMap<>();
        String username = body.get("username");

        if (username == null || username.trim().isEmpty()) {
            response.put("status", false);
            response.put("msg", "Username is required.");
            return response;
        }

        Optional<User> opt = userDao.findById(username);
        if (!opt.isPresent()) {
            response.put("status", false);
            response.put("msg", "User not found.");
            return response;
        }

        User user = opt.get();

        if (body.containsKey("firstname") && !body.get("firstname").trim().isEmpty())
            user.setFirstname(body.get("firstname").trim());

        if (body.containsKey("lastname"))
            user.setLastname(body.get("lastname").trim());

        if (body.containsKey("email"))
            user.setEmail(body.get("email").trim());

        if (body.containsKey("phone")) {
            try {
                user.setPhone(Long.parseLong(body.get("phone").trim()));
            } catch (NumberFormatException ignored) {}
        }

        if (body.containsKey("address"))
            user.setAddress(body.get("address").trim());

        userDao.save(user);
        user.setPassword(null);
        response.put("status", true);
        response.put("user", user);
        return response;
    }
}
