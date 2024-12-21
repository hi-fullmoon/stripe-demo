# Entity Relationship Diagram

This ERD is automatically generated from the MySQL schema.

```mermaid
erDiagram

  User {
    UUID id PK "主键"
    VARCHAR email "邮箱"
    TIMESTAMP createdAt "创建时间"
    TIMESTAMP updatedAt "更新时间"
  }

  Customer {
    UUID id PK "主键"
    UUID userId FK "用户ID"
    VARCHAR email "邮箱"
    VARCHAR stripeCustomerId "Stripe客户ID"
    UUID subscriptionId FK "订阅ID"
    TIMESTAMP createdAt "创建时间"
    TIMESTAMP updatedAt "更新时间"
  }

  Subscription {
    UUID id PK "主键"
    UUID customerId FK "客户ID"
    UUID planId "套餐ID"
    TIMESTAMP startDate "开始时间"
    TIMESTAMP endDate "结束时间"
    TIMESTAMP createdAt "创建时间"
    TIMESTAMP updatedAt "更新时间"
  }

  Payment {
    UUID id PK "主键"
    FLOAT amount "支付金额"
    VARCHAR currency "货币类型"
    VARCHAR status "支付状态"
    VARCHAR stripePaymentId "Stripe支付ID"
    UUID customerId FK "客户ID"
    TIMESTAMP createdAt "创建时间"
    TIMESTAMP updatedAt "更新时间"
  }

  FeatureUsage {
    UUID id PK "主键"
    UUID customerId FK "客户ID"
    VARCHAR featureCode "功能代码"
    FLOAT used "使用量"
    TIMESTAMP createdAt "创建时间"
    TIMESTAMP updatedAt "更新时间"
  }

  User ||--o{ Customer : "has"
  Customer ||--|| Subscription : "has"
  Customer ||--o{ Payment : "has"
  Customer ||--o{ FeatureUsage : "records usage"
```

## Legend

### Field Types

- UUID: Universally Unique Identifier
- VARCHAR: Variable-length character string
- TIMESTAMP: Date and time
- FLOAT: Floating-point number

### Field Attributes

- PK: Primary Key
- FK: Foreign Key

### Relationships

- ||--||: One-to-One
- ||--o{: One-to-Many

### Notes

- All tables include created_at and updated_at timestamps for auditing
- UUID is used as the primary key type across all tables
- Foreign keys maintain referential integrity between tables

