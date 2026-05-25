#!/usr/bin/env python3
"""
Comprehensive backend API test suite for AlGloryThm
Tests all endpoints defined in /app/app/api/[[...path]]/route.js
"""

import requests
import json
import time
from datetime import datetime

# Base URL from .env
BASE_URL = "https://276fe8a9-715d-4fff-9bbb-775cf535cdc3.preview.emergentagent.com/api"

# Admin credentials from .env
ADMIN_EMAIL = "admin@alglorythm.com"
ADMIN_PASSWORD = "AlGlory@2025"

# Global variables to store data between tests
admin_token = None
created_lead_id = None
blog_slug = None
event_id = None
test_user_email = None

def print_test_header(test_name):
    print(f"\n{'='*80}")
    print(f"TEST: {test_name}")
    print(f"{'='*80}")

def print_result(success, message):
    status = "✅ PASS" if success else "❌ FAIL"
    print(f"{status}: {message}")

def test_1_health_check():
    """Test GET /api - health check endpoint"""
    print_test_header("1. Health Check GET /api")
    try:
        response = requests.get(BASE_URL, timeout=10)
        print(f"Status Code: {response.status_code}")
        print(f"Response: {response.text}")
        
        if response.status_code == 200:
            data = response.json()
            if data.get('success') and data.get('message') == 'AlGloryThm API is live' and 'timestamp' in data:
                print_result(True, "Health check endpoint working correctly")
                return True
            else:
                print_result(False, f"Unexpected response structure: {data}")
                return False
        else:
            print_result(False, f"Expected 200, got {response.status_code}")
            return False
    except Exception as e:
        print_result(False, f"Exception: {str(e)}")
        return False

def test_2_create_lead():
    """Test POST /api/leads - public lead creation"""
    print_test_header("2. Lead Creation POST /api/leads")
    global created_lead_id
    
    # Test successful lead creation
    try:
        lead_data = {
            "firstName": "Rajesh",
            "lastName": "Kumar",
            "email": f"rajesh.kumar+{int(time.time())}@techcorp.in",
            "phone": "+91-9876543210",
            "company": "TechCorp India",
            "serviceType": "AI_AUTOMATION",
            "message": "We need AI automation for our customer support operations",
            "budget": "50000-100000",
            "timeline": "3-6 months"
        }
        
        response = requests.post(f"{BASE_URL}/leads", json=lead_data, timeout=10)
        print(f"Status Code: {response.status_code}")
        print(f"Response: {response.text}")
        
        if response.status_code == 201:
            data = response.json()
            if data.get('success') and 'data' in data and 'id' in data['data']:
                created_lead_id = data['data']['id']
                print_result(True, f"Lead created successfully with ID: {created_lead_id}")
                
                # Verify lead data
                lead = data['data']
                if lead['firstName'] == lead_data['firstName'] and lead['email'] == lead_data['email']:
                    print_result(True, "Lead data matches input")
                else:
                    print_result(False, "Lead data doesn't match input")
                    return False
                return True
            else:
                print_result(False, f"Unexpected response structure: {data}")
                return False
        else:
            print_result(False, f"Expected 201, got {response.status_code}")
            return False
    except Exception as e:
        print_result(False, f"Exception during lead creation: {str(e)}")
        return False
    
    # Test validation - missing required fields
    print("\n--- Testing validation (missing firstName) ---")
    try:
        invalid_data = {"email": "test@example.com"}
        response = requests.post(f"{BASE_URL}/leads", json=invalid_data, timeout=10)
        print(f"Status Code: {response.status_code}")
        print(f"Response: {response.text}")
        
        if response.status_code == 400:
            print_result(True, "Validation working - returns 400 for missing firstName")
        else:
            print_result(False, f"Expected 400 for validation error, got {response.status_code}")
    except Exception as e:
        print_result(False, f"Exception during validation test: {str(e)}")

