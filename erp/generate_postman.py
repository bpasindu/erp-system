import json

def create_request(name, method, url_path, body=None, auth_token="{{adminToken}}"):
    req = {
        "name": name,
        "request": {
            "method": method,
            "header": [
                {
                    "key": "Content-Type",
                    "value": "application/json",
                    "type": "text"
                }
            ],
            "url": {
                "raw": f"{{{{baseUrl}}}}/{url_path}",
                "host": ["{{baseUrl}}"],
                "path": url_path.split("/")
            }
        },
        "response": []
    }
    
    if auth_token:
        req["request"]["auth"] = {
            "type": "bearer",
            "bearer": [
                {
                    "key": "token",
                    "value": auth_token,
                    "type": "string"
                }
            ]
        }
        
    if body is not None:
        req["request"]["body"] = {
            "mode": "raw",
            "raw": json.dumps(body, indent=4),
            "options": {
                "raw": {
                    "language": "json"
                }
            }
        }
        
    return req

def main():
    collection = {
        "info": {
            "name": "SmartBiz ERP API - Comprehensive Edition (70+ Tests)",
            "description": "Extensive API collection for SmartBiz ERP Lite covering positive, negative, and role-based scenarios.",
            "schema": "https://schema.getpostman.com/json/collection/v2.1.0/collection.json"
        },
        "item": [],
        "variable": [
            { "key": "baseUrl", "value": "http://localhost:8080", "type": "string" },
            { "key": "adminToken", "value": "YOUR_ADMIN_TOKEN_HERE", "type": "string" },
            { "key": "businessToken", "value": "YOUR_BUSINESS_TOKEN_HERE", "type": "string" },
            { "key": "businessId", "value": "1", "type": "string" }
        ]
    }

    # 1. Auth (6)
    auth_items = [
        create_request("1. Register Admin", "POST", "api/auth/register", {"email": "admin2@smartbiz.com", "password": "password123", "role": "ADMIN"}, auth_token=""),
        create_request("2. Register Business Owner", "POST", "api/auth/register", {"email": "owner@techcorp.com", "password": "password123", "role": "BUSINESS_OWNER", "businessId": 1}, auth_token=""),
        create_request("3. Register Staff (Missing Business - Error)", "POST", "api/auth/register", {"email": "staff@techcorp.com", "password": "password123", "role": "STAFF"}, auth_token=""),
        create_request("4. Login Admin", "POST", "api/auth/login", {"email": "admin@smartbiz.com", "password": "admin123"}, auth_token=""),
        create_request("5. Login Business Owner", "POST", "api/auth/login", {"email": "owner@techcorp.com", "password": "password123"}, auth_token=""),
        create_request("6. Login (Invalid Credentials - Error)", "POST", "api/auth/login", {"email": "owner@techcorp.com", "password": "wrongpassword"}, auth_token="")
    ]
    collection["item"].append({"name": "Auth", "item": auth_items})

    # 2. Businesses (8)
    biz_items = [
        create_request("1. Create Business (Admin)", "POST", "api/businesses", {"name": "Tech Corp", "currency": "USD", "status": "ACTIVE"}),
        create_request("2. Create Business (Missing Name - Error)", "POST", "api/businesses", {"currency": "USD", "status": "ACTIVE"}),
        create_request("3. Get All Businesses", "GET", "api/businesses"),
        create_request("4. Get Business by ID", "GET", "api/businesses/1"),
        create_request("5. Get Business by ID (Not Found - Error)", "GET", "api/businesses/999"),
        create_request("6. Update Business", "PUT", "api/businesses/1", {"name": "Tech Corp Global", "currency": "USD", "status": "ACTIVE"}),
        create_request("7. Delete Business", "DELETE", "api/businesses/1"),
        create_request("8. Delete Business (Unauthorized - Error)", "DELETE", "api/businesses/1", auth_token="INVALID_TOKEN")
    ]
    collection["item"].append({"name": "Businesses", "item": biz_items})

    # 3. Users (8)
    user_items = [
        create_request("1. Create Staff User", "POST", "api/users", {"email": "newstaff@techcorp.com", "password": "password", "role": "STAFF", "businessId": 1}),
        create_request("2. Create Admin User", "POST", "api/users", {"email": "newadmin@smartbiz.com", "password": "password", "role": "ADMIN"}),
        create_request("3. Create User (Missing Email - Error)", "POST", "api/users", {"password": "password", "role": "STAFF", "businessId": 1}),
        create_request("4. Get User by ID", "GET", "api/users/1"),
        create_request("5. Get Users by Business", "GET", "api/users/business/1"),
        create_request("6. Get Users by Business (Invalid ID - Error)", "GET", "api/users/business/999"),
        create_request("7. Update User", "PUT", "api/users/1", {"email": "updated@techcorp.com", "password": "newpassword", "role": "STAFF", "businessId": 1}),
        create_request("8. Delete User", "DELETE", "api/users/1")
    ]
    collection["item"].append({"name": "Users", "item": user_items})

    # 4. Products (7)
    prod_items = [
        create_request("1. Create Product", "POST", "api/products", {"businessId": 1, "sku": "LAP-001", "name": "Laptop Pro", "description": "High end laptop", "price": 1200.00, "cost": 900.00, "categoryId": 1}),
        create_request("2. Create Product (Missing Name - Error)", "POST", "api/products", {"businessId": 1, "sku": "LAP-001", "price": 1200.00}),
        create_request("3. Get All Products", "GET", "api/products"),
        create_request("4. Get Product by ID", "GET", "api/products/1"),
        create_request("5. Get Products by Business", "GET", "api/products/business/1"),
        create_request("6. Update Product", "PUT", "api/products/1", {"businessId": 1, "sku": "LAP-001", "name": "Laptop Pro V2", "price": 1250.00}),
        create_request("7. Delete Product", "DELETE", "api/products/1")
    ]
    collection["item"].append({"name": "Products", "item": prod_items})
    
    # 5. Customers (7)
    cust_items = [
        create_request("1. Create Customer", "POST", "api/customers", {"businessId": 1, "name": "John Doe", "email": "john@example.com", "phone": "1234567890", "address": "123 Main St"}),
        create_request("2. Create Customer (Missing Name - Error)", "POST", "api/customers", {"businessId": 1, "email": "john@example.com"}),
        create_request("3. Get All Customers", "GET", "api/customers"),
        create_request("4. Get Customer by ID", "GET", "api/customers/1"),
        create_request("5. Get Customers by Business", "GET", "api/customers/business/1"),
        create_request("6. Update Customer", "PUT", "api/customers/1", {"businessId": 1, "name": "John Doe", "email": "john.doe@example.com", "phone": "0987654321"}),
        create_request("7. Delete Customer", "DELETE", "api/customers/1")
    ]
    collection["item"].append({"name": "Customers", "item": cust_items})

    # 6. Suppliers (7)
    supp_items = [
        create_request("1. Create Supplier", "POST", "api/suppliers", {"businessId": 1, "name": "Tech Parts Inc", "email": "sales@techparts.com", "phone": "1112223333", "address": "456 Tech Blvd"}),
        create_request("2. Create Supplier (Invalid Email - Error)", "POST", "api/suppliers", {"businessId": 1, "name": "Tech Parts Inc", "email": "not_an_email"}),
        create_request("3. Get All Suppliers", "GET", "api/suppliers"),
        create_request("4. Get Supplier by ID", "GET", "api/suppliers/1"),
        create_request("5. Get Suppliers by Business", "GET", "api/suppliers/business/1"),
        create_request("6. Update Supplier", "PUT", "api/suppliers/1", {"businessId": 1, "name": "Tech Parts Global", "email": "contact@techparts.com"}),
        create_request("7. Delete Supplier", "DELETE", "api/suppliers/1")
    ]
    collection["item"].append({"name": "Suppliers", "item": supp_items})

    # 7. Inventory (7)
    inv_items = [
        create_request("1. Record Stock IN", "POST", "api/inventory/movement", {"businessId": 1, "warehouseId": 1, "productId": 1, "quantity": 100, "type": "IN", "reference": "PO-001"}),
        create_request("2. Record Stock OUT", "POST", "api/inventory/movement", {"businessId": 1, "warehouseId": 1, "productId": 1, "quantity": 5, "type": "OUT", "reference": "INV-001"}),
        create_request("3. Record Stock (Negative Qty - Error)", "POST", "api/inventory/movement", {"businessId": 1, "warehouseId": 1, "productId": 1, "quantity": -10, "type": "IN"}),
        create_request("4. Get Stock Levels by Product", "GET", "api/inventory/stock/product/1"),
        create_request("5. Get Stock levels by Warehouse", "GET", "api/inventory/stock/warehouse/1"),
        create_request("6. Get Stock levels by Business", "GET", "api/inventory/stock/business/1"),
        create_request("7. Get Low Stock Alerts", "GET", "api/inventory/alerts/1")
    ]
    collection["item"].append({"name": "Inventory", "item": inv_items})

    # 8. Invoices (7)
    invoice_items = [
        create_request("1. Create Invoice", "POST", "api/invoices", {"businessId": 1, "customerId": 1, "warehouseId": 1, "dueDate": "2026-12-31T00:00:00", "notes": "Thank you", "items": [{"productId": 1, "description": "Laptop Pro", "quantity": 2, "unitPrice": 1200.00}]}),
        create_request("2. Create Invoice (Empty Items - Error)", "POST", "api/invoices", {"businessId": 1, "customerId": 1, "items": []}),
        create_request("3. Get All Invoices", "GET", "api/invoices"),
        create_request("4. Get Invoice by ID", "GET", "api/invoices/1"),
        create_request("5. Get Invoices by Business", "GET", "api/invoices/business/1"),
        create_request("6. Update Invoice Status", "PUT", "api/invoices/1/status?status=PAID", {}),
        create_request("7. Delete Invoice", "DELETE", "api/invoices/1")
    ]
    collection["item"].append({"name": "Invoices", "item": invoice_items})

    # 9. Payments (7)
    payment_items = [
        create_request("1. Add Payment", "POST", "api/payments", {"businessId": 1, "invoiceId": 1, "amount": 2400.00, "paymentMethod": "CREDIT_CARD", "reference": "TXN_998877"}),
        create_request("2. Add Payment (Amount > Invoice - Error)", "POST", "api/payments", {"businessId": 1, "invoiceId": 1, "amount": 99999.00, "paymentMethod": "CASH"}),
        create_request("3. Get All Payments", "GET", "api/payments"),
        create_request("4. Get Payment by ID", "GET", "api/payments/1"),
        create_request("5. Get Payments by Invoice", "GET", "api/payments/invoice/1"),
        create_request("6. Get Payments by Business", "GET", "api/payments/business/1"),
        create_request("7. Delete Payment", "DELETE", "api/payments/1")
    ]
    collection["item"].append({"name": "Payments", "item": payment_items})

    # 10. Finance (8)
    finance_items = [
        create_request("1. Create Ledger Account", "POST", "api/finance/accounts", {"businessId": 1, "code": "1000", "name": "Cash", "type": "ASSET"}),
        create_request("2. Get Ledger Account", "GET", "api/finance/accounts/1"),
        create_request("3. Add Journal Entry", "POST", "api/finance/journals", {"businessId": 1, "date": "2026-03-11T00:00:00", "description": "Initial Capital", "lines": [{"accountId": 1, "debit": 10000.00, "credit": 0}, {"accountId": 2, "debit": 0, "credit": 10000.00}]}),
        create_request("4. Get Journal Entries by Account", "GET", "api/finance/journals/account/1"),
        create_request("5. Get Trial Balance", "GET", "api/finance/reports/trial-balance/1"),
        create_request("6. Get Income Statement", "GET", "api/finance/reports/income-statement/1?startDate=2026-01-01&endDate=2026-12-31"),
        create_request("7. Get Balance Sheet", "GET", "api/finance/reports/balance-sheet/1"),
        create_request("8. Create Ledger Account (Duplicate Code - Error)", "POST", "api/finance/accounts", {"businessId": 1, "code": "1000", "name": "Bank", "type": "ASSET"})
    ]
    collection["item"].append({"name": "Finance", "item": finance_items})

    # 11. Subscriptions (5)
    subs_items = [
        create_request("1. Create Subscription", "POST", "api/subscriptions", {"businessId": 1, "planId": 1, "billingCycle": "MONTHLY"}),
        create_request("2. Get Subscription by Business", "GET", "api/subscriptions/business/1"),
        create_request("3. Update Subscription Plan", "PUT", "api/subscriptions/1/plan?planId=2", {}),
        create_request("4. Cancel Subscription", "POST", "api/subscriptions/1/cancel", {}),
        create_request("5. Get Subscriptions (Unauthorized - Error)", "GET", "api/subscriptions", auth_token="BAD_TOKEN")
    ]
    collection["item"].append({"name": "Subscriptions", "item": subs_items})

    # 12. AI Assistant (3)
    ai_items = [
        create_request("1. Ask AI (Sales Summary)", "POST", "api/ai/ask", {"businessId": 1, "prompt": "Summarize my sales for today."}),
        create_request("2. Ask AI (Inventory Suggestion)", "POST", "api/ai/ask", {"businessId": 1, "prompt": "Which products need restocking?"}),
        create_request("3. Ask AI (Missing Prompt - Error)", "POST", "api/ai/ask", {"businessId": 1, "prompt": ""})
    ]
    collection["item"].append({"name": "AI Assistant", "item": ai_items})

    with open(r"C:\Users\passb\OneDrive\Desktop\AFSD-Practice\final_project\New folder\erp\SmartBiz-Backend-API.postman_collection.json", "w") as f:
        json.dump(collection, f, indent=2)

if __name__ == "__main__":
    main()
