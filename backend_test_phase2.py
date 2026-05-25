#!/usr/bin/env python3
"""
Phase 2-6 Backend API Test Suite for AlGloryThm
Tests ONLY the NEW endpoints added in Phase 2-6 expansion
"""

import requests
import json
import time
from datetime import datetime
from pymongo import MongoClient
import os

# Base URL from .env
BASE_URL = "https://276fe8a9-715d-4fff-9bbb-775cf535cdc3.preview.emergentagent.com/api"

# Admin credentials from .env
ADMIN_EMAIL = "admin@alglorythm.com"
ADMIN_PASSWORD = "AlGlory@2025"

# MongoDB connection
MONGO_URL = "mongodb://localhost:27017"
DB_NAME = "alglorythm"

# Global variables
admin_token = None
hackathon_id = None
team_id = None
invite_token = None
blog_id_for_delete = None

def print_test_header(test_name):
    print(f"\n{'='*80}")
    print(f"TEST: {test_name}")
    print(f"{'='*80}")

def print_result(success, message):
    status = "✅ PASS" if success else "❌ FAIL"
    print(f"{status}: {message}")

def get_admin_token():
    """Login as admin and get JWT token"""
    global admin_token
    if admin_token:
        return admin_token
    
    try:
        response = requests.post(
            f"{BASE_URL}/auth/login",
            json={"email": ADMIN_EMAIL, "password": ADMIN_PASSWORD},
            timeout=10
        )
        if response.status_code == 200:
            admin_token = response.json()['data']['token']
            print(f"✅ Admin token obtained")
            return admin_token
        else:
            print(f"❌ Failed to get admin token: {response.status_code}")
            return None
    except Exception as e:
        print(f"❌ Exception getting admin token: {str(e)}")
        return None

def test_1_hackathons_list():
    """Test GET /api/hackathons - auto-seeds 1 hackathon"""
    print_test_header("1. Hackathons List GET /api/hackathons (Auto-seeding)")
    global hackathon_id
    
    try:
        # First call - should auto-seed if empty
        response = requests.get(f"{BASE_URL}/hackathons", timeout=10)
        print(f"Status Code: {response.status_code}")
        print(f"Response length: {len(response.text)} chars")
        
        if response.status_code == 200:
            data = response.json()
            if data.get('success') and isinstance(data.get('data'), list):
                hackathons = data['data']
                print_result(True, f"Successfully retrieved {len(hackathons)} hackathon(s)")
                
                if len(hackathons) >= 1:
                    print_result(True, "At least 1 hackathon present (auto-seeding worked)")
                else:
                    print_result(False, f"Expected at least 1 hackathon, got {len(hackathons)}")
                    return False
                
                # Verify hackathon structure
                first_hack = hackathons[0]
                required_fields = ['id', 'title', 'description', 'startDate', 'endDate', 
                                 'registrationDeadline', 'image', 'location', 'maxTeams', 
                                 'prizePool', 'published']
                missing_fields = [f for f in required_fields if f not in first_hack]
                
                if missing_fields:
                    print_result(False, f"Missing fields in hackathon: {missing_fields}")
                    return False
                else:
                    print_result(True, "Hackathon structure correct with all required fields")
                
                # Verify the seeded hackathon title
                if first_hack['title'] == 'AlGloryThm AI Builders Hackathon 2025':
                    print_result(True, "Seeded hackathon title matches expected")
                else:
                    print_result(False, f"Unexpected hackathon title: {first_hack['title']}")
                
                # Store hackathon ID for next tests
                hackathon_id = first_hack['id']
                print(f"Stored hackathon ID: {hackathon_id}")
                
                # Second call - should return same hackathons (no duplicates)
                print("\n--- Testing idempotency (second call) ---")
                response2 = requests.get(f"{BASE_URL}/hackathons", timeout=10)
                if response2.status_code == 200:
                    hackathons2 = response2.json()['data']
                    if len(hackathons2) == len(hackathons):
                        print_result(True, f"Second call returns same count ({len(hackathons2)}) - no duplicates")
                        return True
                    else:
                        print_result(False, f"Hackathon count changed: {len(hackathons)} -> {len(hackathons2)}")
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