def test_3_list_leads_auth():
    """Test GET /api/leads - admin-only endpoint"""
    print_test_header("3. List Leads GET /api/leads (Admin-only)")
    
    # Test without token - should return 401
    print("--- Testing without Authorization header ---")
    try:
        response = requests.get(f"{BASE_URL}/leads", timeout=10)
        print(f"Status Code: {response.status_code}")
        print(f"Response: {response.text}")
        
        if response.status_code == 401:
            print_result(True, "Correctly returns 401 without auth token")
        else:
            print_result(False, f"Expected 401 without token, got {response.status_code}")
            return False
    except Exception as e:
        print_result(False, f"Exception: {str(e)}")
        return False
    
    # First, login to get admin token
    print("\n--- Logging in as admin to get token ---")
    global admin_token
    try:
        login_response = requests.post(
            f"{BASE_URL}/auth/login",
            json={"email": ADMIN_EMAIL, "password": ADMIN_PASSWORD},
            timeout=10
        )
        print(f"Login Status Code: {login_response.status_code}")
        
        if login_response.status_code == 200:
            login_data = login_response.json()
            admin_token = login_data['data']['token']
            print_result(True, f"Admin login successful, token obtained")
        else:
            print_result(False, f"Admin login failed: {login_response.text}")
            return False
    except Exception as e:
        print_result(False, f"Exception during admin login: {str(e)}")
        return False
    
    # Test with valid admin token
    print("\n--- Testing with valid admin token ---")
    try:
        headers = {"Authorization": f"Bearer {admin_token}"}
        response = requests.get(f"{BASE_URL}/leads", headers=headers, timeout=10)
        print(f"Status Code: {response.status_code}")
        print(f"Response length: {len(response.text)} chars")
        
        if response.status_code == 200:
            data = response.json()
            if data.get('success') and isinstance(data.get('data'), list):
                leads = data['data']
                print_result(True, f"Successfully retrieved {len(leads)} leads")
                
                # Verify our created lead is in the list
                if created_lead_id:
                    found = any(lead['id'] == created_lead_id for lead in leads)
                    if found:
                        print_result(True, f"Created lead {created_lead_id} found in list")
                    else:
                        print_result(False, f"Created lead {created_lead_id} NOT found in list")
                        return False
                return True
            else:
                print_result(False, f"Unexpected response structure: {data}")
                return False
        else:
            print_result(False, f"Expected 200, got {response.status_code}")
            return False
    except Exception as e:
        print_result(False, f"Exception: {str(e)}")
        return False

def test_4_update_lead_status():
    """Test PATCH /api/leads/:id - admin-only lead status update"""
    print_test_header("4. Update Lead Status PATCH /api/leads/:id")
    
    if not created_lead_id:
        print_result(False, "No lead ID available from previous test")
        return False
    
    # Test without token - should return 401
    print("--- Testing without Authorization header ---")
    try:
        response = requests.patch(
            f"{BASE_URL}/leads/{created_lead_id}",
            json={"leadStatus": "CONTACTED"},
            timeout=10
        )
        print(f"Status Code: {response.status_code}")
        
        if response.status_code == 401:
            print_result(True, "Correctly returns 401 without auth token")
        else:
            print_result(False, f"Expected 401 without token, got {response.status_code}")
    except Exception as e:
        print_result(False, f"Exception: {str(e)}")
    
    # Test with valid admin token
    print("\n--- Testing with valid admin token ---")
    try:
        headers = {"Authorization": f"Bearer {admin_token}"}
        response = requests.patch(
            f"{BASE_URL}/leads/{created_lead_id}",
            json={"leadStatus": "CONTACTED"},
            headers=headers,
            timeout=10
        )
        print(f"Status Code: {response.status_code}")
        print(f"Response: {response.text}")
        
        if response.status_code == 200:
            print_result(True, "Lead status updated successfully")
            
            # Verify the update by fetching leads again
            print("\n--- Verifying status update ---")
            verify_response = requests.get(f"{BASE_URL}/leads", headers=headers, timeout=10)
            if verify_response.status_code == 200:
                leads = verify_response.json()['data']
                updated_lead = next((l for l in leads if l['id'] == created_lead_id), None)
                if updated_lead and updated_lead['leadStatus'] == 'CONTACTED':
                    print_result(True, "Lead status verified as CONTACTED")
                    return True
                else:
                    print_result(False, f"Lead status not updated correctly: {updated_lead}")
                    return False
        else:
            print_result(False, f"Expected 200, got {response.status_code}")
            return False
    except Exception as e:
        print_result(False, f"Exception: {str(e)}")
        return False

