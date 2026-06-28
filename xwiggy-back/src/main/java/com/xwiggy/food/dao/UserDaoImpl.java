package com.xwiggy.food.dao;

import com.xwiggy.food.model.Login;
import com.xwiggy.food.model.User;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

@Service
public class UserDaoImpl {

    @Autowired
    private UserDao userDao;

    @Autowired
    private PasswordEncoder passwordEncoder;

    public void register(User user) {
        user.setPassword(passwordEncoder.encode(user.getPassword()));
        userDao.save(user);
    }

    public User validateUser(Login login) {
        if (!userDao.findById(login.getUsername()).isPresent()) {
            return null;
        }
        User user = userDao.findById(login.getUsername()).get();
        String stored = user.getPassword();

        boolean matches;
        if (stored.startsWith("$2a$") || stored.startsWith("$2b$") || stored.startsWith("$2y$")) {
            // BCrypt hash — use proper comparison
            matches = passwordEncoder.matches(login.getPassword(), stored);
        } else {
            // Plain-text legacy password — compare directly, then upgrade to BCrypt
            matches = stored.equals(login.getPassword());
            if (matches) {
                user.setPassword(passwordEncoder.encode(login.getPassword()));
                userDao.save(user);
            }
        }

        return matches ? user : null;
    }

    public Boolean usernameExists(String username) {
        return userDao.findById(username).isPresent();
    }
}