def test_2_hackathon_detail():
    """Test GET /api/hackathons/:id - get hackathon detail with teamsCount"""
    print_test_header("2. Hackathon Detail GET /api/hackathons/:id")
    
    if not hackathon_id:
        print_result(False, "No hackathon ID available from previous test")
        return False
    
    try:
        response = requests.get(f"{BASE_URL}/hackathons/{hackathon_id}", timeout=10)
        print(f"Status Code: {response.status_code}")
        print(f"Response length: {len(response.text)} chars")
        
        if response.status_code == 200:
            data = response.json()
            if data.get('success') and 'data' in data:
                hack = data['data']
                print_result(True, f"Hackathon retrieved successfully: {hack.get('title')}")
                
                # Verify teamsCount field is present
                if 'teamsCount' in hack:
                    print_result(True, f"teamsCount field present: {hack['teamsCount']}")
                    if hack['teamsCount'] == 0:
                        print_result(True, "teamsCount is 0 (no teams yet)")
                    return True
                else:
                    print_result(False, "teamsCount field missing in response")
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
    
    # Test 404 for invalid ID
    print("\n--- Testing 404 for invalid hackathon ID ---")
    try:
        response = requests.get(f"{BASE_URL}/hackathons/invalid-id-12345", timeout=10)
        print(f"Status Code: {response.status_code}")
        
        if response.status_code == 404:
            print_result(True, "Correctly returns 404 for invalid hackathon ID")
        else:
            print_result(False, f"Expected 404 for invalid ID, got {response.status_code}")
    except Exception as e:
        print_result(False, f"Exception: {str(e)}")

def test_3_create_team():
    """Test POST /api/hackathons/:id/teams - create team with invites"""
    print_test_header("3. Create Team POST /api/hackathons/:id/teams")
    global team_id
    
    if not hackathon_id:
        print_result(False, "No hackathon ID available from previous test")
        return False
    
    try:
        team_data = {
            "teamName": "Neural Knights",
            "projectName": "AI Recipe Bot",
            "projectDescription": "Generate recipes from fridge photos",
            "leader": {
                "firstName": "Aryan",
                "lastName": "Mehta",
                "email": "aryan@example.com",
                "linkedIn": "https://linkedin.com/in/aryan",
                "github": "https://github.com/aryan",
                "college": "IIT Bombay",
                "year": "3rd year",
                "skillset": "React, Python, ML",
                "projectInterests": "Computer vision agents"
            },
            "memberEmails": ["member1@example.com", "member2@example.com"]
        }
        
        response = requests.post(
            f"{BASE_URL}/hackathons/{hackathon_id}/teams",
            json=team_data,
            timeout=10
        )
        print(f"Status Code: {response.status_code}")
        print(f"Response: {response.text}")
        
        if response.status_code == 201:
            data = response.json()
            if data.get('success') and 'data' in data:
                result = data['data']
                if 'team' in result and 'invitesSent' in result:
                    team = result['team']
                    team_id = team['id']
                    invites_sent = result['invitesSent']
                    print_result(True, f"Team created successfully with ID: {team_id}")
                    print_result(True, f"Invites sent: {invites_sent}")
                    
                    # Verify team data
                    if team['teamName'] == team_data['teamName'] and team['hackathonId'] == hackathon_id:
                        print_result(True, "Team data matches input")
                        return True
                    else:
                        print_result(False, "Team data doesn't match input")
                        return False
                else:
                    print_result(False, f"Missing team or invitesSent in response: {result}")
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

