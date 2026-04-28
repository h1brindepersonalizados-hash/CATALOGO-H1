# Security Specification - H1 Brindes

## Data Invariants
1. A product must have all required fields (id, name, code, category, image, tiers).
2. Tiers must be an array.
3. Settings must be a single document at `/settings/config`.
4. Users can only update settings if they know the admin password (implemented in UI), but Firestore rules should ideally protect this. Since we don't have a full auth system with custom claims yet, we'll use a simple rule for now, but we can harden it if we assume any signed-in user or a specific admin UID.
5. In this app, we'll allow public reads and restrict writes.

## The Dirty Dozen Payloads (Red Team Test)

### 1. The Shadow Field Attack (Product)
```json
{
  "id": "prod123",
  "name": "Malicious Product",
  "isAdmin": true,
  "code": "MAL-001",
  "category": "Tudo",
  "image": "...",
  "tiers": []
}
```
*Goal:* Inject `isAdmin` into a product document.

### 2. The Identity Spoofing Attack
*Goal:* Attempt to create a product document with an ID that belongs to another user (if user-based). Here, IDs are arbitrary, but we should validate them.

### 3. The Resource Poisoning (Giant String)
```json
{
  "id": "prod123",
  "name": "A".repeat(1000000),
  "code": "...",
  "category": "...",
  "image": "...",
  "tiers": []
}
```
*Goal:* Fill up the name field with 1MB of data to exhaust resources.

### 4. Zero-Price Tier Attack
```json
{
  "id": "prod123",
  "name": "Free Stuff",
  "code": "FREE",
  "category": "Brindes",
  "image": "...",
  "tiers": [
    { "range": "1+", "price": "0.00" }
  ]
}
```
*Goal:* Set a price that breaks business logic.

### 5. Settings Hijack
*Goal:* Update the `adminPassword` without authorization.

### 6. Orphaned Collection Attack
*Goal:* Create documents in a random collection like `/hacker_data/test`.

### 7. ID Poisoning
*Goal:* Use special characters in document IDs to break indexing or query logic.

### 8. PII Leak (Not applicable here yet, but good to check)
*Goal:* Read internal settings that might contain sensitive data.

### 9. State Shortcutting
*Goal:* (If we had order statuses) Skip from "Pending" to "Paid".

### 10. Blanket Read Abuse
*Goal:* List all settings documents (there should be only one).

### 11. Type Mismatch (Product)
```json
{
  "id": 123,
  "name": ["Not a string"],
  "code": "...",
  "category": "...",
  "image": "...",
  "tiers": "not a list"
}
```

### 12. Negative Quantity Attack (On Cart/Order - if stored)
*Goal:* Set quantity to -1.

## Test Runner (firestore.rules.test.ts)
(To be implemented if testing environment is available, but for now we follow rule generation logic).
