source venv/Scripts/activate

uvicorn app.main:app --reload

indrayani Enterprises and Trade concern

# Complete Inventory Management System - Database Schema

## System Overview

This system focuses on **Stock Management**, **Dealer Management**, and **Ledger Tracking** with emphasis on model-based product management and date-based filtering.

## Core Entities

### 1. Categories

- **Purpose**: Product categorization (TV, Refrigerator, Mobile, etc.)
- **Usage**: Must be created first, then used in products
- **Relationships**: One-to-Many with Products

### 2. Dealers

- **Purpose**: Supplier information management
- **Relationships**: One-to-Many with Products, One-to-Many with Party Ledger

### 3. Products

- **Purpose**: Product catalog with model-based management
- **Key Feature**: Same model = update stock, New model = new product
- **Relationships**: Many-to-One with Categories, Many-to-One with Dealers

### 4. Media Center

- **Purpose**: Centralized image storage to avoid duplicate uploads
- **Usage**: Reusable images across products
- **Relationships**: Many-to-Many with Products

### 5. Party Ledger

- **Purpose**: Track dues/payments to dealers/parties
- **Usage**: Manual entry of amounts owed and payments made
- **Relationships**: Many-to-One with Dealers

## Detailed Entity Specifications

### Categories Collection

```json
{
  _id: ObjectId,
  name: String (required, unique), // "TV", "Refrigerator", "Mobile"
  description: String,
  status: String (enum: ["active", "inactive"]),
  created_at: Date,
  updated_at: Date
}
```

### Dealers Collection

```json
{
  _id: ObjectId,
  dealer_code: String (unique, auto-generated), // DR001, DR002
  company_name: String (required),
  contact_person: String,
  phone: String (required),
  email: String,
  address: {
    street: String,
    city: String,
    state: String,
    pincode: String,
    country: String (default: "India")
  },
  gst_number: String,
  payment_terms: String,
  status: String (enum: ["active", "inactive"]),
  created_at: Date,
  updated_at: Date,
  notes: String
}
```

### Products Collection

```json
{
  _id: ObjectId,
  product_code: String (unique, auto-generated), // PR001, PR002
  name: String (required), // "Samsung 32 inch LED TV"
  model_number: String (required, unique), // "SA32LED2023" - KEY FIELD
  category_id: ObjectId (ref: Categories, required),
  dealer_id: ObjectId (ref: Dealers, required),

  // Pricing (only dealer price needed)
  dealer_price: Number (required), // What we pay to dealer

  // Stock Management
  stock: {
    current_quantity: Number (default: 0),
    minimum_stock_level: Number (default: 1),
    last_stock_update: Date,
    stock_history: [{
      date: Date,
      quantity_added: Number,
      total_quantity_after: Number,
      notes: String // "Initial stock", "Restocked from Samsung dealer"
    }]
  },

  // Status Management
  status: String (enum: ["in_stock", "out_of_stock", "discontinued"]),

  // Media
  image_ids: [ObjectId], // References to Media Center

  // Important Dates
  first_added_date: Date (required), // When product was first created
  last_updated_date: Date, // When stock was last updated

  // Metadata
  created_at: Date,
  updated_at: Date,
  description: String,
  specifications: Object, // Flexible specs
  tags: [String]
}
```

### Media Center Collection

```json
{
  _id: ObjectId,
  filename: String (required),
  original_name: String,
  cloudinary_url: String (required),
  cloudinary_public_id: String (required),
  file_type: String, // "image/jpeg", "image/png"
  file_size: Number,
  tags: [String], // "tv", "samsung", "electronics"
  usage_count: Number (default: 0), // How many products use this image
  uploaded_by: String,
  created_at: Date,
  is_active: Boolean (default: true)
}
```

### Party Ledger Collection

```json
{
  _id: ObjectId,
  ledger_id: String (unique, auto-generated), // LD001, LD002
  dealer_id: ObjectId (ref: Dealers),
  party_name: String (required), // Can be dealer name or other party

  // Transaction Details
  transaction_type: String (enum: ["due_added", "payment_made"]),
  amount: Number (required),
  description: String (required), // "Stock purchase - Invoice #123"
  reference_number: String, // Invoice number, receipt number

  // Dates
  transaction_date: Date (required),
  due_date: Date, // When payment is due

  // Status
  status: String (enum: ["pending", "partial", "paid", "overdue"]),

  // Metadata
  created_at: Date,
  updated_at: Date,
  notes: String
}
```

## Key Business Logic

### Product Management Flow

```javascript
// When adding/updating products
async function handleProductEntry(productData) {
  // Check if model number exists
  const existingProduct = await db.products.findOne({
    model_number: productData.model_number,
  });

  if (existingProduct) {
    // UPDATE STOCK - Same model found
    await updateStock(existingProduct._id, productData.quantity);
  } else {
    // CREATE NEW PRODUCT - New model
    await createNewProduct(productData);
  }
}

function updateStock(productId, newQuantity) {
  return db.products.updateOne(
    { _id: productId },
    {
      $inc: { "stock.current_quantity": newQuantity },
      $set: {
        "stock.last_stock_update": new Date(),
        last_updated_date: new Date(),
        status: calculateStatus(),
      },
      $push: {
        "stock.stock_history": {
          date: new Date(),
          quantity_added: newQuantity,
          total_quantity_after: currentQuantity + newQuantity,
          notes: "Stock updated",
        },
      },
    }
  );
}
```

### Stock Status Calculation

```javascript
function calculateStockStatus(currentQuantity) {
  if (currentQuantity <= 0) return "out_of_stock";
  return "in_stock";
}
```