def test_4_duplicate_team_name():
    """Test POST /api/hackathons/:id/teams - duplicate team name should fail"""
    print_test_header("4. Duplicate Team Name POST /api/hackathons/:id/teams")
    
    if not hackathon_id:
        print_result(False, "No hackathon ID available from previous test")
        return False
    
    try:
        # Try to create team with same name
        team_data = {
            "teamName": "Neural Knights",  # Same name as previous test
            "projectName": "Different Project",
            "projectDescription": "Different description",
            "leader": {
                "firstName": "Test",
                "lastName": "User",
                "email": "test@example.com",
                "linkedIn": "https://linkedin.com/in/test",
                "github": "https://github.com/test",
                "college": "Test College",
                "year": "2nd year",
                "skillset": "Testing",
                "projectInterests": "Testing"
            },
            "memberEmails": []
        }
        
        response = requests.post(
            f"{BASE_URL}/hackathons/{hackathon_id}/teams",
            json=team_data,
            timeout=10
        )
        print(f"Status Code: {response.status_code}")
        print(f"Response: {response.text}")
        
        if response.status_code == 400:
            data = response.json()
            if 'already taken' in data.get('error', '').lower():
                print_result(True, "Correctly returns 400 with 'Team name already taken' error")
                return True
            else:
                print_result(False, f"Expected 'already taken' error, got: {data}")
                return False
        else:
            print_result(False, f"Expected 400 for duplicate team name, got {response.status_code}")
            return False
    except Exception as e:
        print_result(False, f"Exception: {str(e)}")
        return False

def test_5_get_invite_info():
    """Test GET /api/hackathons/invite-info?token=<token> - get invite info"""
    print_test_header("5. Get Invite Info GET /api/hackathons/invite-info?token=...")
    global invite_token
    
    # Query MongoDB to get a valid invite token
    print("--- Querying MongoDB for invite token ---")
    try:
        client = MongoClient(MONGO_URL)
        db = client[DB_NAME]
        invite = db.hackathon_invites.find_one({"email": "member1@example.com"})
        
        if invite:
            invite_token = invite['token']
            print_result(True, f"Found invite token from DB: {invite_token[:20]}...")
        else:
            print_result(False, "No invite found in DB for member1@example.com")
            return False
        
        client.close()
    except Exception as e:
        print_result(False, f"Exception querying MongoDB: {str(e)}")
        return False
    
    # Test with valid token
    print("\n--- Testing with valid token ---")
    try:
        response = requests.get(f"{BASE_URL}/hackathons/invite-info?token={invite_token}", timeout=10)
        print(f"Status Code: {response.status_code}")
        print(f"Response length: {len(response.text)} chars")
        
        if response.status_code == 200:
            data = response.json()
            if data.get('success') and 'data' in data:
                result = data['data']
                if 'invite' in result and 'team' in result and 'hackathon' in result:
                    print_result(True, "Invite info retrieved successfully with all required fields")
                    print(f"Team: {result['team'].get('teamName')}")
                    print(f"Hackathon: {result['hackathon'].get('title')}")
                    return True
                else:
                    print_result(False, f"Missing fields in response: {result.keys()}")
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
    
    # Test with invalid token
    print("\n--- Testing with invalid token ---")
    try:
        response = requests.get(f"{BASE_URL}/hackathons/invite-info?token=invalid-token-12345", timeout=10)
        print(f"Status Code: {response.status_code}")
        
        if response.status_code == 404:
            print_result(True, "Correctly returns 404 for invalid token")
        else:
            print_result(False, f"Expected 404 for invalid token, got {response.status_code}")
    except Exception as e:
        print_result(False, f"Exception: {str(e)}")

