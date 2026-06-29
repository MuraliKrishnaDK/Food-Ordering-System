package com.xwiggy.food.service;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.stereotype.Service;

@Service
public class EmailService {

    @Autowired(required = false)
    private JavaMailSender mailSender;

    @Value("${spring.mail.username:}")
    private String fromEmail;

    public void sendOrderConfirmation(String toEmail, Long orderId, String items, double total) {
        if (mailSender == null) {
            System.out.println("[FoodDoor] SMTP not configured. Order confirmation for "
                    + toEmail + " — Order #" + orderId + " total $" + total);
            return;
        }
        SimpleMailMessage message = new SimpleMailMessage();
        message.setFrom(fromEmail);
        message.setTo(toEmail);
        message.setSubject("FoodDoor — Order #" + orderId + " Confirmed!");
        message.setText(
                "Hi!\n\n"
                + "Your FoodDoor order has been placed successfully.\n\n"
                + "Order ID : #" + orderId + "\n"
                + "Items    : " + items + "\n"
                + "Total    : $" + String.format("%.2f", total) + "\n\n"
                + "Your order is being prepared and will arrive in 30–45 minutes.\n\n"
                + "Thank you for ordering with FoodDoor!"
        );
        mailSender.send(message);
    }

    public void sendPasswordResetCode(String toEmail, String code) {
        if (mailSender == null) {
            System.out.println("[FoodDoor] SMTP not configured. Password reset code for "
                    + toEmail + ": " + code);
            return;
        }
        SimpleMailMessage message = new SimpleMailMessage();
        message.setFrom(fromEmail);
        message.setTo(toEmail);
        message.setSubject("FoodDoor — Password Reset Code");
        message.setText(
                "Your FoodDoor password reset code is: " + code
                + "\n\nThis code expires in 15 minutes."
                + "\n\nIf you did not request this, please ignore this email."
        );
        mailSender.send(message);
    }
}
