package com.xwiggy.food.controller;

import com.xwiggy.food.dao.ItemStockRepository;
import com.xwiggy.food.model.ItemStock;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.stream.Collectors;

@RestController
@CrossOrigin
@RequestMapping("/stock")
public class StockController {

    @Autowired
    private ItemStockRepository stockRepo;

    /** Returns list of item names that are marked out-of-stock */
    @GetMapping("/out-of-stock")
    public List<String> getOutOfStockItems() {
        return stockRepo.findByInStockFalse()
                .stream()
                .map(ItemStock::getItemName)
                .collect(Collectors.toList());
    }

    /** Merchant toggles a specific item's stock status */
    @PutMapping("/toggle")
    public ResponseEntity<ItemStock> toggleStock(@RequestBody String itemName) {
        String name = itemName.trim().replaceAll("^\"|\"$", "");
        ItemStock stock = stockRepo.findById(name)
                .orElse(new ItemStock(name, true));
        stock.setInStock(!stock.isInStock());
        return ResponseEntity.ok(stockRepo.save(stock));
    }

    /** Get current stock status for a specific item */
    @GetMapping("/status")
    public ResponseEntity<ItemStock> getStatus(@RequestParam String itemName) {
        ItemStock s = stockRepo.findById(itemName.trim())
                .orElse(new ItemStock(itemName.trim(), true));
        return ResponseEntity.ok(s);
    }
}
