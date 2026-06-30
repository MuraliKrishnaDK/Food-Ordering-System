package com.xwiggy.food.config;

import com.xwiggy.food.dao.PromoCodeRepository;
import com.xwiggy.food.model.PromoCode;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.ApplicationArguments;
import org.springframework.boot.ApplicationRunner;
import org.springframework.stereotype.Component;

@Component
public class PromoDataLoader implements ApplicationRunner {

  @Autowired
  private PromoCodeRepository promoCodeRepository;

  @Override
  public void run(ApplicationArguments args) {
    ensurePromo(
        "WELCOME10",
        10,
        0,
        0,
        true);
  }

  private void ensurePromo(
      String code, int discountPercent, double discountFlat, double minOrder, boolean active) {
    if (promoCodeRepository.findByCodeIgnoreCase(code).isPresent()) {
      return;
    }
    PromoCode promo = new PromoCode();
    promo.setCode(code);
    promo.setDiscountPercent(discountPercent);
    promo.setDiscountFlat(discountFlat);
    promo.setMinOrderAmount(minOrder);
    promo.setActive(active);
    promoCodeRepository.save(promo);
    System.out.println("[FoodDoor] Seeded promo code: " + code);
  }
}
