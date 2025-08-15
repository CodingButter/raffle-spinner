#!/bin/bash

# Setup subscription schema in Directus
echo "Setting up subscription schema in Directus..."

# Get admin token
TOKEN_RESPONSE=$(curl -s -X POST http://localhost:8055/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email": "admin@drawday.app", "password": "Speed4Dayz1!"}')

# Extract token (simple approach without jq)
TOKEN=$(echo $TOKEN_RESPONSE | sed 's/.*"access_token":"\([^"]*\)".*/\1/')

if [ -z "$TOKEN" ] || [ "$TOKEN" = "$TOKEN_RESPONSE" ]; then
  echo "Failed to get access token"
  exit 1
fi

echo "Got access token: ${TOKEN:0:20}..."

# Create subscription_tiers collection
echo "Creating subscription_tiers collection..."
curl -s -X POST http://localhost:8055/collections \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "collection": "subscription_tiers",
    "meta": {
      "collection": "subscription_tiers",
      "icon": "workspace_premium",
      "note": "Subscription tier definitions with limits and features",
      "display_template": "{{name}} - {{max_contestants}} contestants",
      "hidden": false,
      "singleton": false,
      "accountability": "all",
      "color": "#2196F3"
    },
    "schema": {
      "name": "subscription_tiers"
    },
    "fields": [
      {
        "field": "id",
        "type": "integer",
        "schema": {
          "is_primary_key": true,
          "has_auto_increment": true
        }
      },
      {
        "field": "sort",
        "type": "integer",
        "meta": {
          "hidden": true
        }
      },
      {
        "field": "status",
        "type": "string",
        "meta": {
          "interface": "select-dropdown",
          "options": {
            "choices": [
              {"text": "Published", "value": "published"},
              {"text": "Draft", "value": "draft"},
              {"text": "Archived", "value": "archived"}
            ]
          }
        },
        "schema": {
          "default_value": "draft"
        }
      },
      {
        "field": "name",
        "type": "string",
        "meta": {
          "required": true,
          "note": "Display name of the subscription tier"
        }
      },
      {
        "field": "tier_key",
        "type": "string",
        "meta": {
          "required": true,
          "note": "Unique key for the tier (starter, pro, etc.)"
        },
        "schema": {
          "is_unique": true
        }
      },
      {
        "field": "max_contestants",
        "type": "integer",
        "meta": {
          "note": "Maximum number of contestants allowed (null = unlimited)"
        }
      },
      {
        "field": "max_raffles",
        "type": "integer",
        "meta": {
          "note": "Maximum number of raffles allowed (null = unlimited)"
        }
      },
      {
        "field": "has_api_support",
        "type": "boolean",
        "meta": {
          "note": "Whether this tier includes API support"
        },
        "schema": {
          "default_value": false
        }
      },
      {
        "field": "has_branding",
        "type": "boolean",
        "meta": {
          "note": "Whether this tier includes branding features"
        },
        "schema": {
          "default_value": true
        }
      },
      {
        "field": "has_customization",
        "type": "boolean",
        "meta": {
          "note": "Whether this tier includes customization features"
        },
        "schema": {
          "default_value": true
        }
      }
    ]
  }' > /dev/null

echo "Created subscription_tiers collection"

