package lkerp.erp.service;

import lkerp.erp.dto.UserDTO;
import java.util.List;

public interface UserService {
    UserDTO.Response createUser(UserDTO.Request request);
    UserDTO.Response getUser(Long id);
    List<UserDTO.Response> getUsersByBusiness(Long businessId);
    UserDTO.Response updateUser(Long id, UserDTO.Request request);
    void deleteUser(Long id);
    void changePassword(Long id, UserDTO.ChangePasswordRequest request);
}
