package com.xwiggy.food.controller;

import com.xwiggy.food.dao.PromoCodeRepository;
import com.xwiggy.food.model.PromoCode;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.util.HashMap;
import java.util.Map;
import java.util.Optional;

@RestController
@CrossOrigin
@RequestMapping("/promo")
public class PromoController {

    @Autowired
    private PromoCodeRepository promoRepo;

    @PostMapping("/validate")
    public ResponseEntity<Map<String, Object>> validate(@RequestBody Map<String, Object> body) {
        Map<String, Object> response = new HashMap<>();
        String code = (String) body.getOrDefault("code", "");
        double orderTotal = body.get("total") instanceof Number
                ? ((Number) body.get("total")).doubleValue() : 0.0;

        Optional<PromoCode> opt = promoRepo.findByCodeIgnoreCase(code.trim());

        if (!opt.isPresent()) {
            response.put("valid", false);
            response.put("message", "Promo code not found.");
            return ResponseEntity.ok(response);
        }

        PromoCode promo = opt.get();

        if (!promo.isActive()) {
            response.put("valid", false);
            response.put("message", "This promo code is no longer active.");
            return ResponseEntity.ok(response);
        }

        if (promo.getExpiresOn() != null && LocalDate.now().isAfter(promo.getExpiresOn())) {
            response.put("valid", false);
            response.put("message", "This promo code has expired.");
            return ResponseEntity.ok(response);
        }

        if (orderTotal < promo.getMinOrderAmount()) {
            response.put("valid", false);
            response.put("message", String.format(
                    "Minimum order of $%.2f required for this code.", promo.getMinOrderAmount()));
            return ResponseEntity.ok(response);
        }

        double discount;
        String label;
        if (promo.getDiscountPercent() > 0) {
            discount = +(orderTotal * promo.getDiscountPercent() / 100.0);
            label = promo.getDiscountPercent() + "% off";
        } else {
            discount = Math.min(promo.getDiscountFlat(), orderTotal);
            label = "$" + promo.getDiscountFlat() + " off";
        }

        double newTotal = Math.max(0, orderTotal - discount);

        response.put("valid", true);
        response.put("discount", Math.round(discount * 100.0) / 100.0);
        response.put("newTotal", Math.round(newTotal * 100.0) / 100.0);
        response.put("label", label);
        response.put("message", "Code applied: " + label);
        return ResponseEntity.ok(response);
    }

    /** Seed a few demo promo codes (call once) */
    @PostMapping("/seed")
    public ResponseEntity<String> seed() {
        if (promoRepo.count() > 0) {
            return ResponseEntity.ok("Already seeded.");
        }
        PromoCode p1 = new PromoCode();
        p1.setCode("WELCOME10"); p1.setDiscountPercent(10);
        p1.setMinOrderAmount(0); p1.setActive(true);

        PromoCode p2 = new PromoCode();
        p2.setCode("SAVE5"); p2.setDiscountFlat(5); p2.setDiscountPercent(0);
        p2.setMinOrderAmount(20); p2.setActive(true);

        PromoCode p3 = new PromoCode();
        p3.setCode("FEAST20"); p3.setDiscountPercent(20);
        p3.setMinOrderAmount(50); p3.setActive(true);

        promoRepo.save(p1); promoRepo.save(p2); promoRepo.save(p3);
        return ResponseEntity.ok("Seeded 3 promo codes: WELCOME10, SAVE5, FEAST20");
    }
}
