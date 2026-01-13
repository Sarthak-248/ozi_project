// Task CRUD Test Script
// Run this script to test all task management endpoints
// First, get a valid JWT token by registering and logging in

const axios = require('axios');

const BASE_URL = 'http://localhost:5000/api';
let authToken = '';
let testTaskId = '';

// Test configuration
const testUser = {
  email: 'test@example.com',
  password: 'Test@123456'
};

const testTasks = [
  {
    title: 'Complete project documentation',
    description: 'Write comprehensive API documentation for all endpoints',
    status: 'pending',
    dueDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString()
  },
  {
    title: 'Review pull requests',
    description: 'Review pending PRs and provide feedback',
    status: 'in-progress',
    dueDate: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000).toISOString()
  },
  {
    title: 'Deploy to production',
    description: 'Deploy latest build to production server',
    status: 'pending',
    dueDate: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000).toISOString()
  }
];

// Utility function to make requests
async function makeRequest(method, endpoint, data = null) {
  try {
    const config = {
      method,
      url: `${BASE_URL}${endpoint}`,
      headers: {}
    };

    if (authToken) {
      config.headers.Authorization = `Bearer ${authToken}`;
    }

    if (data) {
      config.data = data;
    }

    const response = await axios(config);
    return { success: true, data: response.data, status: response.status };
  } catch (error) {
    return {
      success: false,
      error: error.response?.data || error.message,
      status: error.response?.status
    };
  }
}

// Test functions
async function testCreateTask(taskData) {
  console.log('\n✓ Testing: Create Task');
  console.log('  Input:', taskData);

  const result = await makeRequest('POST', '/tasks', taskData);

  if (result.success) {
    console.log('  ✅ Status:', result.status);
    console.log('  ✅ Created Task ID:', result.data.data._id);
    console.log('  ✅ Message:', result.data.message);
    return result.data.data._id;
  } else {
    console.log('  ❌ Error:', result.error);
    return null;
  }
}

async function testGetTasks(filters = {}) {
  console.log('\n✓ Testing: Get Tasks with Filters');
  console.log('  Filters:', filters);

  const queryString = new URLSearchParams(filters).toString();
  const endpoint = `/tasks${queryString ? `?${queryString}` : ''}`;

  const result = await makeRequest('GET', endpoint);

  if (result.success) {
    console.log('  ✅ Status:', result.status);
    console.log('  ✅ Tasks Count:', result.data.data.length);
    console.log('  ✅ Total:', result.data.meta?.total);
    console.log('  ✅ Filters Applied:', result.data.meta?.filters);
    return result.data.data;
  } else {
    console.log('  ❌ Error:', result.error);
    return [];
  }
}

async function testGetTask(taskId) {
  console.log('\n✓ Testing: Get Single Task');
  console.log('  Task ID:', taskId);

  const result = await makeRequest('GET', `/tasks/${taskId}`);

  if (result.success) {
    console.log('  ✅ Status:', result.status);
    console.log('  ✅ Task Title:', result.data.data.title);
    console.log('  ✅ Task Status:', result.data.data.status);
  } else {
    console.log('  ❌ Error:', result.error);
  }
}

async function testUpdateTask(taskId, updateData) {
  console.log('\n✓ Testing: Update Task');
  console.log('  Task ID:', taskId);
  console.log('  Update Data:', updateData);

  const result = await makeRequest('PATCH', `/tasks/${taskId}`, updateData);

  if (result.success) {
    console.log('  ✅ Status:', result.status);
    console.log('  ✅ Updated Title:', result.data.data.title);
    console.log('  ✅ Updated Status:', result.data.data.status);
    console.log('  ✅ Message:', result.data.message);
  } else {
    console.log('  ❌ Error:', result.error);
  }
}

