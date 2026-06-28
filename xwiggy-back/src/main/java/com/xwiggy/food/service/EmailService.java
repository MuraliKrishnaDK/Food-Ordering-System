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
