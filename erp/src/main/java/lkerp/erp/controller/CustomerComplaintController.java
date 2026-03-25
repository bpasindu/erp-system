package lkerp.erp.controller;

import lkerp.erp.dto.ApiResponse;
import lkerp.erp.dto.ComplaintDTO;
import lkerp.erp.service.ComplaintService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/complaints")
@RequiredArgsConstructor
public class CustomerComplaintController {

    private final ComplaintService complaintService;

    @PostMapping
    public ResponseEntity<ApiResponse<ComplaintDTO.Response>> createComplaint(@RequestBody ComplaintDTO.Request request) {
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.success("Complaint filed successfully", complaintService.createComplaint(request)));
    }

    @GetMapping("/business/{businessId}/open")
    public ResponseEntity<ApiResponse<List<ComplaintDTO.Response>>> getOpenComplaints(@PathVariable Long businessId) {
        return ResponseEntity.ok(ApiResponse.success("Open complaints retrieved", complaintService.getOpenComplaintsByBusiness(businessId)));
    }

    @PutMapping("/{id}/resolve")
    public ResponseEntity<ApiResponse<Void>> resolveComplaint(@PathVariable Long id) {
        complaintService.resolveComplaint(id);
        return ResponseEntity.ok(ApiResponse.success("Complaint marked as resolved", null));
    }
}