async function testDeleteTask(taskId) {
  console.log('\n✓ Testing: Delete Task');
  console.log('  Task ID:', taskId);

  const result = await makeRequest('DELETE', `/tasks/${taskId}`);

  if (result.success) {
    console.log('  ✅ Status:', result.status);
    console.log('  ✅ Deleted Task Title:', result.data.data.title);
    console.log('  ✅ Message:', result.data.message);
  } else {
    console.log('  ❌ Error:', result.error);
  }
}

async function testGetStats() {
  console.log('\n✓ Testing: Get Task Statistics');

  const result = await makeRequest('GET', '/tasks/stats/overview');

  if (result.success) {
    console.log('  ✅ Status:', result.status);
    console.log('  ✅ Statistics:', result.data.data);
    console.log('  ✅ Message:', result.data.message);
  } else {
    console.log('  ❌ Error:', result.error);
  }
}

// Main test runner
async function runTests() {
  console.log('🚀 Starting Task Management API Tests...\n');
  console.log('📝 Note: Ensure your backend server is running on http://localhost:5000');
  console.log('⚠️  Important: You need a valid JWT token to run these tests\n');

  // Prompt user for token or run full flow
  console.log('Enter your JWT token (or press Enter to skip and use existing token):');
  // In a real scenario, you'd read from stdin or set it manually
  // For now, we'll assume the token is passed as an environment variable
  authToken = process.env.JWT_TOKEN || '';

  if (!authToken) {
    console.log('❌ No JWT token provided. Please set JWT_TOKEN environment variable.');
    console.log('   Example: JWT_TOKEN=your_token node test_task.js');
    return;
  }

  console.log('\n=== TEST SUITE: Task CRUD Operations ===\n');

  // 1. Create Tasks
  console.log('------- CREATE TESTS -------');
  for (let i = 0; i < testTasks.length; i++) {
    const taskId = await testCreateTask(testTasks[i]);
    if (i === 0) testTaskId = taskId; // Save first task ID for later tests
  }

  // 2. Get Tasks (all)
  console.log('\n------- READ TESTS (All Tasks) -------');
  await testGetTasks();

  // 3. Get Tasks (filter by status)
  console.log('\n------- READ TESTS (Filter by Status) -------');
  await testGetTasks({ status: 'pending' });
  await testGetTasks({ status: 'in-progress' });

  // 4. Get Tasks (search)
  console.log('\n------- READ TESTS (Search) -------');
  await testGetTasks({ search: 'documentation' });

  // 5. Get Tasks (sort)
  console.log('\n------- READ TESTS (Sort) -------');
  await testGetTasks({ sortBy: 'dueDate', order: 'asc' });

  // 6. Get Single Task
  console.log('\n------- READ TESTS (Single Task) -------');
  if (testTaskId) {
    await testGetTask(testTaskId);
  }

  // 7. Update Task
  console.log('\n------- UPDATE TESTS -------');
  if (testTaskId) {
    await testUpdateTask(testTaskId, {
      status: 'in-progress',
      description: 'Updated description with more details'
    });
  }

  // 8. Get Updated Task
  console.log('\n------- READ TESTS (Verify Update) -------');
  if (testTaskId) {
    await testGetTask(testTaskId);
  }

  // 9. Get Statistics
  console.log('\n------- STATISTICS TESTS -------');
  await testGetStats();

  // 10. Delete Task
  console.log('\n------- DELETE TESTS -------');
  if (testTaskId) {
    await testDeleteTask(testTaskId);
  }

  // 11. Verify Deletion
  console.log('\n------- VERIFICATION TESTS -------');
  console.log('\n✓ Final Task List:');
  await testGetTasks();

  console.log('\n\n✅ Test Suite Completed!\n');
}

// Export for use in other scripts
module.exports = {
  makeRequest,
  testCreateTask,
  testGetTasks,
  testGetTask,
  testUpdateTask,
  testDeleteTask,
  testGetStats
};

// Run tests if executed directly
if (require.main === module) {
  runTests().catch(console.error);
}
