package com.xwiggy.food.config;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.ApplicationArguments;
import org.springframework.boot.ApplicationRunner;
import org.springframework.core.annotation.Order;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.stereotype.Component;

@Component
@Order(0)
public class SchemaMigrationRunner implements ApplicationRunner {

  @Autowired
  private JdbcTemplate jdbcTemplate;

  @Override
  public void run(ApplicationArguments args) {
    migrateAppUser();
    migrateOrders();
  }

  private void migrateAppUser() {
    exec("ALTER TABLE app_user ADD COLUMN IF NOT EXISTS notif_order_confirm BOOLEAN NOT NULL DEFAULT TRUE");
    exec("ALTER TABLE app_user ADD COLUMN IF NOT EXISTS notif_status_updates BOOLEAN NOT NULL DEFAULT TRUE");
    exec("ALTER TABLE app_user ADD COLUMN IF NOT EXISTS notif_promos BOOLEAN NOT NULL DEFAULT FALSE");
    exec("ALTER TABLE app_user ADD COLUMN IF NOT EXISTS notif_newsletter BOOLEAN NOT NULL DEFAULT FALSE");
    exec("ALTER TABLE app_user ALTER COLUMN password TYPE VARCHAR(64)");
    exec("ALTER TABLE app_user ALTER COLUMN email TYPE VARCHAR(100)");
  }

  private void migrateOrders() {
    exec("ALTER TABLE orders ADD COLUMN IF NOT EXISTS delivery_code VARCHAR(4)");
    exec("ALTER TABLE orders ADD COLUMN IF NOT EXISTS ordered_at TIMESTAMP NOT NULL DEFAULT NOW()");
  }

  private void exec(String sql) {
    try {
      jdbcTemplate.execute(sql);
      System.out.println("[FoodDoor] Migration OK: " + sql);
    } catch (Exception e) {
      System.err.println("[FoodDoor] Migration skipped: " + sql + " — " + e.getMessage());
    }
  }
}
