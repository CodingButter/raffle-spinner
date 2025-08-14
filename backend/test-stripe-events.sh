#!/bin/bash

echo "🧪 Stripe Event Testing Script"
echo "================================"
echo ""

# Make sure we have a user ID to test with
USER_ID="REPLACE_WITH_ACTUAL_USER_ID"  # You'll need to get this from Directus

echo "📝 Available test commands:"
echo ""
echo "1. Test subscription creation:"
echo "   ~/bin/stripe trigger customer.subscription.created"
echo ""
echo "2. Test subscription update:"
echo "   ~/bin/stripe trigger customer.subscription.updated"
echo ""
echo "3. Test subscription cancellation:"
echo "   ~/bin/stripe trigger customer.subscription.deleted"
echo ""
echo "4. Test payment success:"
echo "   ~/bin/stripe trigger invoice.payment_succeeded"
echo ""
echo "5. Test payment failure:"
echo "   ~/bin/stripe trigger invoice.payment_failed"
echo ""
echo "6. Test complete checkout flow:"
echo "   ~/bin/stripe trigger checkout.session.completed"
echo ""
echo "7. Test customer portal changes:"
echo "   ~/bin/stripe trigger billing_portal.session.created"
echo ""

echo "🎯 To test with specific user metadata:"
echo "   ~/bin/stripe trigger customer.subscription.created \\"
echo "     --add metadata.directus_user_id=$USER_ID"
echo ""

echo "📊 Check results:"
echo "   node /home/codingbutter/GitHub/raffle-spinner/backend/check-users.js"
echo ""

# Example: Trigger subscription created event
echo "Running test subscription creation..."
~/bin/stripe trigger customer.subscription.created