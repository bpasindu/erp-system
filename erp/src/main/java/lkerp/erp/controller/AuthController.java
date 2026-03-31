package lkerp.erp.controller;

import jakarta.validation.Valid;
import lkerp.erp.dto.ApiResponse;
import lkerp.erp.dto.AuthDTO;
import lkerp.erp.entity.Business;
import lkerp.erp.entity.User;
import lkerp.erp.exception.BadRequestException;
import lkerp.erp.exception.ResourceNotFoundException;
import lkerp.erp.repository.BusinessRepository;
import lkerp.erp.repository.UserRepository;
import lkerp.erp.security.CustomUserDetails;
import lkerp.erp.security.JwtUtil;
import lkerp.erp.service.UsageLogService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.*;

@CrossOrigin(origins = {"http://localhost:5173", "http://127.0.0.1:5173"}, maxAge = 3600, allowCredentials = "true")
@RestController
@RequestMapping("/api/auth")
@RequiredArgsConstructor
public class AuthController {

    private final AuthenticationManager authenticationManager;
    private final JwtUtil jwtUtil;
    private final UserRepository userRepository;
    private final BusinessRepository businessRepository;
    private final PasswordEncoder passwordEncoder;
    private final UsageLogService usageLogService;

    @PostMapping("/login")
    public ResponseEntity<ApiResponse<AuthDTO.AuthResponse>> login(@Valid @RequestBody AuthDTO.LoginRequest request) {
        Authentication authentication = authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(request.getEmail(), request.getPassword())
        );

        CustomUserDetails userDetails = (CustomUserDetails) authentication.getPrincipal();
        User user = userDetails.getUser();
        String jwtToken = jwtUtil.generateToken(userDetails);

        AuthDTO.AuthResponse response = AuthDTO.AuthResponse.builder()
                .token(jwtToken)
                .userId(user.getId())
                .email(user.getEmail())
                .role(user.getRole())
                .businessId(user.getBusiness() != null ? user.getBusiness().getId() : null)
                .build();

        if (user.getBusiness() != null) {
            usageLogService.log(user.getBusiness().getId(), user.getId(), "LOGIN", "User logged into the system via email: " + user.getEmail(), "Auth", "10.0.0.1", "Success");
        }

        return ResponseEntity.ok(ApiResponse.success("Login successful", response));
    }

    @PostMapping("/register")
    public ResponseEntity<ApiResponse<AuthDTO.AuthResponse>> register(@Valid @RequestBody AuthDTO.RegisterRequest request) {
        if (userRepository.findByEmail(request.getEmail()).isPresent()) {
            throw new BadRequestException("Email is already taken");
        }

        Business business = null;
        if (request.getBusinessId() != null) {
            business = businessRepository.findById(request.getBusinessId())
                    .orElseThrow(() -> new ResourceNotFoundException("Business not found"));
        } else if (!"ADMIN".equalsIgnoreCase(request.getRole())) {
            throw new BadRequestException("Business ID is required for non-admin users");
        }

        User user = User.builder()
                .email(request.getEmail())
                .password(passwordEncoder.encode(request.getPassword()))
                .role(request.getRole().toUpperCase())
                .business(business)
                .isActive(true)
                .build();

        User savedUser = userRepository.save(user);
        
        CustomUserDetails userDetails = new CustomUserDetails(savedUser);
        String jwtToken = jwtUtil.generateToken(userDetails);

        AuthDTO.AuthResponse response = AuthDTO.AuthResponse.builder()
                .token(jwtToken)
                .userId(savedUser.getId())
                .email(savedUser.getEmail())
                .role(savedUser.getRole())
                .businessId(savedUser.getBusiness() != null ? savedUser.getBusiness().getId() : null)
                .build();

        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.success("Registration successful", response));
    }
}
