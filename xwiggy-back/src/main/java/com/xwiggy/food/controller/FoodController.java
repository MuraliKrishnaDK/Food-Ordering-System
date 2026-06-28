package com.xwiggy.food.controller;

import com.xwiggy.food.dao.FoodDao;
import com.xwiggy.food.dao.FoodDaoImpl;
import com.xwiggy.food.model.Food;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.ui.Model;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Optional;


@RestController
@CrossOrigin
public class FoodController {

    @Autowired
    FoodDaoImpl foodDao;

    @Autowired
    FoodDao foodRepository;

    @RequestMapping(value = "/menu")
    public List<Food> getMenu(Model model) {
        return foodDao.getFoodList();
    }

    @PutMapping("/menu/{id}")
    public ResponseEntity<Map<String, Object>> updateItem(
            @PathVariable String id,
            @RequestBody Map<String, Object> body) {

        Map<String, Object> response = new HashMap<>();
        Optional<Food> opt = foodRepository.findById(id);
        if (!opt.isPresent()) {
            response.put("status", false);
            response.put("msg", "Item not found.");
            return ResponseEntity.ok(response);
        }

        Food food = opt.get();
        if (body.containsKey("item") && body.get("item") != null)
            food.setItem(body.get("item").toString().trim());
        if (body.containsKey("price") && body.get("price") != null) {
            try { food.setPrice(Integer.parseInt(body.get("price").toString())); } catch (NumberFormatException ignored) {}
        }
        if (body.containsKey("quantity") && body.get("quantity") != null) {
            try { food.setQuantity(Integer.parseInt(body.get("quantity").toString())); } catch (NumberFormatException ignored) {}
        }
        if (body.containsKey("url") && body.get("url") != null)
            food.setUrl(body.get("url").toString().trim());

        foodRepository.save(food);
        response.put("status", true);
        response.put("item", food);
        return ResponseEntity.ok(response);
    }

    @DeleteMapping("/menu/{id}")
    public ResponseEntity<Map<String, Object>> deleteItem(@PathVariable String id) {
        Map<String, Object> response = new HashMap<>();
        if (!foodRepository.existsById(id)) {
            response.put("status", false);
            response.put("msg", "Item not found.");
            return ResponseEntity.ok(response);
        }
        foodRepository.deleteById(id);
        response.put("status", true);
        response.put("msg", "Item deleted.");
        return ResponseEntity.ok(response);
    }
}