def test_6_confirm_invite():
    """Test POST /api/hackathons/confirm - confirm invite"""
    print_test_header("6. Confirm Invite POST /api/hackathons/confirm")
    
    if not invite_token:
        print_result(False, "No invite token available from previous test")
        return False
    
    try:
        confirm_data = {
            "token": invite_token,
            "firstName": "Priya",
            "lastName": "Nair",
            "linkedIn": "https://linkedin.com/in/priyanair",
            "github": "https://github.com/priyanair",
            "college": "NIT Trichy",
            "year": "4th year",
            "skillset": "Flutter, Go",
            "projectInterests": "Backend systems"
        }
        
        response = requests.post(
            f"{BASE_URL}/hackathons/confirm",
            json=confirm_data,
            timeout=10
        )
        print(f"Status Code: {response.status_code}")
        print(f"Response: {response.text}")
        
        if response.status_code == 200:
            data = response.json()
            if data.get('success'):
                print_result(True, "Invite confirmed successfully")
                
                # Try to confirm again - should fail with 400
                print("\n--- Testing duplicate confirmation (should fail) ---")
                response2 = requests.post(
                    f"{BASE_URL}/hackathons/confirm",
                    json=confirm_data,
                    timeout=10
                )
                print(f"Status Code: {response2.status_code}")
                print(f"Response: {response2.text}")
                
                if response2.status_code == 400:
                    data2 = response2.json()
                    if 'already confirmed' in data2.get('error', '').lower():
                        print_result(True, "Correctly returns 400 for already confirmed invite")
                        return True
                    else:
                        print_result(False, f"Expected 'already confirmed' error, got: {data2}")
                        return False
                else:
                    print_result(False, f"Expected 400 for duplicate confirmation, got {response2.status_code}")
                    return False
            else:
                print_result(False, f"Unexpected response: {data}")
                return False
        else:
            print_result(False, f"Expected 200, got {response.status_code}")
            return False
    except Exception as e:
        print_result(False, f"Exception: {str(e)}")
        return False

def test_7_confirm_invalid_token():
    """Test POST /api/hackathons/confirm - invalid token should fail"""
    print_test_header("7. Confirm Invalid Token POST /api/hackathons/confirm")
    
    try:
        confirm_data = {
            "token": "fake-token-xxx",
            "firstName": "X"
        }
        
        response = requests.post(
            f"{BASE_URL}/hackathons/confirm",
            json=confirm_data,
            timeout=10
        )
        print(f"Status Code: {response.status_code}")
        print(f"Response: {response.text}")
        
        if response.status_code == 404:
            data = response.json()
            if 'invalid' in data.get('error', '').lower():
                print_result(True, "Correctly returns 404 with 'Invalid invitation token' error")
                return True
            else:
                print_result(False, f"Expected 'invalid' error, got: {data}")
                return False
        else:
            print_result(False, f"Expected 404 for invalid token, got {response.status_code}")
            return False
    except Exception as e:
        print_result(False, f"Exception: {str(e)}")
        return False

def test_8_admin_blogs_list():
    """Test GET /api/admin/blogs - admin-only list of ALL blogs"""
    print_test_header("8. Admin Blogs List GET /api/admin/blogs")
    
    # Test without token - should return 401
    print("--- Testing without Authorization header ---")
    try:
        response = requests.get(f"{BASE_URL}/admin/blogs", timeout=10)
        print(f"Status Code: {response.status_code}")
        
        if response.status_code == 401:
            print_result(True, "Correctly returns 401 without auth token")
        else:
            print_result(False, f"Expected 401 without token, got {response.status_code}")
            return False
    except Exception as e:
        print_result(False, f"Exception: {str(e)}")
        return False
    
    # Test with valid admin token
    print("\n--- Testing with valid admin token ---")
    token = get_admin_token()
    if not token:
        return False
    
    try:
        headers = {"Authorization": f"Bearer {token}"}
        response = requests.get(f"{BASE_URL}/admin/blogs", headers=headers, timeout=10)
        print(f"Status Code: {response.status_code}")
        print(f"Response length: {len(response.text)} chars")
        
        if response.status_code == 200:
            data = response.json()
            if data.get('success') and isinstance(data.get('data'), list):
                blogs = data['data']
                print_result(True, f"Successfully retrieved {len(blogs)} blogs (including unpublished)")
                
                # Verify blogs are sorted by createdAt desc
                if len(blogs) > 1:
                    dates = [b['createdAt'] for b in blogs]
                    if dates == sorted(dates, reverse=True):
                        print_result(True, "Blogs correctly sorted by createdAt desc")
                    else:
                        print_result(False, "Blogs not sorted by createdAt desc")
                
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