def test_5_list_blogs():
    """Test GET /api/blogs - auto-seeds 4 sample blogs"""
    print_test_header("5. List Blogs GET /api/blogs (Auto-seeding)")
    global blog_slug
    
    try:
        # First call - should auto-seed if empty
        response = requests.get(f"{BASE_URL}/blogs", timeout=10)
        print(f"Status Code: {response.status_code}")
        print(f"Response length: {len(response.text)} chars")
        
        if response.status_code == 200:
            data = response.json()
            if data.get('success') and isinstance(data.get('data'), list):
                blogs = data['data']
                print_result(True, f"Successfully retrieved {len(blogs)} blogs")
                
                if len(blogs) >= 4:
                    print_result(True, "At least 4 blogs present (auto-seeding worked)")
                else:
                    print_result(False, f"Expected at least 4 blogs, got {len(blogs)}")
                    return False
                
                # Verify blog structure
                first_blog = blogs[0]
                required_fields = ['id', 'title', 'slug', 'excerpt', 'thumbnail', 'author', 
                                 'categories', 'tags', 'views', 'published', 'createdAt']
                missing_fields = [f for f in required_fields if f not in first_blog]
                
                if missing_fields:
                    print_result(False, f"Missing fields in blog: {missing_fields}")
                    return False
                else:
                    print_result(True, "Blog structure correct with all required fields")
                
                # Verify content field is excluded
                if 'content' in first_blog:
                    print_result(False, "Content field should be excluded from list response")
                    return False
                else:
                    print_result(True, "Content field correctly excluded from list")
                
                # Store a slug for next test
                blog_slug = first_blog['slug']
                print(f"Stored blog slug for detail test: {blog_slug}")
                
                # Second call - should return same blogs (no duplicates)
                print("\n--- Testing idempotency (second call) ---")
                response2 = requests.get(f"{BASE_URL}/blogs", timeout=10)
                if response2.status_code == 200:
                    blogs2 = response2.json()['data']
                    if len(blogs2) == len(blogs):
                        print_result(True, f"Second call returns same count ({len(blogs2)}) - no duplicates")
                        return True
                    else:
                        print_result(False, f"Blog count changed: {len(blogs)} -> {len(blogs2)}")
                        return False
            else:
                print_result(False, f"Unexpected response structure: {data}")
                return False
        else:
            print_result(False, f"Expected 200, got {response.status_code}")
            return False
    except Exception as e:
        print_result(False, f"Exception: {str(e)}")
        return False

def test_6_blog_detail():
    """Test GET /api/blogs/:slug - get blog detail and increment views"""
    print_test_header("6. Blog Detail GET /api/blogs/:slug")
    
    if not blog_slug:
        print_result(False, "No blog slug available from previous test")
        return False
    
    try:
        # First call - get blog and note views count
        response1 = requests.get(f"{BASE_URL}/blogs/{blog_slug}", timeout=10)
        print(f"Status Code: {response1.status_code}")
        print(f"Response length: {len(response1.text)} chars")
        
        if response1.status_code == 200:
            data1 = response1.json()
            if data1.get('success') and 'data' in data1:
                blog1 = data1['data']
                views1 = blog1.get('views', 0)
                print_result(True, f"Blog retrieved successfully, views: {views1}")
                
                # Verify content field is included
                if 'content' in blog1:
                    print_result(True, "Content field included in detail response")
                else:
                    print_result(False, "Content field missing in detail response")
                    return False
                
                # Second call - views should increment
                print("\n--- Testing views increment (second call) ---")
                time.sleep(0.5)  # Small delay
                response2 = requests.get(f"{BASE_URL}/blogs/{blog_slug}", timeout=10)
                
                if response2.status_code == 200:
                    blog2 = response2.json()['data']
                    views2 = blog2.get('views', 0)
                    print(f"Views after second call: {views2}")
                    
                    if views2 > views1:
                        print_result(True, f"Views incremented correctly: {views1} -> {views2}")
                        return True
                    else:
                        print_result(False, f"Views did not increment: {views1} -> {views2}")
                        return False
                else:
                    print_result(False, f"Second call failed: {response2.status_code}")
                    return False
            else:
                print_result(False, f"Unexpected response structure: {data1}")
                return False
        else:
            print_result(False, f"Expected 200, got {response1.status_code}")
            return False
    except Exception as e:
        print_result(False, f"Exception: {str(e)}")
        return False
    
    # Test 404 for nonexistent slug
    print("\n--- Testing 404 for nonexistent slug ---")
    try:
        response = requests.get(f"{BASE_URL}/blogs/nonexistent-slug-12345", timeout=10)
        print(f"Status Code: {response.status_code}")
        
        if response.status_code == 404:
            print_result(True, "Correctly returns 404 for nonexistent slug")
        else:
            print_result(False, f"Expected 404 for nonexistent slug, got {response.status_code}")
    except Exception as e:
        print_result(False, f"Exception: {str(e)}")

