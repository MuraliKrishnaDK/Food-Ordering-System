package com.xwiggy.food.model;

import javax.persistence.Entity;
import javax.persistence.Id;
import javax.persistence.Table;
import javax.validation.constraints.Email;
import javax.validation.constraints.NotBlank;
import javax.validation.constraints.Pattern;
import javax.validation.constraints.Size;

@Entity
@Table(name = "app_user")
public class User {

    @Id
    @NotBlank(message = "Username is required")
    @Size(min = 3, max = 45, message = "Username must be 3-45 characters")
    @Pattern(regexp = "^[a-zA-Z0-9_]+$", message = "Username may only contain letters, digits, and underscores")
    private String username;

    @NotBlank(message = "Password is required")
    @Size(min = 8, max = 64, message = "Password must be 8-64 characters")
    private String password;

    @NotBlank(message = "First name is required")
    @Size(max = 45, message = "First name max 45 characters")
    private String firstname;

    @Size(max = 45, message = "Last name max 45 characters")
    private String lastname;

    @Email(message = "Must be a valid email address")
    @Size(max = 100, message = "Email max 100 characters")
    private String email;

    @NotBlank(message = "Address is required")
    @Size(max = 100, message = "Address max 100 characters")
    private String address;

    private long phone;
    private boolean merchant;

    public User() {

    }

    public User(String username, String password, String firstname, String lastname, String email, String address, long phone,
                boolean merchant) {
        this.username = username;
        this.password = password;
        this.firstname = firstname;
        this.lastname = lastname;
        this.email = email;
        this.address = address;
        this.phone = phone;
        this.merchant=merchant;
    }

    public boolean isMerchant() {
        return merchant;
    }

    public void setMerchant(boolean merchant) {
        this.merchant = merchant;
    }

    public String getUsername() {
        return username;
    }

    public void setUsername(String username) {
        System.out.println("username: " + username);
        this.username = username;
    }

    public String getPassword() {
        return password;
    }

    public void setPassword(String password) {
        this.password = password;
    }

    public String getFirstname() {
        return firstname;
    }

    public void setFirstname(String firstname) {
        System.out.println("firstname: " + firstname);
        this.firstname = firstname;
    }

    public String getLastname() {
        return lastname;
    }

    public void setLastname(String lastname) {
        System.out.println("lastname: " + lastname);
        this.lastname = lastname;
    }

    public String getEmail() {
        return email;
    }

    public void setEmail(String email) {
        this.email = email;
    }

    public String getAddress() {
        return address;
    }

    public void setAddress(String address) {
        this.address = address;
    }

    public long getPhone() {
        return phone;
    }

    public void setPhone(long phone) {
        this.phone = phone;
    }

    @Override
    public String toString() {
        return "User{" +
                "username='" + username + '\'' +
                ", password='" + password + '\'' +
                ", firstname='" + firstname + '\'' +
                ", lastname='" + lastname + '\'' +
                ", email='" + email + '\'' +
                ", address='" + address + '\'' +
                ", phone=" + phone +
                ", merchant=" + merchant +
                '}';
    }
}