def test_9_admin_blog_detail():
    """Test GET /api/admin/blogs/:id - admin-only single blog"""
    print_test_header("9. Admin Blog Detail GET /api/admin/blogs/:id")
    
    token = get_admin_token()
    if not token:
        return False
    
    # First, get a blog ID from the list
    print("--- Getting blog ID from list ---")
    try:
        headers = {"Authorization": f"Bearer {token}"}
        response = requests.get(f"{BASE_URL}/admin/blogs", headers=headers, timeout=10)
        
        if response.status_code == 200:
            blogs = response.json()['data']
            if len(blogs) > 0:
                blog_id = blogs[0]['id']
                print_result(True, f"Got blog ID: {blog_id}")
            else:
                print_result(False, "No blogs found in list")
                return False
        else:
            print_result(False, f"Failed to get blogs list: {response.status_code}")
            return False
    except Exception as e:
        print_result(False, f"Exception: {str(e)}")
        return False
    
    # Test getting single blog
    print("\n--- Testing GET single blog ---")
    try:
        response = requests.get(f"{BASE_URL}/admin/blogs/{blog_id}", headers=headers, timeout=10)
        print(f"Status Code: {response.status_code}")
        print(f"Response length: {len(response.text)} chars")
        
        if response.status_code == 200:
            data = response.json()
            if data.get('success') and 'data' in data:
                blog = data['data']
                print_result(True, f"Blog retrieved successfully: {blog.get('title')}")
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
    
    # Test 404 for invalid ID
    print("\n--- Testing 404 for invalid blog ID ---")
    try:
        response = requests.get(f"{BASE_URL}/admin/blogs/invalid-id-12345", headers=headers, timeout=10)
        print(f"Status Code: {response.status_code}")
        
        if response.status_code == 404:
            print_result(True, "Correctly returns 404 for invalid blog ID")
        else:
            print_result(False, f"Expected 404 for invalid ID, got {response.status_code}")
    except Exception as e:
        print_result(False, f"Exception: {str(e)}")

def test_10_admin_blog_update():
    """Test PATCH /api/admin/blogs/:id - admin-only update blog"""
    print_test_header("10. Admin Blog Update PATCH /api/admin/blogs/:id")
    
    token = get_admin_token()
    if not token:
        return False
    
    # First, get a blog ID from the list
    print("--- Getting blog ID from list ---")
    try:
        headers = {"Authorization": f"Bearer {token}"}
        response = requests.get(f"{BASE_URL}/admin/blogs", headers=headers, timeout=10)
        
        if response.status_code == 200:
            blogs = response.json()['data']
            if len(blogs) > 0:
                blog_id = blogs[0]['id']
                original_title = blogs[0]['title']
                print_result(True, f"Got blog ID: {blog_id}, original title: {original_title}")
            else:
                print_result(False, "No blogs found in list")
                return False
        else:
            print_result(False, f"Failed to get blogs list: {response.status_code}")
            return False
    except Exception as e:
        print_result(False, f"Exception: {str(e)}")
        return False
    
    # Update the blog title
    print("\n--- Testing PATCH blog ---")
    try:
        update_data = {"title": "Updated Test Title"}
        response = requests.patch(
            f"{BASE_URL}/admin/blogs/{blog_id}",
            json=update_data,
            headers=headers,
            timeout=10
        )
        print(f"Status Code: {response.status_code}")
        print(f"Response: {response.text}")
        
        if response.status_code == 200:
            data = response.json()
            if data.get('success'):
                print_result(True, "Blog updated successfully")
                
                # Verify the update by getting the blog again
                print("\n--- Verifying update ---")
                verify_response = requests.get(f"{BASE_URL}/admin/blogs/{blog_id}", headers=headers, timeout=10)
                if verify_response.status_code == 200:
                    blog = verify_response.json()['data']
                    if blog['title'] == "Updated Test Title":
                        print_result(True, "Blog title verified as 'Updated Test Title'")
                        
                        # Restore original title
                        print("\n--- Restoring original title ---")
                        restore_response = requests.patch(
                            f"{BASE_URL}/admin/blogs/{blog_id}",
                            json={"title": original_title},
                            headers=headers,
                            timeout=10
                        )
                        if restore_response.status_code == 200:
                            print_result(True, "Original title restored")
                        
                        return True
                    else:
                        print_result(False, f"Blog title not updated correctly: {blog['title']}")
                        return False
            else:
                print_result(False, f"Unexpected response: {data}")
                return False
        else:
            print_result(False, f"Expected 200, got {response.status_code}")
            return False
    except Exception as e:
        print_result(False, f"Exception: {str(e)}")
        return False

