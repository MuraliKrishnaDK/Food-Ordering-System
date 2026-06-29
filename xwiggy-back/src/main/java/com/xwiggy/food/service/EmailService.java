package com.xwiggy.food.service;

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

  public void sendOrderConfirmation(String toEmail, Long orderId, String items, double total) {
    String subject = "FoodDoor — Order #" + orderId + " Confirmed!";
    String text =
        "Hi!\n\n"
            + "Your FoodDoor order has been placed successfully.\n\n"
            + "Order ID : #" + orderId + "\n"
            + "Items    : " + items + "\n"
            + "Total    : $" + String.format("%.2f", total) + "\n\n"
            + "Your order is being prepared and will arrive in 30–45 minutes.\n\n"
            + "Thank you for ordering with FoodDoor!";
  sendEmail(toEmail, subject, text);
  }

  public void sendPasswordResetCode(String toEmail, String code) {
    String subject = "FoodDoor — Password Reset Code";
    String text =
        "Your FoodDoor password reset code is: " + code
            + "\n\nThis code expires in 15 minutes."
            + "\n\nIf you did not request this, please ignore this email.";
    sendEmail(toEmail, subject, text, true);
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
