# Entity Relationship Diagram

This ERD is automatically generated from the Prisma schema.

```mermaid
erDiagram

  %% User: 系统用户表
  User {
  }

  %% Workspace: 工作空间表
  Workspace {
  }

  %% PaymentUser: 支付用户表
  PaymentUser {
  }

  %% Payment: 支付记录表
  Payment {
  }

  %% Subscription: 订阅表
  Subscription {
  }

  %% FeatureUsage: 功能使用情况表
  FeatureUsage {
  }

  %% Credit: 充值余额表
  Credit {
  }

  %% CreditRecord: 充值记录表
  CreditRecord {
  }

  %% CreditUsage: 充值使用记录表
  CreditUsage {
  }

  %% AIUsage: AI 使用记录表
  AIUsage {
  }

  %% Relationships
  Payment ||--|| String : "id"
  Subscription ||--|| String : "id"
  FeatureUsage ||--|| String : "id"
  Credit ||--|| String : "id"
  CreditRecord ||--|| String : "id"
  CreditUsage ||--|| String : "id"
  AIUsage ||--|| String : "id"

  %% Enums
  PaymentStatus {
    type ENUM "PENDING|SUCCEEDED|FAILED"
  }

  SubscriptionStatus {
    type ENUM "ACTIVE|CANCELED|PAST_DUE|UNPAID|TRIAL"
  }

  PlanType {
    type ENUM "FREE|BASIC|PRO|ENTERPRISE"
  }

  PaymentPlatform {
    type ENUM "STRIPE"
  }

  UsageStatus {
    type ENUM "SUCCEEDED|FAILED|REFUNDED"
  }

  CreditType {
    type ENUM "PURCHASE"
  }

  AIUsageType {
    type ENUM "TEXT_CHAT|IMAGE_GENERATION"
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