def test_11_admin_blog_delete():
    """Test DELETE /api/admin/blogs/:id - admin-only delete blog"""
    print_test_header("11. Admin Blog Delete DELETE /api/admin/blogs/:id")
    
    token = get_admin_token()
    if not token:
        return False
    
    # First, create a test blog to delete
    print("--- Creating test blog to delete ---")
    try:
        headers = {"Authorization": f"Bearer {token}"}
        blog_data = {
            "title": "Test Blog for Deletion",
            "slug": f"test-blog-deletion-{int(time.time())}",
            "excerpt": "This blog will be deleted",
            "content": "Test content",
            "thumbnail": "https://example.com/image.jpg",
            "author": "Test Author",
            "categories": ["Test"],
            "tags": ["test"],
            "published": False
        }
        
        response = requests.post(
            f"{BASE_URL}/blogs",
            json=blog_data,
            headers=headers,
            timeout=10
        )
        print(f"Status Code: {response.status_code}")
        
        if response.status_code == 201:
            blog_id = response.json()['data']['id']
            print_result(True, f"Test blog created with ID: {blog_id}")
        else:
            print_result(False, f"Failed to create test blog: {response.status_code}")
            return False
    except Exception as e:
        print_result(False, f"Exception creating test blog: {str(e)}")
        return False
    
    # Delete the blog
    print("\n--- Testing DELETE blog ---")
    try:
        response = requests.delete(
            f"{BASE_URL}/admin/blogs/{blog_id}",
            headers=headers,
            timeout=10
        )
        print(f"Status Code: {response.status_code}")
        print(f"Response: {response.text}")
        
        if response.status_code == 200:
            data = response.json()
            if data.get('success'):
                print_result(True, "Blog deleted successfully")
                
                # Verify deletion by trying to get the blog
                print("\n--- Verifying deletion ---")
                verify_response = requests.get(f"{BASE_URL}/admin/blogs/{blog_id}", headers=headers, timeout=10)
                print(f"Verify Status Code: {verify_response.status_code}")
                
                if verify_response.status_code == 404:
                    print_result(True, "Blog confirmed deleted (404 on GET)")
                    return True
                else:
                    print_result(False, f"Blog still exists after deletion: {verify_response.status_code}")
                    return False
            else:
                print_result(False, f"Unexpected response: {data}")
                return False
        else:
            print_result(False, f"Expected 200, got {response.status_code}")
            return False
    except Exception as e:
        print_result(False, f"Exception: {str(e)}")
        return False

