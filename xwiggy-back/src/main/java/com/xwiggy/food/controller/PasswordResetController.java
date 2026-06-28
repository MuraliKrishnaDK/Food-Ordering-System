package com.xwiggy.food.controller;

import com.xwiggy.food.dao.PasswordResetTokenRepository;
import com.xwiggy.food.dao.UserEmailDao;
import com.xwiggy.food.model.PasswordResetConfirm;
import com.xwiggy.food.model.PasswordResetRequest;
import com.xwiggy.food.model.PasswordResetToken;
import com.xwiggy.food.model.User;
import com.xwiggy.food.service.EmailService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;
import java.util.HashMap;
import java.util.Map;
import java.util.Optional;
import java.util.Random;

@RestController
@CrossOrigin
@RequestMapping("/password-reset")
public class PasswordResetController {

    @Autowired
    private UserEmailDao userEmailDao;

    @Autowired
    private PasswordResetTokenRepository tokenRepository;

    @Autowired
    private EmailService emailService;

    /** Step 1 — user submits their email; we generate a 6-digit code and email it */
    @PostMapping("/request")
    @Transactional
    public ResponseEntity<Map<String, Object>> requestReset(@RequestBody PasswordResetRequest body) {
        Map<String, Object> response = new HashMap<>();
        String email = body.getEmail() == null ? "" : body.getEmail().trim().toLowerCase();

        if (email.isEmpty()) {
            response.put("status", false);
            response.put("msg", "Email is required.");
            return ResponseEntity.ok(response);
        }

        Optional<User> userOpt = userEmailDao.findByEmail(email);
        if (!userOpt.isPresent()) {
            // Return generic message to avoid user enumeration
            response.put("status", true);
            response.put("msg", "If that email is registered, a reset code has been sent.");
            return ResponseEntity.ok(response);
        }

        // Delete any existing token for this email, then create a fresh one
        tokenRepository.deleteByEmail(email);

        String code = String.format("%06d", new Random().nextInt(999999));
        LocalDateTime expiresAt = LocalDateTime.now().plusMinutes(15);
        tokenRepository.save(new PasswordResetToken(code, email, expiresAt));

        try {
            emailService.sendPasswordResetCode(email, code);
        } catch (Exception ex) {
            System.err.println("[FoodDoor] Failed to send reset email: " + ex.getMessage());
            response.put("status", false);
            response.put("msg", "Could not send email. Please try again.");
            return ResponseEntity.ok(response);
        }

        response.put("status", true);
        response.put("msg", "If that email is registered, a reset code has been sent.");
        return ResponseEntity.ok(response);
    }

    /** Step 2 — user submits code + new password */
    @PostMapping("/confirm")
    @Transactional
    public ResponseEntity<Map<String, Object>> confirmReset(@RequestBody PasswordResetConfirm body) {
        Map<String, Object> response = new HashMap<>();
        String email = body.getEmail() == null ? "" : body.getEmail().trim().toLowerCase();
        String code  = body.getCode() == null ? "" : body.getCode().trim();
        String newPwd = body.getNewPassword() == null ? "" : body.getNewPassword();

        if (email.isEmpty() || code.isEmpty() || newPwd.isEmpty()) {
            response.put("status", false);
            response.put("msg", "Email, code, and new password are required.");
            return ResponseEntity.ok(response);
        }

        if (newPwd.length() < 8) {
            response.put("status", false);
            response.put("msg", "Password must be at least 8 characters.");
            return ResponseEntity.ok(response);
        }

        Optional<PasswordResetToken> tokenOpt = tokenRepository.findByToken(code);
        if (!tokenOpt.isPresent()
                || !tokenOpt.get().getEmail().equalsIgnoreCase(email)
                || tokenOpt.get().getExpiresAt().isBefore(LocalDateTime.now())) {
            response.put("status", false);
            response.put("msg", "Invalid or expired code.");
            return ResponseEntity.ok(response);
        }

        Optional<User> userOpt = userEmailDao.findByEmail(email);
        if (!userOpt.isPresent()) {
            response.put("status", false);
            response.put("msg", "Invalid or expired code.");
            return ResponseEntity.ok(response);
        }

        User user = userOpt.get();
        user.setPassword(newPwd);
        userEmailDao.save(user);

        tokenRepository.deleteByEmail(email);

        response.put("status", true);
        response.put("msg", "Password updated successfully.");
        return ResponseEntity.ok(response);
    }
}
