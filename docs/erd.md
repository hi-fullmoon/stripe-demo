# Entity Relationship Diagram

This ERD is automatically generated from the Prisma schema.

```mermaid
erDiagram

  %% User: 系统用户表
  User {
    id String {PK}
  }

  %% Customer: 可能会涉及到迁移，之前的用户没有关联到该表
  Customer {
    id String {PK}
    userId String
    email String {U}
    stripeCustomerId String {O,U}
    subscription Subscription？
    payments Payment
    createdAt DateTime
    updatedAt DateTime
  }

  %% Payment: 支付表
  Payment {
    id String {PK}
    amount Float
    currency String
    status PaymentStatus
    stripePaymentId String {U}
    customerId String
    customer Customer
    createdAt DateTime
    updatedAt DateTime
  }

  %% Subscription: 订阅表
  Subscription {
    id String {PK}
    stripeSubscriptionId String {U}
    status SubscriptionStatus
    customerId String
    user Customer
    plan PlanType
    startDate DateTime
    endDate DateTime
    createdAt DateTime
    updatedAt DateTime
  }

  %% FeatureUsage: 功能使用情况表
  FeatureUsage {
    id String {PK}
    customerId String
    customer Customer
    featureCode String
    used Float
    createdAt DateTime
    updatedAt DateTime
    @@unique([customerId, featureCode])
  }

  %% Relationships
  Payment ||--|| Customer : "customer"
  Subscription ||--|| Customer : "user"
  FeatureUsage ||--|| Customer : "customer"

  %% Enums
  PaymentStatus {
    PENDING
    SUCCEEDED
    FAILED
  }

  SubscriptionStatus {
    ACTIVE
    CANCELED
    PAST_DUE
    UNPAID
    TRIAL
  }

  PlanType {
    FREE
    BASIC
    PRO
    ENTERPRISE
  }


```

## Legend

### Field Attributes
- PK: Primary Key
- U: Unique
- O: Optional (Nullable)
- D: Default Value

### Relationships
- ||--||: One-to-One
- ||--o{: One-to-Many

### Notes
- Model comments are shown as %% comments
- Enum types are shown as separate entities