def test_7_list_events():
    """Test GET /api/events - auto-seeds 3 events"""
    print_test_header("7. List Events GET /api/events (Auto-seeding)")
    global event_id
    
    try:
        response = requests.get(f"{BASE_URL}/events", timeout=10)
        print(f"Status Code: {response.status_code}")
        print(f"Response length: {len(response.text)} chars")
        
        if response.status_code == 200:
            data = response.json()
            if data.get('success') and isinstance(data.get('data'), list):
                events = data['data']
                print_result(True, f"Successfully retrieved {len(events)} events")
                
                if len(events) >= 3:
                    print_result(True, "At least 3 events present (auto-seeding worked)")
                else:
                    print_result(False, f"Expected at least 3 events, got {len(events)}")
                    return False
                
                # Verify event structure
                first_event = events[0]
                required_fields = ['id', 'title', 'description', 'eventType', 'date', 
                                 'location', 'image', 'capacity']
                missing_fields = [f for f in required_fields if f not in first_event]
                
                if missing_fields:
                    print_result(False, f"Missing fields in event: {missing_fields}")
                    return False
                else:
                    print_result(True, "Event structure correct with all required fields")
                
                # Verify events are sorted by date ascending
                dates = [e['date'] for e in events]
                if dates == sorted(dates):
                    print_result(True, "Events correctly sorted by date ascending")
                else:
                    print_result(False, "Events not sorted by date ascending")
                
                # Store an event ID for registration test
                event_id = first_event['id']
                print(f"Stored event ID for registration test: {event_id}")
                return True
            else:
                print_result(False, f"Unexpected response structure: {data}")
                return False
        else:
            print_result(False, f"Expected 200, got {response.status_code}")
            return False
    except Exception as e:
        print_result(False, f"Exception: {str(e)}")
        return False

def test_8_event_registration():
    """Test POST /api/events/:id/register - register for event"""
    print_test_header("8. Event Registration POST /api/events/:id/register")
    
    if not event_id:
        print_result(False, "No event ID available from previous test")
        return False
    
    try:
        registration_data = {
            "firstName": "Priya",
            "lastName": "Sharma",
            "email": f"priya.sharma+{int(time.time())}@college.edu",
            "college": "IIT Bombay",
            "linkedIn": "https://linkedin.com/in/priyasharma"
        }
        
        response = requests.post(
            f"{BASE_URL}/events/{event_id}/register",
            json=registration_data,
            timeout=10
        )
        print(f"Status Code: {response.status_code}")
        print(f"Response: {response.text}")
        
        if response.status_code == 201:
            data = response.json()
            if data.get('success') and 'data' in data:
                reg = data['data']
                print_result(True, f"Event registration successful with ID: {reg.get('id')}")
                
                # Verify registration data
                if reg['eventId'] == event_id and reg['firstName'] == registration_data['firstName']:
                    print_result(True, "Registration data matches input")
                    return True
                else:
                    print_result(False, "Registration data doesn't match input")
                    return False
            else:
                print_result(False, f"Unexpected response structure: {data}")
                return False
        else:
            print_result(False, f"Expected 201, got {response.status_code}")
            return False
    except Exception as e:
        print_result(False, f"Exception: {str(e)}")
        return False