## Key Relationships

1. **Categories → Products**: One-to-Many
2. **Dealers → Products**: One-to-Many
3. **Dealers → Party Ledger**: One-to-Many
4. **Products → Media Center**: Many-to-Many
5. **Media Center**: Shared resource (reusable images)

## API Endpoints Structure

### Categories

- `GET /api/categories` - List all categories
- `POST /api/categories` - Create category
- `PUT /api/categories/:id` - Update category
- `DELETE /api/categories/:id` - Delete category

### Dealers

- `GET /api/dealers` - List all dealers
- `POST /api/dealers` - Create dealer
- `GET /api/dealers/:id` - Get dealer details
- `PUT /api/dealers/:id` - Update dealer

### Products

- `GET /api/products` - List products with filters (category, date range, model)
- `POST /api/products` - Add new product OR update stock (based on model_number)
- `GET /api/products/:id` - Get product details
- `PUT /api/products/:id` - Update product info
- `GET /api/products/search?model_number=` - Search by model number
- `GET /api/products/filter?category=&date_from=&date_to=` - Advanced filtering

### Media Center

- `GET /api/media` - List all images with pagination
- `POST /api/media/upload` - Upload new image
- `DELETE /api/media/:id` - Delete image (check usage_count first)
- `GET /api/media/unused` - Get unused images for cleanup

### Party Ledger

- `GET /api/ledger` - List all ledger entries
- `POST /api/ledger/due` - Add new due amount
- `POST /api/ledger/payment` - Record payment
- `GET /api/ledger/summary` - Get total dues summary
- `GET /api/ledger/dealer/:dealerId` - Dealer-specific dues

### Dashboard & Reports

- `GET /api/dashboard/summary` - Total stocks, stock value, total dues
- `GET /api/reports/stock-value` - Total inventory value
- `GET /api/reports/category-wise` - Category-wise stock distribution
- `GET /api/reports/monthly-stock` - Monthly stock additions
- `GET /api/reports/dues-summary` - Outstanding dues summary

## Dashboard Metrics

### Stock Metrics

- Total Products Count
- Total Stock Quantity
- Total Stock Value (sum of all products _ dealer_price _ quantity)
- Low Stock Alerts
- Out of Stock Count

### Financial Metrics

- Total Outstanding Dues
- Recent Payments
- Overdue Amounts
- Category-wise Investment

### Activity Metrics

- Recent Stock Updates
- New Products Added (This Month)
- Stock Movement Trends

## Key Features Implementation

### 1. Model Number Management

- **Unique constraint** on model_number
- **Search functionality** to find existing products
- **Auto-suggestion** while typing model numbers

### 2. Date-based Filtering

- Filter by `first_added_date` (when product was created)
- Filter by `last_updated_date` (when stock was updated)
- Filter by `transaction_date` in ledger
- Monthly/Yearly grouping options

### 3. Media Center Efficiency

- **Reusable images** across products
- **Usage tracking** to prevent deleting used images
- **Tag-based organization** for easy searching
- **Cleanup tools** to remove unused images

### 4. Party Ledger Management

- **Manual entry system** (no auto-calculation)
- **Multiple payment tracking** for single due
- **Status management** (pending, partial, paid)
- **Due date tracking** with overdue alerts

## MongoDB Indexes (Critical for Performance)

```javascript
// Products
db.products.createIndex({ model_number: 1 }, { unique: true });
db.products.createIndex({ category_id: 1 });
db.products.createIndex({ dealer_id: 1 });
db.products.createIndex({ first_added_date: -1 });
db.products.createIndex({ last_updated_date: -1 });
db.products.createIndex({ status: 1 });

// Party Ledger
db.party_ledger.createIndex({ dealer_id: 1 });
db.party_ledger.createIndex({ transaction_date: -1 });
db.party_ledger.createIndex({ status: 1 });

// Media Center
db.media_center.createIndex({ tags: 1 });
db.media_center.createIndex({ usage_count: 1 });
```

This schema perfectly addresses all your requirements:

- ✅ Model-based product management
- ✅ Category filtering
- ✅ Date tracking and filtering
- ✅ Media center for image reuse
- ✅ Party ledger for dues tracking
- ✅ Dashboard with all key metrics
- ✅ Efficient search and filtering

# Inventory Management System Backend

## Testing the Dealer Endpoints

### Create Dealer (JSON-only endpoint)

````bash
# Test the /api/dealers/create-json endpoint first
curl -X POST http://localhost:8000/api/dealers/create-json \
-H "Content-Type: application/json" \
-d '{
  "company_name": "Test Company",
  "phone": "+919876543210",
  "contact_person": "John Doe",
  "email": "john@example.com",
  "address": {
    "street": "123 Main St",
    "city": "Mumbai",
    "state": "Maharashtra",
    "pincode": "400001",
    "country": "India"
  },
  "gst_number": "29GGGGG1314R9Z6",
  "payment_terms": "Net 30",
  "status": "active",
  "notes": "Test dealer entry"
}'

### Create Dealer with Image (Multipart Form)
```bash
# Only after JSON endpoint works, test the main endpoint with image upload
curl -X POST http://localhost:8000/api/dealers \
-F "dealer_data={\"company_name\":\"Test Company\",\"phone\":\"+919876543210\",\"email\":\"john@example.com\"}" \
-F "image=@/path/to/your/image.jpg"
````

Notes:

1. Required fields: `company_name`, `phone`
2. Phone number must be 10-15 digits with optional + prefix
3. Email must be valid format if provided
4. Image must be JPEG or PNG, max 5MB
5. GST number max length is 15 characters
