package com.xwiggy.food.service;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.xwiggy.food.model.Order;
import com.xwiggy.food.model.User;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpEntity;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.stereotype.Service;
import org.springframework.web.client.HttpStatusCodeException;
import org.springframework.web.client.RestTemplate;

import java.util.Collections;
import java.util.HashMap;
import java.util.Map;

@Service
public class EmailService {

  private static final String BREVO_API_URL = "https://api.brevo.com/v3/smtp/email";

  private static final Map<Order.Status, String> STATUS_LABELS = Map.of(
      Order.Status.PLACED, "Order Placed",
      Order.Status.CONFIRMED, "Confirmed",
      Order.Status.PREPARING, "Preparing",
      Order.Status.OUT_FOR_DELIVERY, "Out for Delivery",
      Order.Status.DELIVERED, "Delivered"
  );

  @Autowired(required = false)
  private JavaMailSender mailSender;

  @Value("${brevo.api.key:}")
  private String brevoApiKey;

  @Value("${brevo.sender.email:}")
  private String brevoSenderEmail;

  @Value("${brevo.sender.name:FoodDoor}")
  private String brevoSenderName;

  @Value("${spring.mail.username:}")
  private String smtpFromEmail;

  private final RestTemplate restTemplate = new RestTemplate();
  private final ObjectMapper objectMapper = new ObjectMapper();

  public void sendOrderConfirmation(User user, Order order) {
    if (user == null || !user.isNotifOrderConfirm()) {
      return;
    }
    String email = user.getEmail();
    if (email == null || email.trim().isEmpty()) {
      return;
    }

    String subject = "FoodDoor — Order #" + order.getId() + " Confirmed";
    String text =
        "Hi"
            + (user.getFirstname() != null && !user.getFirstname().isEmpty()
                ? " " + user.getFirstname()
                : "")
            + "!\n\n"
            + "Thanks for your order! Here are the details:\n\n"
            + "Order ID      : #" + order.getId() + "\n"
            + "Delivery code : " + safeDeliveryCode(order) + "\n"
            + "Total         : $" + String.format("%.2f", order.getTotal()) + "\n\n"
            + "Items:\n"
            + formatOrderItems(order.getItems())
            + "\nWe'll keep you updated as your order progresses.\n\n"
            + "— FoodDoor";
    sendEmail(email.trim(), subject, text);
  }

  public void sendOrderStatusUpdate(User user, Order order, Order.Status previousStatus) {
    if (user == null || !user.isNotifStatusUpdates()) {
      return;
    }
    String email = user.getEmail();
    if (email == null || email.trim().isEmpty()) {
      return;
    }
    if (order.getStatus() == previousStatus) {
      return;
    }
    // PLACED confirmation is handled by sendOrderConfirmation
    if (order.getStatus() == Order.Status.PLACED) {
      return;
    }

    String statusLabel = STATUS_LABELS.getOrDefault(order.getStatus(), order.getStatus().name());
    String subject = "FoodDoor — Order #" + order.getId() + " is " + statusLabel;
    StringBuilder text =
        new StringBuilder()
            .append("Hi")
            .append(
                user.getFirstname() != null && !user.getFirstname().isEmpty()
                    ? " " + user.getFirstname()
                    : "")
            .append("!\n\n")
            .append("Your order #")
            .append(order.getId())
            .append(" is now: ")
            .append(statusLabel)
            .append(".\n\n")
            .append("Delivery code: ")
            .append(safeDeliveryCode(order))
            .append("\n")
            .append("Total: $")
            .append(String.format("%.2f", order.getTotal()))
            .append("\n\n");

    if (order.getStatus() == Order.Status.OUT_FOR_DELIVERY) {
      text.append("Your food is on the way! Please have your delivery code ready.\n\n");
    } else if (order.getStatus() == Order.Status.DELIVERED) {
      text.append("Enjoy your meal! Thanks for ordering with FoodDoor.\n\n");
    } else {
      text.append("Track live updates in your FoodDoor order history.\n\n");
    }
    text.append("— FoodDoor");

    sendEmail(email.trim(), subject, text.toString());
  }