def test_9_auth_login():
    """Test POST /api/auth/login - admin and user login"""
    print_test_header("9. Authentication POST /api/auth/login")
    
    # Test admin login with correct credentials
    print("--- Testing admin login with correct credentials ---")
    try:
        response = requests.post(
            f"{BASE_URL}/auth/login",
            json={"email": ADMIN_EMAIL, "password": ADMIN_PASSWORD},
            timeout=10
        )
        print(f"Status Code: {response.status_code}")
        print(f"Response: {response.text}")
        
        if response.status_code == 200:
            data = response.json()
            if (data.get('success') and 
                'data' in data and 
                'token' in data['data'] and 
                data['data']['user']['role'] == 'ADMIN'):
                print_result(True, "Admin login successful with correct credentials")
            else:
                print_result(False, f"Unexpected response structure: {data}")
                return False
        else:
            print_result(False, f"Expected 200, got {response.status_code}")
            return False
    except Exception as e:
        print_result(False, f"Exception: {str(e)}")
        return False
    
    # Test login with wrong credentials
    print("\n--- Testing login with wrong credentials ---")
    try:
        response = requests.post(
            f"{BASE_URL}/auth/login",
            json={"email": ADMIN_EMAIL, "password": "WrongPassword123"},
            timeout=10
        )
        print(f"Status Code: {response.status_code}")
        print(f"Response: {response.text}")
        
        if response.status_code == 401:
            print_result(True, "Correctly returns 401 for wrong credentials")
            return True
        else:
            print_result(False, f"Expected 401 for wrong credentials, got {response.status_code}")
            return False
    except Exception as e:
        print_result(False, f"Exception: {str(e)}")
        return False

def test_10_auth_signup():
    """Test POST /api/auth/signup - user signup"""
    print_test_header("10. User Signup POST /api/auth/signup")
    global test_user_email
    
    # Test successful signup
    print("--- Testing successful user signup ---")
    try:
        test_user_email = f"testuser+{int(time.time())}@example.com"
        signup_data = {
            "email": test_user_email,
            "password": "Test12345",
            "firstName": "Amit",
            "lastName": "Patel"
        }
        
        response = requests.post(
            f"{BASE_URL}/auth/signup",
            json=signup_data,
            timeout=10
        )
        print(f"Status Code: {response.status_code}")
        print(f"Response: {response.text}")
        
        if response.status_code == 201:
            data = response.json()
            if (data.get('success') and 
                'data' in data and 
                'token' in data['data'] and 
                data['data']['user']['role'] == 'USER'):
                print_result(True, f"User signup successful: {test_user_email}")
            else:
                print_result(False, f"Unexpected response structure: {data}")
                return False
        else:
            print_result(False, f"Expected 201, got {response.status_code}")
            return False
    except Exception as e:
        print_result(False, f"Exception: {str(e)}")
        return False
    
    # Test duplicate email
    print("\n--- Testing duplicate email signup ---")
    try:
        response = requests.post(
            f"{BASE_URL}/auth/signup",
            json={"email": test_user_email, "password": "Test12345", "firstName": "Test"},
            timeout=10
        )
        print(f"Status Code: {response.status_code}")
        print(f"Response: {response.text}")
        
        if response.status_code == 400:
            data = response.json()
            if 'already exists' in data.get('error', '').lower():
                print_result(True, "Correctly returns 400 for duplicate email")
                return True
            else:
                print_result(False, f"Expected 'already exists' error, got: {data}")
                return False
        else:
            print_result(False, f"Expected 400 for duplicate email, got {response.status_code}")
            return False
    except Exception as e:
        print_result(False, f"Exception: {str(e)}")
        return False

