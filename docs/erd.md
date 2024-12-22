# Entity Relationship Diagram

This ERD is automatically generated from the Prisma schema.

```mermaid
erDiagram

  %% User: 系统用户表
  User {
    id String PK 主键 自动生成 UUID
  }

  %% Customer: 可能会涉及到迁移，之前的用户没有关联到该表
  Customer {
    id String PK 主键 自动生成 UUID
    userId String 系统用户 userId
    email String U 客户邮箱
    stripeCustomerId String O,U Stripe 客户 Id 可选 免费版没有绑定 stripe customer id
    subscription Subscription？ 一对一关系：用户的订阅 可选
    payments Payment[] 一对多关系：用户的支付记录
    createdAt DateTime 创建时间
    updatedAt DateTime 更新时间
  }

  %% Payment: 支付表
  Payment {
    id String PK
    amount Float 支付金额
    currency String 货币类型
    status PaymentStatus 支付状态（枚举类型）
    stripePaymentId String U Stripe 支付 Id
    customerId String 外键：用户 Id
    customer Customer 关联用户
    createdAt DateTime 创建时间
    updatedAt DateTime 更新时间
  }

  %% Subscription: 订阅表
  Subscription {
    id String PK
    stripeSubscriptionId String U Stripe 订阅 Id
    status SubscriptionStatus 订阅状态（枚举类型）
    customerId String 外键：用户 Id
    user Customer
    plan PlanType 订阅计划类型
    startDate DateTime 当前订阅周期开始时间
    endDate DateTime 当前订阅周期结束时间
    createdAt DateTime 创建时间
    updatedAt DateTime 更新时间
  }

  %% FeatureUsage: 功能使用情况表
  FeatureUsage {
    id String PK
    customerId String
    customer Customer
    featureCode String 对应 FeatureCode
    used Float 已使用量
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
