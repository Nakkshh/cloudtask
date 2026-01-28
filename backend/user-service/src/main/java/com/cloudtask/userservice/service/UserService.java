package com.cloudtask.userservice.service;

import com.cloudtask.userservice.entity.User;
import com.cloudtask.userservice.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.Optional;

@Service
@RequiredArgsConstructor
public class UserService {
    
    private final UserRepository userRepository;
    
    @Transactional
    public User createOrUpdateUser(String firebaseUid, String email, String displayName, String photoUrl) {
        Optional<User> existingUser = userRepository.findByFirebaseUid(firebaseUid);
        
        if (existingUser.isPresent()) {
            User user = existingUser.get();
            user.setEmail(email);
            user.setDisplayName(displayName);
            user.setPhotoUrl(photoUrl);
            return userRepository.save(user);
        } else {
            User newUser = new User();
            newUser.setFirebaseUid(firebaseUid);
            newUser.setEmail(email);
            newUser.setDisplayName(displayName);
            newUser.setPhotoUrl(photoUrl);
            newUser.setRole("USER");
            return userRepository.save(newUser);
        }
    }
    
    public Optional<User> getUserByFirebaseUid(String firebaseUid) {
        return userRepository.findByFirebaseUid(firebaseUid);
    }
}
