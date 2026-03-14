package lkerp.erp.controller;

import jakarta.validation.Valid;
import lkerp.erp.dto.ApiResponse;
import lkerp.erp.dto.BusinessDTO;
import lkerp.erp.service.BusinessService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@CrossOrigin(origins = {"http://localhost:5173", "http://127.0.0.1:5173"}, maxAge = 3600, allowCredentials = "true")
@RestController
@RequestMapping("/api/businesses")
@RequiredArgsConstructor
public class BusinessController {

    private final BusinessService businessService;

    @PostMapping
    public ResponseEntity<ApiResponse<BusinessDTO.Response>> createBusiness(@Valid @RequestBody BusinessDTO.Request request) {
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.success("Business created", businessService.createBusiness(request)));
    }

    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse<BusinessDTO.Response>> getBusiness(@PathVariable Long id) {
        return ResponseEntity.ok(ApiResponse.success("Business retrieved", businessService.getBusiness(id)));
    }

    @GetMapping
    public ResponseEntity<ApiResponse<List<BusinessDTO.Response>>> getAllBusinesses() {
        return ResponseEntity.ok(ApiResponse.success("Businesses retrieved", businessService.getAllBusinesses()));
    }

    @PutMapping("/{id}")
    public ResponseEntity<ApiResponse<BusinessDTO.Response>> updateBusiness(
            @PathVariable Long id, @Valid @RequestBody BusinessDTO.Request request) {
        return ResponseEntity.ok(ApiResponse.success("Business updated", businessService.updateBusiness(id, request)));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<ApiResponse<Void>> deleteBusiness(@PathVariable Long id) {
        businessService.deleteBusiness(id);
        return ResponseEntity.ok(ApiResponse.success("Business deleted", null));
    }
}
