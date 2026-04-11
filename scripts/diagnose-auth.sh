#!/bin/bash

# Auth Login Diagnostic Script
# Run this to check if your auth infrastructure is properly configured

echo "🔍 BillDesk Auth Login Diagnostic Tool"
echo "========================================"
echo ""

# Colors
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

check_url() {
    local url=$1
    local description=$2
    
    echo -n "Checking $description... "
    
    local http_code
    http_code=$(curl -s -o /dev/null -w "%{http_code}" "$url" --max-time 10 2>/dev/null)
    
    if [ "$http_code" = "200" ] || [ "$http_code" = "301" ] || [ "$http_code" = "302" ]; then
        echo -e "${GREEN}✓ OK (HTTP $http_code)${NC}"
        return 0
    else
        echo -e "${RED}✗ FAILED (HTTP $http_code)${NC}"
        return 1
    fi
}

echo "1️⃣  Checking Auth Hub Accessibility"
echo "------------------------------------"
check_url "https://auth.mondalfishcenter.com/login?app=manager&platform=web" "Auth Hub (Manager Web Login)"
check_url "https://auth.mondalfishcenter.com/login?app=admin&platform=mobile" "Auth Hub (Admin Mobile Login)"
check_url "https://auth.mondalfishcenter.com/login?app=user&platform=mobile" "Auth Hub (User Mobile Login)"
echo ""

echo "2️⃣  Checking Web Manager Callback Pages"
echo "----------------------------------------"
check_url "https://manager.bill.mondalfishcenter.com/auth/callback" "Web Manager OAuth Callback"
check_url "https://manager.bill.mondalfishcenter.com/auth/desktop-callback" "Desktop Callback Page"
check_url "https://manager.bill.mondalfishcenter.com/auth/login" "Web Manager Login Page"
echo ""

echo "3️⃣  Checking Environment Variables"
echo "-----------------------------------"
if [ -f ".env" ]; then
    echo -e "${GREEN}✓ .env file exists${NC}"
    
    if grep -q "NEXT_PUBLIC_SUPABASE_URL" .env; then
        supabase_url=$(grep "NEXT_PUBLIC_SUPABASE_URL" .env | head -1 | cut -d '=' -f2-)
        echo -e "${GREEN}✓ NEXT_PUBLIC_SUPABASE_URL is set${NC}"
    else
        echo -e "${RED}✗ NEXT_PUBLIC_SUPABASE_URL is missing${NC}"
    fi
    
    if grep -q "NEXT_PUBLIC_SUPABASE_ANON_KEY" .env; then
        echo -e "${GREEN}✓ NEXT_PUBLIC_SUPABASE_ANON_KEY is set${NC}"
    else
        echo -e "${RED}✗ NEXT_PUBLIC_SUPABASE_ANON_KEY is missing${NC}"
    fi
    
    if grep -q "EXPO_PUBLIC_SUPABASE_URL" .env; then
        echo -e "${GREEN}✓ EXPO_PUBLIC_SUPABASE_URL is set${NC}"
    else
        echo -e "${YELLOW}⚠ EXPO_PUBLIC_SUPABASE_URL is missing (mobile apps need this)${NC}"
    fi
    
    if grep -q "EXPO_PUBLIC_SUPABASE_ANON_KEY" .env; then
        echo -e "${GREEN}✓ EXPO_PUBLIC_SUPABASE_ANON_KEY is set${NC}"
    else
        echo -e "${YELLOW}⚠ EXPO_PUBLIC_SUPABASE_ANON_KEY is missing (mobile apps need this)${NC}"
    fi
    
    if grep -q "MANAGER_OAUTH_REDIRECT_URL" .env; then
        redirect_url=$(grep "MANAGER_OAUTH_REDIRECT_URL" .env | head -1 | cut -d '=' -f2-)
        echo -e "${GREEN}✓ MANAGER_OAUTH_REDIRECT_URL is set to: $redirect_url${NC}"
    else
        echo -e "${YELLOW}⚠ MANAGER_OAUTH_REDIRECT_URL is missing (desktop needs this)${NC}"
    fi
else
    echo -e "${RED}✗ .env file not found${NC}"
fi
echo ""

echo "4️⃣  Checking App Configurations"
echo "--------------------------------"
if [ -f "apps/mobile/manager/app.config.ts" ]; then
    if grep -q "scheme: 'mfcmanager'" apps/mobile/manager/app.config.ts; then
        echo -e "${GREEN}✓ Manager mobile scheme configured (mfcmanager)${NC}"
    else
        echo -e "${RED}✗ Manager mobile scheme missing${NC}"
    fi
fi

if [ -f "apps/mobile/admin/app.config.ts" ]; then
    if grep -q "scheme: 'mfcadmin'" apps/mobile/admin/app.config.ts; then
        echo -e "${GREEN}✓ Admin mobile scheme configured (mfcadmin)${NC}"
    else
        echo -e "${RED}✗ Admin mobile scheme missing${NC}"
    fi
fi

if [ -f "apps/mobile/user/app.config.ts" ]; then
    if grep -q "scheme: 'mfcuser'" apps/mobile/user/app.config.ts; then
        echo -e "${GREEN}✓ User mobile scheme configured (mfcuser)${NC}"
    else
        echo -e "${RED}✗ User mobile scheme missing${NC}"
    fi
fi
echo ""

echo "5️⃣  Checking Auth Hub Configuration"
echo "------------------------------------"
if [ -f "apps/auth/lib/config.ts" ]; then
    if grep -q "mfcmanager://oauth-callback" apps/auth/lib/config.ts; then
        echo -e "${GREEN}✓ Manager mobile destination configured${NC}"
    else
        echo -e "${RED}✗ Manager mobile destination missing${NC}"
    fi
    
    if grep -q "mfcadmin://oauth-callback" apps/auth/lib/config.ts; then
        echo -e "${GREEN}✓ Admin mobile destination configured${NC}"
    else
        echo -e "${RED}✗ Admin mobile destination missing${NC}"
    fi
    
    if grep -q "mfcuser://oauth-callback" apps/auth/lib/config.ts; then
        echo -e "${GREEN}✓ User mobile destination configured${NC}"
    else
        echo -e "${RED}✗ User mobile destination missing${NC}"
    fi
else
    echo -e "${RED}✗ Auth hub config not found${NC}"
fi
echo ""

echo "========================================"
echo "📋 Next Steps:"
echo "========================================"
echo ""
echo "1. Verify these URLs are in your Supabase redirect allowlist:"
echo "   - https://manager.bill.mondalfishcenter.com/auth/callback"
echo "   - https://manager.bill.mondalfishcenter.com/auth/desktop-callback"
echo "   - mfcmanager://oauth-callback"
echo "   - mfcadmin://oauth-callback"
echo "   - mfcuser://oauth-callback"
echo ""
echo "2. Check Supabase dashboard:"
echo "   - Authentication → Providers → Google (enabled?)"
echo "   - Authentication → URL Configuration (redirect URLs added?)"
echo ""
echo "3. Test mobile deep linking:"
echo "   - iOS: xcrun simctl openurl booted 'mfcmanager://oauth-callback'"
echo "   - Android: adb shell am start -W -a android.intent.action.VIEW -d 'mfcmanager://oauth-callback' com.mfc.manager"
echo ""
echo "4. Read AUTH_LOGIN_FIX.md for detailed troubleshooting"
echo ""