# Create subscriptions collection
echo "Creating subscriptions collection..."
curl -s -X POST http://localhost:8055/collections \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "collection": "subscriptions",
    "meta": {
      "collection": "subscriptions",
      "icon": "card_membership",
      "note": "User subscription records",
      "display_template": "{{user.email}} - {{tier.name}}",
      "hidden": false,
      "singleton": false,
      "accountability": "all",
      "color": "#4CAF50"
    },
    "schema": {
      "name": "subscriptions"
    },
    "fields": [
      {
        "field": "id",
        "type": "integer",
        "schema": {
          "is_primary_key": true,
          "has_auto_increment": true
        }
      },
      {
        "field": "status",
        "type": "string",
        "meta": {
          "interface": "select-dropdown",
          "options": {
            "choices": [
              {"text": "Active", "value": "active"},
              {"text": "Inactive", "value": "inactive"},
              {"text": "Expired", "value": "expired"}
            ]
          }
        },
        "schema": {
          "default_value": "active"
        }
      },
      {
        "field": "user",
        "type": "uuid",
        "meta": {
          "required": true,
          "interface": "select-dropdown-m2o",
          "display": "related-values",
          "display_options": {
            "template": "{{email}}"
          }
        }
      },
      {
        "field": "tier",
        "type": "integer",
        "meta": {
          "required": true,
          "interface": "select-dropdown-m2o",
          "display": "related-values",
          "display_options": {
            "template": "{{name}}"
          }
        }
      },
      {
        "field": "product",
        "type": "string",
        "meta": {
          "required": true,
          "interface": "select-dropdown",
          "note": "Product type this subscription is for",
          "options": {
            "choices": [
              {"text": "Spinner", "value": "spinner"},
              {"text": "Streaming", "value": "streaming"},
              {"text": "Website", "value": "website"}
            ]
          }
        }
      },
      {
        "field": "starts_at",
        "type": "timestamp",
        "meta": {
          "interface": "datetime",
          "note": "When the subscription starts"
        }
      },
      {
        "field": "expires_at",
        "type": "timestamp",
        "meta": {
          "interface": "datetime",
          "note": "When the subscription expires (null = never expires)"
        }
      },
      {
        "field": "stripe_subscription_id",
        "type": "string",
        "meta": {
          "note": "Stripe subscription ID for paid subscriptions"
        }
      },
      {
        "field": "raffle_count",
        "type": "integer",
        "meta": {
          "note": "Number of raffles conducted (for tracking limits)"
        },
        "schema": {
          "default_value": 0
        }
      },
      {
        "field": "date_created",
        "type": "timestamp",
        "meta": {
          "special": ["date-created"],
          "interface": "datetime",
          "readonly": true,
          "hidden": true
        }
      },
      {
        "field": "date_updated",
        "type": "timestamp",
        "meta": {
          "special": ["date-updated"],
          "interface": "datetime",
          "readonly": true,
          "hidden": true
        }
      }
    ]
  }' > /dev/null

echo "Created subscriptions collection"

# Create relations
echo "Creating relations..."

# User relation
curl -s -X POST http://localhost:8055/relations \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "collection": "subscriptions",
    "field": "user",
    "related_collection": "directus_users"
  }' > /dev/null

# Tier relation  
curl -s -X POST http://localhost:8055/relations \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "collection": "subscriptions",
    "field": "tier",
    "related_collection": "subscription_tiers"
  }' > /dev/null

echo "Created relations"

# Create subscription tiers
echo "Creating subscription tier data..."

# Starter tier
STARTER_ID=$(curl -s -X POST http://localhost:8055/items/subscription_tiers \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "status": "published",
    "name": "Starter",
    "tier_key": "starter",
    "max_contestants": 1000,
    "max_raffles": 5,
    "has_api_support": false,
    "has_branding": true,
    "has_customization": true
  }' | sed 's/.*"id":\([0-9]*\).*/\1/')

echo "Created Starter tier with ID: $STARTER_ID"

# Pro tier
PRO_ID=$(curl -s -X POST http://localhost:8055/items/subscription_tiers \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "status": "published", 
    "name": "Pro",
    "tier_key": "pro",
    "max_contestants": null,
    "max_raffles": null,
    "has_api_support": true,
    "has_branding": true,
    "has_customization": true
  }' | sed 's/.*"id":\([0-9]*\).*/\1/')

echo "Created Pro tier with ID: $PRO_ID"

# Get admin user ID
USER_ID=$(curl -s -X GET "http://localhost:8055/users/me" \
  -H "Authorization: Bearer $TOKEN" | sed 's/.*"id":"\([^"]*\)".*/\1/')

echo "Admin user ID: $USER_ID"

# Create subscription for admin user
echo "Creating starter subscription for admin@drawday.app..."
curl -s -X POST http://localhost:8055/items/subscriptions \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d "{
    \"status\": \"active\",
    \"user\": \"$USER_ID\",
    \"tier\": $STARTER_ID,
    \"product\": \"spinner\",
    \"starts_at\": \"$(date -u +%Y-%m-%dT%H:%M:%S.000Z)\",
    \"expires_at\": null,
    \"stripe_subscription_id\": null,
    \"raffle_count\": 0
  }" > /dev/null

echo "Created starter subscription for admin@drawday.app"
echo "Setup complete!"