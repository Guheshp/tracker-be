## 1. Create Expense

**POST** `/api/expenses/create`

### Request Body

```json
{
  "title": "Lunch",
  "amount": 250,
  "userId": "USER_UUID",
  "type": 1,
  "category": 1,
  "paymentMethod": 2,
  "expenseDate": 1757912400000,
  "description": "Lunch with friends"
}
```

### Fields

| Field           | Type    | Required                |
| --------------- | ------- | ----------------------- |
| `title`         | String  | Yes                     |
| `amount`        | Number  | Yes, > 0                |
| `type`          | Integer | Yes                     |
| `category`      | Integer | no                      |
| `paymentMethod` | Integer | no                      |
| `expenseDate`   | Number  | Yes, 13-digit timestamp |
| `description`   | String  | No                      |

---

## 2. Get All Expenses

**GET** `/api/expenses/get`

Returns only active expenses (`status = 1`).

Results are sorted by `createdAt` descending, so the newest expense comes first.

### Response

```json
{
  "success": true,
  "data": []
}
```

---

## 3. Get Expense By ID

**GET** `/api/expenses/get/:expenseId`

### Example

```text
GET /api/expenses/7c8e5d4a-1234-4567-8901-abcdef123456
```

The expense must belong to the logged-in user.

### Response

```json
{
  "success": true,
  "data": {}
}
```

If not found:

```json
{
  "success": false,
  "message": "Expense not found"
}
```

---

## 4. Update Expense

**PUT** `/api/expenses/edit`

### Required Fields

Only `amount` and `type` are mandatory.

### Request Body

```json
{
  "amount": 500,
  "type": 1
}
```

### Optional Fields

```json
{
  "title": "Dinner",
  "amount": 500,
  "type": 1,
  "category": 1,
  "paymentMethod": 2,
  "expenseDate": 1757912400000,
  "description": "Dinner"
}
```

`amount` must be greater than `0`.

---

## 5. Delete Expense

**DELETE** `/api/expenses/delete`

This is a **soft delete**.

The record is not removed from the database. Its status changes:

```text
1  = Active
-1 = Inactive/Deleted
```

### Example

```text
DELETE /api/expenses/7c8e5d4a-1234-4567-8901-abcdef123456
```

After deletion, the expense will no longer appear in the normal **Get All Expenses** API.

---

# Constants

## Type

```js
const EXPENSE_TYPE = {
  1: "Expense",
  2: "Income",
};
```

## Category

```js
const EXPENSE_CATEGORY = {
  1: "Food",
  2: "Travel",
  3: "Rent",
  4: "Shopping",
  5: "Bills",
  6: "Entertainment",
  7: "Health",
  8: "Education",
  9: "Investment",
  10: "Salary",
  11: "Groceries",
  12: "Subscriptions",
  13: "Fuel",
  14: "Personal",
  15: "Other",
};
```

## Payment Method

```js
const PAYMENT_METHOD = {
  1: "Cash",
  2: "UPI",
  3: "Credit Card",
  4: "Debit Card",
  5: "Bank Transfer",
  6: "Other",
};
```

# Important

- Send `type`, `category`, and `paymentMethod` as integers.
- Send `expenseDate` as a **13-digit Unix timestamp in milliseconds**.
- Do not send `userId`.
- `amount` must be greater than `0`.
- `description` is optional.
- Deleted expenses have `status = -1`.
- `createdAt` and `updatedAt` are automatically managed by Sequelize.