  public void sendPasswordResetCode(String toEmail, String code) {
    String subject = "FoodDoor — Password Reset Code";
    String text =
        "Your FoodDoor password reset code is: " + code
            + "\n\nThis code expires in 15 minutes."
            + "\n\nIf you did not request this, please ignore this email.";
    sendEmail(toEmail, subject, text, true);
  }

  private String safeDeliveryCode(Order order) {
    if (order.getDeliveryCode() != null && !order.getDeliveryCode().isEmpty()) {
      return order.getDeliveryCode();
    }
    return "—";
  }

  private String formatOrderItems(String itemsJson) {
    try {
      JsonNode arr = objectMapper.readTree(itemsJson);
      if (!arr.isArray() || arr.size() == 0) {
        return itemsJson + "\n";
      }
      StringBuilder sb = new StringBuilder();
      for (JsonNode item : arr) {
        String name = item.has("name") ? item.get("name").asText() : "Item";
        int qty = item.has("quantity") ? item.get("quantity").asInt() : 1;
        double lineTotal =
            item.has("lineTotal")
                ? item.get("lineTotal").asDouble()
                : (item.has("unitPrice") ? item.get("unitPrice").asDouble() * qty : 0);
        sb.append("  • ")
            .append(name)
            .append(" × ")
            .append(qty)
            .append(" — $")
            .append(String.format("%.2f", lineTotal))
            .append("\n");
      }
      return sb.toString();
    } catch (Exception ex) {
      return "  " + itemsJson + "\n";
    }
  }

  private void sendEmail(String toEmail, String subject, String text) {
    sendEmail(toEmail, subject, text, false);
  }

  private void sendEmail(String toEmail, String subject, String text, boolean required) {
    if (isBrevoConfigured()) {
      sendViaBrevo(toEmail, subject, text);
      return;
    }
    if (mailSender != null && smtpFromEmail != null && !smtpFromEmail.isEmpty()) {
      sendViaSmtp(toEmail, subject, text);
      return;
    }
    if (required) {
      throw new IllegalStateException(
          "Email service is not configured. Set BREVO_API_KEY and BREVO_SENDER_EMAIL, "
              + "or configure SMTP credentials.");
    }
    System.out.println(
        "[FoodDoor] Email not configured. Message for " + toEmail + " — subject: " + subject);
  }

  private boolean isBrevoConfigured() {
    return brevoApiKey != null
        && !brevoApiKey.trim().isEmpty()
        && brevoSenderEmail != null
        && !brevoSenderEmail.trim().isEmpty();
  }

  private void sendViaBrevo(String toEmail, String subject, String text) {
    Map<String, Object> sender = new HashMap<>();
    sender.put("name", brevoSenderName);
    sender.put("email", brevoSenderEmail.trim());

    Map<String, String> recipient = new HashMap<>();
    recipient.put("email", toEmail);

    Map<String, Object> body = new HashMap<>();
    body.put("sender", sender);
    body.put("to", Collections.singletonList(recipient));
    body.put("subject", subject);
    body.put("textContent", text);

    HttpHeaders headers = new HttpHeaders();
    headers.set("api-key", brevoApiKey.trim());
    headers.setContentType(MediaType.APPLICATION_JSON);

    HttpEntity<Map<String, Object>> request = new HttpEntity<>(body, headers);
    try {
      ResponseEntity<String> response =
          restTemplate.postForEntity(BREVO_API_URL, request, String.class);
      if (!response.getStatusCode().is2xxSuccessful()) {
        throw new IllegalStateException(
            "Brevo API returned status " + response.getStatusCodeValue());
      }
    } catch (HttpStatusCodeException ex) {
      throw new IllegalStateException(
          "Brevo API error (" + ex.getStatusCode().value() + "): " + ex.getResponseBodyAsString(),
          ex);
    }
  }

  private void sendViaSmtp(String toEmail, String subject, String text) {
    SimpleMailMessage message = new SimpleMailMessage();
    message.setFrom(smtpFromEmail);
    message.setTo(toEmail);
    message.setSubject(subject);
    message.setText(text);
    mailSender.send(message);
  }
}