def test_12_lead_email_side_effect():
    """Test POST /api/leads - email side effect should not crash API"""
    print_test_header("12. Lead Email Side Effect POST /api/leads")
    
    try:
        lead_data = {
            "firstName": "Vikram",
            "lastName": "Singh",
            "email": f"vikram.singh+{int(time.time())}@startup.in",
            "phone": "+91-9876543210",
            "company": "Startup India",
            "serviceType": "AI_AUTOMATION",
            "message": "Need AI automation for our operations"
        }
        
        response = requests.post(f"{BASE_URL}/leads", json=lead_data, timeout=10)
        print(f"Status Code: {response.status_code}")
        print(f"Response: {response.text}")
        
        if response.status_code == 201:
            data = response.json()
            if data.get('success') and 'data' in data:
                print_result(True, "Lead created successfully - API returns 201 even if email fails")
                
                # Verify lead is saved in DB
                print("\n--- Verifying lead saved in DB ---")
                try:
                    client = MongoClient(MONGO_URL)
                    db = client[DB_NAME]
                    lead = db.leads.find_one({"email": lead_data['email']})
                    
                    if lead:
                        print_result(True, "Lead found in database - data persisted correctly")
                        client.close()
                        return True
                    else:
                        print_result(False, "Lead not found in database")
                        client.close()
                        return False
                except Exception as e:
                    print_result(False, f"Exception verifying DB: {str(e)}")
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

def test_13_signup_email_side_effect():
    """Test POST /api/auth/signup - welcome email side effect should not crash API"""
    print_test_header("13. Signup Email Side Effect POST /api/auth/signup")
    
    try:
        signup_data = {
            "email": f"newuser+{int(time.time())}@example.com",
            "password": "Test12345",
            "firstName": "Neha",
            "lastName": "Gupta"
        }
        
        response = requests.post(f"{BASE_URL}/auth/signup", json=signup_data, timeout=10)
        print(f"Status Code: {response.status_code}")
        print(f"Response: {response.text}")
        
        if response.status_code == 201:
            data = response.json()
            if data.get('success') and 'data' in data and 'token' in data['data']:
                print_result(True, "Signup successful - API returns 201 even if welcome email fails")
                
                # Verify user is saved in DB
                print("\n--- Verifying user saved in DB ---")
                try:
                    client = MongoClient(MONGO_URL)
                    db = client[DB_NAME]
                    user = db.users.find_one({"email": signup_data['email']})
                    
                    if user:
                        print_result(True, "User found in database - data persisted correctly")
                        client.close()
                        return True
                    else:
                        print_result(False, "User not found in database")
                        client.close()
                        return False
                except Exception as e:
                    print_result(False, f"Exception verifying DB: {str(e)}")
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

def main():
    print("\n" + "="*80)
    print("AlGloryThm Phase 2-6 Backend API Test Suite")
    print("Testing ONLY NEW endpoints added in Phase 2-6")
    print(f"Base URL: {BASE_URL}")
    print(f"Started at: {datetime.now().isoformat()}")
    print("="*80)
    
    results = {}
    
    # Run all tests in sequence
    results['test_1_hackathons_list'] = test_1_hackathons_list()
    results['test_2_hackathon_detail'] = test_2_hackathon_detail()
    results['test_3_create_team'] = test_3_create_team()
    results['test_4_duplicate_team_name'] = test_4_duplicate_team_name()
    results['test_5_get_invite_info'] = test_5_get_invite_info()
    results['test_6_confirm_invite'] = test_6_confirm_invite()
    results['test_7_confirm_invalid_token'] = test_7_confirm_invalid_token()
    results['test_8_admin_blogs_list'] = test_8_admin_blogs_list()
    results['test_9_admin_blog_detail'] = test_9_admin_blog_detail()
    results['test_10_admin_blog_update'] = test_10_admin_blog_update()
    results['test_11_admin_blog_delete'] = test_11_admin_blog_delete()
    results['test_12_lead_email_side_effect'] = test_12_lead_email_side_effect()
    results['test_13_signup_email_side_effect'] = test_13_signup_email_side_effect()
    
    # Summary
    print("\n" + "="*80)
    print("TEST SUMMARY - PHASE 2-6 NEW ENDPOINTS")
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