def test_11_admin_stats():
    """Test GET /api/admin/stats - admin-only stats endpoint"""
    print_test_header("11. Admin Stats GET /api/admin/stats")
    
    # Test without token - should return 401
    print("--- Testing without Authorization header ---")
    try:
        response = requests.get(f"{BASE_URL}/admin/stats", timeout=10)
        print(f"Status Code: {response.status_code}")
        
        if response.status_code == 401:
            print_result(True, "Correctly returns 401 without auth token")
        else:
            print_result(False, f"Expected 401 without token, got {response.status_code}")
    except Exception as e:
        print_result(False, f"Exception: {str(e)}")
    
    # Test with valid admin token
    print("\n--- Testing with valid admin token ---")
    try:
        headers = {"Authorization": f"Bearer {admin_token}"}
        response = requests.get(f"{BASE_URL}/admin/stats", headers=headers, timeout=10)
        print(f"Status Code: {response.status_code}")
        print(f"Response: {response.text}")
        
        if response.status_code == 200:
            data = response.json()
            if data.get('success') and 'data' in data:
                stats = data['data']
                required_fields = ['leadsCount', 'blogsCount', 'eventsCount', 'regsCount', 'recentLeads']
                missing_fields = [f for f in required_fields if f not in stats]
                
                if missing_fields:
                    print_result(False, f"Missing fields in stats: {missing_fields}")
                    return False
                
                print_result(True, f"Stats retrieved: {stats['leadsCount']} leads, {stats['blogsCount']} blogs, {stats['eventsCount']} events, {stats['regsCount']} registrations")
                
                # Verify counts reflect data created in tests
                if stats['leadsCount'] > 0 and stats['blogsCount'] >= 4 and stats['eventsCount'] >= 3:
                    print_result(True, "Stats counts reflect data created in tests")
                    return True
                else:
                    print_result(False, f"Stats counts don't match expected values: {stats}")
                    return False
            else:
                print_result(False, f"Unexpected response structure: {data}")
                return False
        else:
            print_result(False, f"Expected 200, got {response.status_code}")
            return False
    except Exception as e:
        print_result(False, f"Exception: {str(e)}")
        return False

def test_12_newsletter():
    """Test POST /api/newsletter - newsletter signup"""
    print_test_header("12. Newsletter Signup POST /api/newsletter")
    
    try:
        newsletter_email = f"newsletter+{int(time.time())}@test.com"
        
        # First signup
        response1 = requests.post(
            f"{BASE_URL}/newsletter",
            json={"email": newsletter_email},
            timeout=10
        )
        print(f"Status Code: {response1.status_code}")
        print(f"Response: {response1.text}")
        
        if response1.status_code == 200:
            data1 = response1.json()
            if data1.get('success'):
                print_result(True, "Newsletter signup successful")
            else:
                print_result(False, f"Unexpected response: {data1}")
                return False
        else:
            print_result(False, f"Expected 200, got {response1.status_code}")
            return False
        
        # Test idempotency - second signup with same email
        print("\n--- Testing idempotency (second signup with same email) ---")
        response2 = requests.post(
            f"{BASE_URL}/newsletter",
            json={"email": newsletter_email},
            timeout=10
        )
        print(f"Status Code: {response2.status_code}")
        print(f"Response: {response2.text}")
        
        if response2.status_code == 200:
            print_result(True, "Newsletter signup is idempotent (no error on duplicate)")
            return True
        else:
            print_result(False, f"Expected 200 for duplicate signup, got {response2.status_code}")
            return False
    except Exception as e:
        print_result(False, f"Exception: {str(e)}")
        return False

def main():
    print("\n" + "="*80)
    print("AlGloryThm Backend API Test Suite")
    print(f"Base URL: {BASE_URL}")
    print(f"Started at: {datetime.now().isoformat()}")
    print("="*80)
    
    results = {}
    
    # Run all tests in sequence
    results['test_1_health_check'] = test_1_health_check()
    results['test_2_create_lead'] = test_2_create_lead()
    results['test_3_list_leads_auth'] = test_3_list_leads_auth()
    results['test_4_update_lead_status'] = test_4_update_lead_status()
    results['test_5_list_blogs'] = test_5_list_blogs()
    results['test_6_blog_detail'] = test_6_blog_detail()
    results['test_7_list_events'] = test_7_list_events()
    results['test_8_event_registration'] = test_8_event_registration()
    results['test_9_auth_login'] = test_9_auth_login()
    results['test_10_auth_signup'] = test_10_auth_signup()
    results['test_11_admin_stats'] = test_11_admin_stats()
    results['test_12_newsletter'] = test_12_newsletter()
    
    # Summary
    print("\n" + "="*80)
    print("TEST SUMMARY")
    print("="*80)
    
    passed = sum(1 for v in results.values() if v)
    total = len(results)
    
    for test_name, result in results.items():
        status = "✅ PASS" if result else "❌ FAIL"
        print(f"{status}: {test_name}")
    
    print(f"\nTotal: {passed}/{total} tests passed ({passed*100//total}%)")
    print(f"Completed at: {datetime.now().isoformat()}")
    print("="*80)
    
    return passed == total

if __name__ == "__main__":
    success = main()
    exit(0 if success else 1)
