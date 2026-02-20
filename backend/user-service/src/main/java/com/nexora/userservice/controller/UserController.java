package com.nexora.userservice.controller;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.nexora.userservice.dto.UserSyncRequest;
import com.nexora.userservice.entity.User;
import com.nexora.userservice.service.UserService;

import lombok.RequiredArgsConstructor;

@RestController
@RequestMapping("/api/user")
@RequiredArgsConstructor
@CrossOrigin(origins = {"http://localhost:5173", "https://nexora-prod.vercel.app"})
public class UserController {
    
    private final UserService userService;
    
    @GetMapping("/test")
    public ResponseEntity<String> test() {
        return ResponseEntity.ok("User Service API is working! 🚀");
    }
    
    @PostMapping("/sync")
    public ResponseEntity<User> syncUser(@RequestBody UserSyncRequest request) {
        User user = userService.createOrUpdateUser(
            request.getFirebaseUid(),
            request.getEmail(),
            request.getDisplayName(),
            request.getPhotoUrl()
        );
        return ResponseEntity.ok(user);
    }
}
