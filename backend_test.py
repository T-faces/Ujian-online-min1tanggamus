import requests
import sys
from datetime import datetime

class ExamAPITester:
    def __init__(self, base_url="https://sd-ujian-online.preview.emergentagent.com"):
        self.base_url = base_url
        self.api = f"{base_url}/api"
        self.admin_token = None
        self.student_token = None
        self.tests_run = 0
        self.tests_passed = 0
        self.test_results = []
        
        # Store created IDs for cleanup and testing
        self.admin_id = None
        self.student_id = None
        self.subject_id = None
        self.exam_id = None
        self.question_ids = []

    def log_test(self, name, success, message="", status_code=None):
        """Log test result"""
        self.tests_run += 1
        if success:
            self.tests_passed += 1
            print(f"✅ {name} - PASSED")
        else:
            print(f"❌ {name} - FAILED: {message} (Status: {status_code})")
        
        self.test_results.append({
            "test": name,
            "success": success,
            "message": message,
            "status_code": status_code
        })
        return success

    def run_test(self, name, method, endpoint, expected_status, data=None, token=None):
        """Run a single API test"""
        url = f"{self.api}/{endpoint}"
        headers = {'Content-Type': 'application/json'}
        if token:
            headers['Authorization'] = f'Bearer {token}'

        print(f"\n🔍 Testing {name}...")
        
        try:
            if method == 'GET':
                response = requests.get(url, headers=headers, timeout=10)
            elif method == 'POST':
                response = requests.post(url, json=data, headers=headers, timeout=10)
            elif method == 'DELETE':
                response = requests.delete(url, headers=headers, timeout=10)

            success = response.status_code == expected_status
            
            if success:
                return self.log_test(name, True, status_code=response.status_code), response.json() if response.text else {}
            else:
                return self.log_test(name, False, f"Expected {expected_status}, got {response.status_code}", response.status_code), {}

        except Exception as e:
            return self.log_test(name, False, str(e)), {}

    def test_admin_register(self):
        """Test admin registration"""
        timestamp = datetime.now().strftime('%H%M%S')
        data = {
            "name": f"Admin Test {timestamp}",
            "email": f"admin{timestamp}@test.com",
            "password": "admin123",
            "role": "admin"
        }
        success, response = self.run_test(
            "Admin Registration",
            "POST",
            "auth/register",
            200,
            data=data
        )
        if success and 'token' in response:
            self.admin_token = response['token']
            self.admin_id = response['user']['id']
            return True
        return False

    def test_student_register(self):
        """Test student registration"""
        timestamp = datetime.now().strftime('%H%M%S')
        data = {
            "name": f"Student Test {timestamp}",
            "email": f"student{timestamp}@test.com",
            "password": "student123",
            "role": "student",
            "class_name": "4A"
        }
        success, response = self.run_test(
            "Student Registration",
            "POST",
            "auth/register",
            200,
            data=data
        )
        if success and 'token' in response:
            self.student_token = response['token']
            self.student_id = response['user']['id']
            return True
        return False

    def test_admin_login(self):
        """Test admin login"""
        timestamp = datetime.now().strftime('%H%M%S')
        # First register
        register_data = {
            "name": f"Admin Login {timestamp}",
            "email": f"adminlogin{timestamp}@test.com",
            "password": "admin123",
            "role": "admin"
        }
        requests.post(f"{self.api}/auth/register", json=register_data)
        
        # Then login
        login_data = {
            "email": f"adminlogin{timestamp}@test.com",
            "password": "admin123"
        }
        success, response = self.run_test(
            "Admin Login",
            "POST",
            "auth/login",
            200,
            data=login_data
        )
        return success and 'token' in response

    def test_student_login(self):
        """Test student login"""
        timestamp = datetime.now().strftime('%H%M%S')
        # First register
        register_data = {
            "name": f"Student Login {timestamp}",
            "email": f"studentlogin{timestamp}@test.com",
            "password": "student123",
            "role": "student",
            "class_name": "4A"
        }
        requests.post(f"{self.api}/auth/register", json=register_data)
        
        # Then login
        login_data = {
            "email": f"studentlogin{timestamp}@test.com",
            "password": "student123"
        }
        success, response = self.run_test(
            "Student Login",
            "POST",
            "auth/login",
            200,
            data=login_data
        )
        return success and 'token' in response

    def test_get_me(self):
        """Test get current user"""
        success, response = self.run_test(
            "Get Current User",
            "GET",
            "auth/me",
            200,
            token=self.admin_token
        )
        return success

    def test_create_subject(self):
        """Test creating a subject"""
        data = {
            "name": "Matematika",
            "description": "Pelajaran Matematika untuk SD",
            "icon": "📐"
        }
        success, response = self.run_test(
            "Create Subject",
            "POST",
            "subjects",
            200,
            data=data,
            token=self.admin_token
        )
        if success and 'id' in response:
            self.subject_id = response['id']
            return True
        return False

    def test_get_subjects(self):
        """Test getting all subjects"""
        success, response = self.run_test(
            "Get Subjects",
            "GET",
            "subjects",
            200,
            token=self.admin_token
        )
        return success

    def test_create_exam(self):
        """Test creating an exam"""
        if not self.subject_id:
            print("⚠️ Skipping exam creation - no subject ID")
            return False
        
        data = {
            "title": "Ujian Matematika Kelas 4",
            "subject_id": self.subject_id,
            "description": "Ujian tengah semester",
            "duration_minutes": 60,
            "class_name": "4A"
        }
        success, response = self.run_test(
            "Create Exam",
            "POST",
            "exams",
            200,
            data=data,
            token=self.admin_token
        )
        if success and 'id' in response:
            self.exam_id = response['id']
            return True
        return False

    def test_get_exams_admin(self):
        """Test getting exams as admin"""
        success, response = self.run_test(
            "Get Exams (Admin)",
            "GET",
            "exams",
            200,
            token=self.admin_token
        )
        return success

    def test_get_exams_student(self):
        """Test getting exams as student"""
        success, response = self.run_test(
            "Get Exams (Student)",
            "GET",
            "exams",
            200,
            token=self.student_token
        )
        return success

    def test_create_multiple_choice_question(self):
        """Test creating a multiple choice question"""
        if not self.exam_id:
            print("⚠️ Skipping question creation - no exam ID")
            return False
        
        data = {
            "question_text": "Berapa hasil dari 5 + 3?",
            "question_type": "multiple_choice",
            "options": ["6", "7", "8", "9"],
            "correct_answer": "2",
            "points": 10,
            "order": 0
        }
        success, response = self.run_test(
            "Create Multiple Choice Question",
            "POST",
            f"exams/{self.exam_id}/questions",
            200,
            data=data,
            token=self.admin_token
        )
        if success and 'id' in response:
            self.question_ids.append(response['id'])
            return True
        return False

    def test_create_essay_question(self):
        """Test creating an essay question"""
        if not self.exam_id:
            print("⚠️ Skipping essay question creation - no exam ID")
            return False
        
        data = {
            "question_text": "Jelaskan cara menghitung luas persegi panjang!",
            "question_type": "essay",
            "points": 20,
            "order": 1
        }
        success, response = self.run_test(
            "Create Essay Question",
            "POST",
            f"exams/{self.exam_id}/questions",
            200,
            data=data,
            token=self.admin_token
        )
        if success and 'id' in response:
            self.question_ids.append(response['id'])
            return True
        return False

    def test_get_questions(self):
        """Test getting questions for an exam"""
        if not self.exam_id:
            print("⚠️ Skipping get questions - no exam ID")
            return False
        
        success, response = self.run_test(
            "Get Questions",
            "GET",
            f"exams/{self.exam_id}/questions",
            200,
            token=self.student_token
        )
        return success

    def test_start_exam(self):
        """Test starting an exam as student"""
        if not self.exam_id:
            print("⚠️ Skipping start exam - no exam ID")
            return False
        
        success, response = self.run_test(
            "Start Exam",
            "POST",
            f"exams/{self.exam_id}/start",
            200,
            token=self.student_token
        )
        return success

    def test_submit_exam(self):
        """Test submitting an exam"""
        if not self.exam_id or not self.question_ids:
            print("⚠️ Skipping submit exam - no exam or questions")
            return False
        
        data = {
            "answers": [
                {
                    "question_id": self.question_ids[0],
                    "answer_text": "2"
                },
                {
                    "question_id": self.question_ids[1],
                    "answer_text": "Luas persegi panjang = panjang x lebar"
                }
            ]
        }
        success, response = self.run_test(
            "Submit Exam",
            "POST",
            f"exams/{self.exam_id}/submit",
            200,
            data=data,
            token=self.student_token
        )
        return success

    def test_get_exam_history(self):
        """Test getting exam history"""
        success, response = self.run_test(
            "Get Exam History",
            "GET",
            "exams/history",
            200,
            token=self.student_token
        )
        return success

    def test_get_exam_results(self):
        """Test getting exam results as admin"""
        if not self.exam_id:
            print("⚠️ Skipping get results - no exam ID")
            return False
        
        success, response = self.run_test(
            "Get Exam Results (Admin)",
            "GET",
            f"exams/{self.exam_id}/results",
            200,
            token=self.admin_token
        )
        return success

    def test_admin_dashboard(self):
        """Test admin dashboard"""
        success, response = self.run_test(
            "Admin Dashboard",
            "GET",
            "dashboard/admin",
            200,
            token=self.admin_token
        )
        return success

    def test_student_dashboard(self):
        """Test student dashboard"""
        success, response = self.run_test(
            "Student Dashboard",
            "GET",
            "dashboard/student",
            200,
            token=self.student_token
        )
        return success

    def run_all_tests(self):
        """Run all tests in sequence"""
        print("=" * 60)
        print("🚀 Starting Backend API Tests for SD/MI Exam System")
        print("=" * 60)
        
        # Auth tests
        print("\n📝 AUTHENTICATION TESTS")
        print("-" * 60)
        self.test_admin_register()
        self.test_student_register()
        self.test_admin_login()
        self.test_student_login()
        self.test_get_me()
        
        # Subject tests
        print("\n📚 SUBJECT MANAGEMENT TESTS")
        print("-" * 60)
        self.test_create_subject()
        self.test_get_subjects()
        
        # Exam tests
        print("\n📝 EXAM MANAGEMENT TESTS")
        print("-" * 60)
        self.test_create_exam()
        self.test_get_exams_admin()
        self.test_get_exams_student()
        
        # Question tests
        print("\n❓ QUESTION MANAGEMENT TESTS")
        print("-" * 60)
        self.test_create_multiple_choice_question()
        self.test_create_essay_question()
        self.test_get_questions()
        
        # Student exam flow tests
        print("\n🎓 STUDENT EXAM FLOW TESTS")
        print("-" * 60)
        self.test_start_exam()
        self.test_submit_exam()
        self.test_get_exam_history()
        
        # Dashboard tests
        print("\n📊 DASHBOARD TESTS")
        print("-" * 60)
        self.test_admin_dashboard()
        self.test_student_dashboard()
        
        # Results tests
        print("\n📈 RESULTS TESTS")
        print("-" * 60)
        self.test_get_exam_results()
        
        # Print summary
        print("\n" + "=" * 60)
        print("📊 TEST SUMMARY")
        print("=" * 60)
        print(f"Total Tests: {self.tests_run}")
        print(f"Passed: {self.tests_passed}")
        print(f"Failed: {self.tests_run - self.tests_passed}")
        print(f"Success Rate: {(self.tests_passed / self.tests_run * 100):.1f}%")
        print("=" * 60)
        
        return self.tests_passed == self.tests_run

def main():
    tester = ExamAPITester()
    success = tester.run_all_tests()
    return 0 if success else 1

if __name__ == "__main__":
    sys.exit(main())
