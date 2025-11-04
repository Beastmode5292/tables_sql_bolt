// Community Center SQL Tutorial - Main JavaScript
class SQLTutorial {
    constructor() {
        this.db = null;
        this.currentLesson = 1;
        this.lessons = {};
        this.sqlWorker = null;
        this.init();
    }

    async init() {
        try {
            // Initialize SQL.js
            await this.initSQLJS();
            // Load database schema and data
            await this.loadDatabase();
            // Load lessons
            await this.loadLessons();
            // Set up event listeners
            this.setupEventListeners();
            // Load first lesson
            this.loadLesson(1);
            
            console.log('Community Center SQL Tutorial initialized successfully!');
        } catch (error) {
            console.error('Failed to initialize tutorial:', error);
            this.showError('Failed to initialize the tutorial. Please refresh the page.');
        }
    }

    async initSQLJS() {
        // Initialize SQL.js with WebAssembly
        const SQL = await initSqlJs({
            locateFile: file => `https://cdnjs.cloudflare.com/ajax/libs/sql.js/1.8.0/${file}`
        });
        
        this.db = new SQL.Database();
        console.log('SQL.js initialized');
    }

    async loadDatabase() {
        // Community Center Database Schema and Data
        const schema = `
            -- Community Center Database Schema
            CREATE TABLE users (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                username VARCHAR(80) NOT NULL UNIQUE,
                email VARCHAR(120) NOT NULL UNIQUE,
                password VARCHAR(255) NOT NULL,
                user_type TEXT CHECK(user_type IN ('visitor','worker')) NOT NULL DEFAULT 'visitor',
                approved BOOLEAN NOT NULL DEFAULT 0,
                created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
                updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
            );

            CREATE TABLE events (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                title VARCHAR(150) NOT NULL,
                description TEXT,
                event_date DATE NOT NULL,
                event_time TIME NOT NULL,
                location VARCHAR(200),
                created_by INTEGER,
                created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
                FOREIGN KEY (created_by) REFERENCES users(id)
            );

            CREATE TABLE messages (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                user_id INTEGER,
                subject VARCHAR(100) NOT NULL,
                content TEXT NOT NULL,
                senderName VARCHAR(50) NOT NULL,
                senderUsername VARCHAR(80) NOT NULL,
                recipientWorker VARCHAR(80) NOT NULL,
                timestamp DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
                status VARCHAR(20) NOT NULL DEFAULT 'sent',
                responses TEXT,
                created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
                FOREIGN KEY (user_id) REFERENCES users(id)
            );

            CREATE TABLE classes (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                teacher_id INTEGER NOT NULL,
                name VARCHAR(100) NOT NULL,
                subject TEXT CHECK(subject IN ('fitness', 'arts', 'education', 'social', 'senior', 'youth', 'other')) NOT NULL DEFAULT 'other',
                description TEXT,
                capacity INTEGER NOT NULL DEFAULT 20,
                schedule VARCHAR(200),
                status TEXT CHECK(status IN ('active', 'completed', 'cancelled')) NOT NULL DEFAULT 'active',
                created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
                updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
                FOREIGN KEY (teacher_id) REFERENCES users(id)
            );

            CREATE TABLE class_enrollments (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                class_id INTEGER NOT NULL,
                student_id INTEGER,
                student_name VARCHAR(100) NOT NULL,
                student_email VARCHAR(120),
                student_phone VARCHAR(20),
                enrollment_date DATE NOT NULL DEFAULT (date('now')),
                status TEXT CHECK(status IN ('active', 'completed', 'dropped', 'waitlist')) NOT NULL DEFAULT 'active',
                notes TEXT,
                created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
                updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
                FOREIGN KEY (class_id) REFERENCES classes(id),
                FOREIGN KEY (student_id) REFERENCES users(id)
            );

            CREATE TABLE class_attendance (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                class_id INTEGER NOT NULL,
                student_id INTEGER,
                student_name VARCHAR(100) NOT NULL,
                attendance_date DATE NOT NULL,
                status TEXT CHECK(status IN ('present', 'absent', 'late', 'excused')) NOT NULL DEFAULT 'present',
                notes TEXT,
                recorded_by INTEGER NOT NULL,
                recorded_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
                FOREIGN KEY (class_id) REFERENCES classes(id),
                FOREIGN KEY (student_id) REFERENCES users(id),
                FOREIGN KEY (recorded_by) REFERENCES users(id)
            );

            -- Sample Data
            INSERT INTO users (username, email, password, user_type, approved) VALUES
            ('teacher_admin', 'teacher@community.com', 'password123', 'worker', 1),
            ('john_student', 'john@email.com', 'password123', 'visitor', 1),
            ('mary_student', 'mary@email.com', 'password123', 'visitor', 1),
            ('david_student', 'david@email.com', 'password123', 'visitor', 1),
            ('sarah_student', 'sarah@email.com', 'password123', 'visitor', 1);

            INSERT INTO events (title, description, event_date, event_time, location, created_by) VALUES
            ('Community Breakfast', 'Monthly community breakfast for all ages', '2025-11-15', '09:00:00', 'Main Hall', 1),
            ('Holiday Party', 'End of year celebration', '2025-12-15', '18:00:00', 'Main Hall', 1),
            ('New Year Workshop', 'Goal setting for the new year', '2025-12-30', '14:00:00', 'Conference Room', 1);

            INSERT INTO messages (user_id, subject, content, senderName, senderUsername, recipientWorker, timestamp, status) VALUES
            (2, 'Class Schedule Question', 'What time does the yoga class start on Mondays?', 'John Smith', 'john_student', 'teacher_admin', datetime('now'), 'sent'),
            (3, 'Registration Help', 'I need help registering for the art class', 'Mary Johnson', 'mary_student', 'teacher_admin', datetime('now'), 'sent');

            INSERT INTO classes (teacher_id, name, subject, description, capacity, schedule) VALUES
            (1, 'Beginner Yoga', 'fitness', 'Gentle yoga for beginners and seniors', 20, 'Mondays & Wednesdays 10-11 AM'),
            (1, 'Senior Art Class', 'arts', 'Watercolor painting and drawing for seniors', 12, 'Tuesdays 2-4 PM'),
            (1, 'Computer Skills', 'education', 'Basic computer and internet skills', 15, 'Thursdays 10-12 PM'),
            (1, 'Youth Basketball', 'youth', 'Basketball skills and games for youth', 16, 'Saturdays 9-11 AM'),
            (1, 'Book Club', 'social', 'Monthly book discussions', 10, 'First Friday of each month 7-8 PM');

            INSERT INTO class_enrollments (class_id, student_id, student_name, student_email, student_phone) VALUES
            (1, 2, 'John Smith', 'john@email.com', '555-0101'),
            (1, 3, 'Mary Johnson', 'mary@email.com', '555-0102'),
            (1, 4, 'David Wilson', 'david@email.com', '555-0103'),
            (1, NULL, 'Alice Brown', 'alice@email.com', '555-0104'),
            (1, NULL, 'Robert Davis', 'robert@email.com', '555-0105'),
            (2, 3, 'Mary Johnson', 'mary@email.com', '555-0102'),
            (2, NULL, 'Helen Wilson', 'helen@email.com', '555-0106'),
            (2, NULL, 'Frank Miller', 'frank@email.com', '555-0107'),
            (2, NULL, 'Betty White', 'betty@email.com', '555-0108'),
            (3, 2, 'John Smith', 'john@email.com', '555-0101'),
            (3, 4, 'David Wilson', 'david@email.com', '555-0103'),
            (3, 5, 'Sarah Davis', 'sarah@email.com', '555-0109'),
            (3, NULL, 'Tom Anderson', 'tom@email.com', '555-0110'),
            (3, NULL, 'Linda Garcia', 'linda@email.com', '555-0111'),
            (4, NULL, 'Jake Martinez', 'jake@email.com', '555-0112'),
            (4, NULL, 'Emma Thompson', 'emma@email.com', '555-0113'),
            (4, NULL, 'Noah Rodriguez', 'noah@email.com', '555-0114'),
            (5, 2, 'John Smith', 'john@email.com', '555-0101'),
            (5, 3, 'Mary Johnson', 'mary@email.com', '555-0102'),
            (5, NULL, 'Patricia Lee', 'patricia@email.com', '555-0115');

            INSERT INTO class_attendance (class_id, student_id, student_name, attendance_date, status, recorded_by) VALUES
            (1, 2, 'John Smith', '2025-10-28', 'present', 1),
            (1, 3, 'Mary Johnson', '2025-10-28', 'present', 1),
            (1, 4, 'David Wilson', '2025-10-28', 'absent', 1),
            (1, NULL, 'Alice Brown', '2025-10-28', 'present', 1),
            (1, NULL, 'Robert Davis', '2025-10-28', 'late', 1),
            (1, 2, 'John Smith', '2025-10-30', 'present', 1),
            (1, 3, 'Mary Johnson', '2025-10-30', 'present', 1),
            (1, 4, 'David Wilson', '2025-10-30', 'present', 1),
            (1, NULL, 'Alice Brown', '2025-10-30', 'present', 1),
            (1, NULL, 'Robert Davis', '2025-10-30', 'absent', 1),
            (2, 3, 'Mary Johnson', '2025-10-29', 'present', 1),
            (2, NULL, 'Helen Wilson', '2025-10-29', 'present', 1),
            (2, NULL, 'Frank Miller', '2025-10-29', 'absent', 1),
            (2, NULL, 'Betty White', '2025-10-29', 'present', 1),
            (3, 2, 'John Smith', '2025-10-31', 'present', 1),
            (3, 4, 'David Wilson', '2025-10-31', 'present', 1),
            (3, 5, 'Sarah Davis', '2025-10-31', 'late', 1),
            (3, NULL, 'Tom Anderson', '2025-10-31', 'present', 1),
            (3, NULL, 'Linda Garcia', '2025-10-31', 'absent', 1);
        `;

        try {
            this.db.exec(schema);
            console.log('Database loaded successfully');
        } catch (error) {
            console.error('Error loading database:', error);
            throw error;
        }
    }

    async loadLessons() {
        // Define lessons with content and expected queries
        this.lessons = {
            1: {
                title: "Introduction & Basic SELECT",
                content: `
                    <h2>🎓 Welcome to Community Center SQL!</h2>
                    <p>Welcome to your SQL journey! You'll be learning SQL using a real community center database that manages users, classes, events, and attendance.</p>
                    
                    <h3>Explore the Database Tables</h3>
                    <p>👈 Look at the left panel and click "Show Data" on any table to see the actual data!</p>
                    <p>Our community center database contains:</p>
                    <ul>
                        <li><strong>users</strong> - Teachers (workers) and students (visitors)</li>
                        <li><strong>classes</strong> - Various classes offered by teachers</li>
                        <li><strong>class_enrollments</strong> - Students enrolled in classes</li>
                        <li><strong>class_attendance</strong> - Daily attendance records</li>
                        <li><strong>events</strong> - Community events and activities</li>
                        <li><strong>messages</strong> - Communication between students and teachers</li>
                    </ul>

                    <h3>Exercise 1 — Tasks</h3>
                    <p>Let's start with the most basic SQL command: <code>SELECT</code>. This command lets you retrieve data from a table.</p>
                    
                    <ol>
                        <li><strong>Find the <code>title</code> of each user</strong> (hint: look at the users table schema)</li>
                        <li><strong>Find the <code>name</code> of each class</strong></li>
                        <li><strong>Find the <code>title</code> and <code>event_date</code> of each event</strong></li>
                        <li><strong>Find all the information about each user</strong></li>
                    </ol>

                    <p><strong>Start here:</strong> Type your first query to see all users:</p>
                    <pre><code>SELECT * FROM users;</code></pre>
                    <p>The <code>*</code> means "all columns" and <code>FROM users</code> specifies which table to query.</p>

                    <p><strong>Stuck?</strong> Click "Show Solution" for help, or explore the table data in the left panel!</p>
                `,
                solution: "SELECT * FROM users;",
                hint: "Use SELECT * FROM users; to see all user data. Then try SELECT username FROM users; for just usernames."
            },
            2: {
                title: "Filtering with WHERE",
                content: `
                    <h2>🔍 Filtering Data with WHERE</h2>
                    <p>Great job! Now let's learn to filter data. The <code>WHERE</code> clause lets you specify conditions.</p>
                    
                    <h3>Finding Specific Users</h3>
                    <p>Let's find only the teachers in our community center. Teachers have <code>user_type = 'worker'</code>.</p>
                    <p><strong>Task:</strong> Write a query to find all users who are teachers (workers):</p>
                    <pre><code>SELECT * FROM users WHERE user_type = 'worker';</code></pre>

                    <h3>Different WHERE Conditions</h3>
                    <p>You can use various conditions:</p>
                    <ul>
                        <li><code>=</code> for exact matches</li>
                        <li><code>!=</code> or <code>&lt;&gt;</code> for not equal</li>
                        <li><code>LIKE</code> for pattern matching</li>
                        <li><code>AND</code>, <code>OR</code> for multiple conditions</li>
                    </ul>

                    <h3>Try It!</h3>
                    <p>Find all the teachers, then try finding all approved users!</p>
                `,
                solution: "SELECT * FROM users WHERE user_type = 'worker';",
                hint: "Use WHERE user_type = 'worker' to filter for teachers"
            },
            3: {
                title: "Sorting and Ordering",
                content: `
                    <h2>📊 Sorting Results with ORDER BY</h2>
                    <p>Now let's learn to sort our results! The <code>ORDER BY</code> clause organizes data.</p>
                    
                    <h3>Sorting Users</h3>
                    <p><strong>Task:</strong> Get all users sorted by their username alphabetically:</p>
                    <pre><code>SELECT * FROM users ORDER BY username;</code></pre>

                    <h3>Sorting Options</h3>
                    <ul>
                        <li><code>ORDER BY column</code> - ascending (A to Z, 1 to 10)</li>
                        <li><code>ORDER BY column DESC</code> - descending (Z to A, 10 to 1)</li>
                        <li><code>ORDER BY column1, column2</code> - multiple sort criteria</li>
                    </ul>

                    <h3>Try It!</h3>
                    <p>Sort users by username, then try sorting by created_at to see newest users first!</p>
                `,
                solution: "SELECT * FROM users ORDER BY username;",
                hint: "Use ORDER BY username to sort alphabetically"
            },
            4: {
                title: "Working with Users",
                content: `
                    <h2>👥 Exploring User Data</h2>
                    <p>Let's dive deeper into our users table and practice more complex queries.</p>
                    
                    <h3>Selecting Specific Columns</h3>
                    <p>Instead of using <code>*</code>, we can select specific columns:</p>
                    <p><strong>Task:</strong> Get just the username, email, and user_type of all users:</p>
                    <pre><code>SELECT username, email, user_type FROM users;</code></pre>

                    <h3>Combining WHERE and ORDER BY</h3>
                    <p><strong>Next Task:</strong> Find all approved students (visitors) sorted by username:</p>
                    <pre><code>SELECT username, email FROM users 
WHERE user_type = 'visitor' AND approved = 1 
ORDER BY username;</code></pre>

                    <h3>Try It!</h3>
                    <p>Practice selecting specific columns and combining different clauses!</p>
                `,
                solution: "SELECT username, email, user_type FROM users;",
                hint: "List the column names separated by commas after SELECT"
            },
            5: {
                title: "Class Management",
                content: `
                    <h2>📚 Exploring Classes</h2>
                    <p>Now let's look at the classes offered at our community center!</p>
                    
                    <h3>Finding Classes</h3>
                    <p><strong>Task:</strong> See all active classes:</p>
                    <pre><code>SELECT name, subject, capacity, schedule FROM classes WHERE status = 'active';</code></pre>

                    <h3>Filtering by Subject</h3>
                    <p><strong>Next Task:</strong> Find all fitness classes:</p>
                    <pre><code>SELECT name, description, schedule FROM classes WHERE subject = 'fitness';</code></pre>

                    <h3>Class Subjects Available</h3>
                    <p>Our community center offers classes in: fitness, arts, education, social, senior, youth, and other.</p>

                    <h3>Try It!</h3>
                    <p>Explore different class subjects and see what's available!</p>
                `,
                solution: "SELECT name, subject, capacity, schedule FROM classes WHERE status = 'active';",
                hint: "Filter classes using WHERE status = 'active'"
            },
            6: {
                title: "JOIN Operations",
                content: `
                    <h2>🔗 Connecting Tables with JOINs</h2>
                    <p>Now for the exciting part - connecting data from multiple tables!</p>
                    
                    <h3>Understanding JOINs</h3>
                    <p>JOINs let us combine data from related tables. Let's connect classes with their teachers.</p>
                    
                    <p><strong>Task:</strong> Get class names with their teacher's username:</p>
                    <pre><code>SELECT classes.name, classes.subject, users.username as teacher
FROM classes 
JOIN users ON classes.teacher_id = users.id;</code></pre>

                    <h3>Types of JOINs</h3>
                    <ul>
                        <li><code>JOIN</code> (or INNER JOIN) - only matching records</li>
                        <li><code>LEFT JOIN</code> - all records from left table</li>
                        <li><code>RIGHT JOIN</code> - all records from right table</li>
                    </ul>

                    <h3>Try It!</h3>
                    <p>See which teachers are running which classes!</p>
                `,
                solution: "SELECT classes.name, classes.subject, users.username as teacher FROM classes JOIN users ON classes.teacher_id = users.id;",
                hint: "Use JOIN to connect classes and users tables on teacher_id = id"
            },
            7: {
                title: "Aggregate Functions",
                content: `
                    <h2>📈 Counting and Summarizing Data</h2>
                    <p>Let's learn to summarize our data with aggregate functions!</p>
                    
                    <h3>Basic Counting</h3>
                    <p><strong>Task:</strong> Count how many users we have:</p>
                    <pre><code>SELECT COUNT(*) as total_users FROM users;</code></pre>

                    <h3>Grouping Data</h3>
                    <p><strong>Next Task:</strong> Count users by type:</p>
                    <pre><code>SELECT user_type, COUNT(*) as count 
FROM users 
GROUP BY user_type;</code></pre>

                    <h3>Other Aggregate Functions</h3>
                    <ul>
                        <li><code>COUNT()</code> - count records</li>
                        <li><code>SUM()</code> - sum numeric values</li>
                        <li><code>AVG()</code> - average of values</li>
                        <li><code>MAX()</code> - maximum value</li>
                        <li><code>MIN()</code> - minimum value</li>
                    </ul>

                    <h3>Try It!</h3>
                    <p>Try counting classes by subject or finding the class with maximum capacity!</p>
                `,
                solution: "SELECT COUNT(*) as total_users FROM users;",
                hint: "Use COUNT(*) to count all records in a table"
            },
            8: {
                title: "Attendance Analytics",
                content: `
                    <h2>📊 Analyzing Attendance Data</h2>
                    <p>Let's analyze student attendance patterns!</p>
                    
                    <h3>Attendance Summary</h3>
                    <p><strong>Task:</strong> Count attendance by status:</p>
                    <pre><code>SELECT status, COUNT(*) as count 
FROM class_attendance 
GROUP BY status;</code></pre>

                    <h3>Class Attendance Rates</h3>
                    <p><strong>Next Task:</strong> See attendance for each class:</p>
                    <pre><code>SELECT c.name, COUNT(ca.id) as total_attendance
FROM classes c
LEFT JOIN class_attendance ca ON c.id = ca.class_id
GROUP BY c.id, c.name;</code></pre>

                    <h3>Try It!</h3>
                    <p>Explore different attendance patterns and find insights!</p>
                `,
                solution: "SELECT status, COUNT(*) as count FROM class_attendance GROUP BY status;",
                hint: "Use GROUP BY status to group attendance records by their status"
            },
            9: {
                title: "Advanced Queries",
                content: `
                    <h2>🚀 Advanced SQL Techniques</h2>
                    <p>Let's combine everything you've learned for complex analysis!</p>
                    
                    <h3>Complex JOIN with Multiple Tables</h3>
                    <p><strong>Task:</strong> Get detailed enrollment information:</p>
                    <pre><code>SELECT c.name as class_name, 
       ce.student_name, 
       u.username as teacher
FROM class_enrollments ce
JOIN classes c ON ce.class_id = c.id
JOIN users u ON c.teacher_id = u.id
WHERE ce.status = 'active';</code></pre>

                    <h3>Subqueries</h3>
                    <p><strong>Next Task:</strong> Find classes with above-average capacity:</p>
                    <pre><code>SELECT name, capacity 
FROM classes 
WHERE capacity > (SELECT AVG(capacity) FROM classes);</code></pre>

                    <h3>Try It!</h3>
                    <p>Create your own complex queries to explore the data!</p>
                `,
                solution: "SELECT c.name as class_name, ce.student_name, u.username as teacher FROM class_enrollments ce JOIN classes c ON ce.class_id = c.id JOIN users u ON c.teacher_id = u.id WHERE ce.status = 'active';",
                hint: "Use multiple JOINs to connect class_enrollments, classes, and users tables"
            },
            10: {
                title: "Views and Reports",
                content: `
                    <h2>📋 Creating Views and Reports</h2>
                    <p>Congratulations! Let's finish with some practical reporting queries.</p>
                    
                    <h3>Class Summary Report</h3>
                    <p><strong>Task:</strong> Create a comprehensive class report:</p>
                    <pre><code>SELECT c.name,
       c.subject,
       c.capacity,
       COUNT(ce.id) as enrolled_students,
       u.username as teacher,
       c.schedule
FROM classes c
LEFT JOIN class_enrollments ce ON c.id = ce.class_id AND ce.status = 'active'
JOIN users u ON c.teacher_id = u.id
WHERE c.status = 'active'
GROUP BY c.id, c.name, c.subject, c.capacity, u.username, c.schedule;</code></pre>

                    <h3>Attendance Analysis</h3>
                    <p><strong>Final Task:</strong> Monthly attendance summary:</p>
                    <pre><code>SELECT strftime('%Y-%m', attendance_date) as month,
       COUNT(*) as total_attendances,
       COUNT(CASE WHEN status = 'present' THEN 1 END) as present_count
FROM class_attendance
GROUP BY strftime('%Y-%m', attendance_date);</code></pre>

                    <h3>🎉 Congratulations!</h3>
                    <p>You've completed the Community Center SQL Tutorial! You now know how to:</p>
                    <ul>
                        <li>Query single and multiple tables</li>
                        <li>Filter and sort data</li>
                        <li>Use aggregate functions</li>
                        <li>Create complex JOINs</li>
                        <li>Build analytical reports</li>
                    </ul>
                `,
                solution: "SELECT c.name, c.subject, c.capacity, COUNT(ce.id) as enrolled_students, u.username as teacher, c.schedule FROM classes c LEFT JOIN class_enrollments ce ON c.id = ce.class_id AND ce.status = 'active' JOIN users u ON c.teacher_id = u.id WHERE c.status = 'active' GROUP BY c.id, c.name, c.subject, c.capacity, u.username, c.schedule;",
                hint: "Use LEFT JOIN to include classes even if they have no enrollments, and GROUP BY to aggregate enrollment counts"
            }
        };
        
        console.log('Lessons loaded');
    }

    setupEventListeners() {
        // Query execution
        document.getElementById('run-query').addEventListener('click', () => {
            this.executeQuery();
        });

        // Clear query
        document.getElementById('clear-query').addEventListener('click', () => {
            document.getElementById('sql-input').value = '';
            document.getElementById('query-results').innerHTML = '<p class="no-results">Run a query to see results here...</p>';
            document.getElementById('query-info').innerHTML = '';
        });

        // Show solution
        document.getElementById('show-solution').addEventListener('click', () => {
            this.showSolution();
        });

        // Lesson navigation
        document.querySelectorAll('.lesson-link').forEach(link => {
            link.addEventListener('click', (e) => {
                e.preventDefault();
                const lesson = parseInt(e.target.dataset.lesson);
                this.loadLesson(lesson);
            });
        });

        // Enter key to run query
        document.getElementById('sql-input').addEventListener('keydown', (e) => {
            if (e.ctrlKey && e.key === 'Enter') {
                e.preventDefault();
                this.executeQuery();
            }
        });
    }

    loadLesson(lessonNumber) {
        if (!this.lessons[lessonNumber]) {
            console.error('Lesson not found:', lessonNumber);
            return;
        }

        this.currentLesson = lessonNumber;
        const lesson = this.lessons[lessonNumber];

        // Update lesson content
        document.getElementById('lesson-text').innerHTML = lesson.content;

        // Update active lesson link
        document.querySelectorAll('.lesson-link').forEach(link => {
            link.classList.remove('active');
            if (parseInt(link.dataset.lesson) === lessonNumber) {
                link.classList.add('active');
            }
        });

        // Clear previous results
        document.getElementById('query-results').innerHTML = '<p class="no-results">Run a query to see results here...</p>';
        document.getElementById('query-info').innerHTML = '';

        // Set a default query for lesson 1
        if (lessonNumber === 1) {
            document.getElementById('sql-input').value = 'SELECT * FROM users;';
        }

        console.log(`Loaded lesson ${lessonNumber}: ${lesson.title}`);
    }

    executeQuery() {
        const query = document.getElementById('sql-input').value.trim();
        
        if (!query) {
            this.showError('Please enter a SQL query.');
            return;
        }

        try {
            const startTime = performance.now();
            const results = this.db.exec(query);
            const endTime = performance.now();
            const executionTime = (endTime - startTime).toFixed(2);

            this.displayResults(results, executionTime);
            
            // Check if query matches expected solution (optional validation)
            this.validateQuery(query);
            
        } catch (error) {
            this.showError(`SQL Error: ${error.message}`);
        }
    }

    displayResults(results, executionTime) {
        const resultsContainer = document.getElementById('query-results');
        const queryInfo = document.getElementById('query-info');

        if (!results || results.length === 0) {
            resultsContainer.innerHTML = '<p class="no-results">Query executed successfully but returned no results.</p>';
            queryInfo.innerHTML = `Query executed in ${executionTime}ms`;
            queryInfo.className = 'query-info';
            return;
        }

        const result = results[0];
        const { columns, values } = result;

        // Create table HTML
        let html = '<table class="results-table"><thead><tr>';
        columns.forEach(col => {
            html += `<th>${col}</th>`;
        });
        html += '</tr></thead><tbody>';

        values.forEach(row => {
            html += '<tr>';
            row.forEach(cell => {
                html += `<td>${cell !== null ? cell : 'NULL'}</td>`;
            });
            html += '</tr>';
        });
        html += '</tbody></table>';

        resultsContainer.innerHTML = html;
        
        // Show query info
        queryInfo.innerHTML = `Query executed in ${executionTime}ms • ${values.length} row${values.length !== 1 ? 's' : ''} returned`;
        queryInfo.className = 'query-info';
    }

    showError(message) {
        const resultsContainer = document.getElementById('query-results');
        const queryInfo = document.getElementById('query-info');
        
        resultsContainer.innerHTML = `<p class="no-results">❌ ${message}</p>`;
        queryInfo.innerHTML = 'Query failed';
        queryInfo.className = 'query-info query-error';
    }

    showSolution() {
        const lesson = this.lessons[this.currentLesson];
        if (lesson && lesson.solution) {
            document.getElementById('sql-input').value = lesson.solution;
            // Optionally execute the solution
            this.executeQuery();
        }
    }

    validateQuery(query) {
        // Optional: Add query validation logic here
        // This could check if the query matches expected patterns for the lesson
        const lesson = this.lessons[this.currentLesson];
        if (lesson && lesson.hint) {
            // Could add more sophisticated validation here
            console.log('Query validation could be added here');
        }
    }

    // Method to load table data for preview
    loadTableData(tableName) {
        try {
            const results = this.db.exec(`SELECT * FROM ${tableName} LIMIT 10`);
            if (results && results.length > 0) {
                const { columns, values } = results[0];
                
                let html = '<table><thead><tr>';
                columns.forEach(col => {
                    html += `<th>${col}</th>`;
                });
                html += '</tr></thead><tbody>';

                values.forEach(row => {
                    html += '<tr>';
                    row.forEach(cell => {
                        html += `<td>${cell !== null ? cell : 'NULL'}</td>`;
                    });
                    html += '</tr>';
                });
                html += '</tbody></table>';
                
                if (values.length === 10) {
                    html += '<p style="font-size: 0.7rem; color: var(--text-secondary); margin-top: 0.5rem; font-style: italic;">Showing first 10 rows...</p>';
                }
                
                return html;
            } else {
                return '<p style="color: var(--text-secondary); font-style: italic;">No data found</p>';
            }
        } catch (error) {
            return `<p style="color: var(--error-color);">Error loading table: ${error.message}</p>`;
        }
    }
}

// Global function for toggling table data (needed for onclick handlers)
let tutorialInstance = null;

function toggleTableData(tableName) {
    if (!tutorialInstance) return;
    
    const dataDiv = document.getElementById(`${tableName}-data`);
    const toggleBtn = dataDiv.parentElement.querySelector('.toggle-table');
    
    if (dataDiv.style.display === 'none') {
        // Show table data
        dataDiv.innerHTML = '<div class="loading">Loading...</div>';
        dataDiv.style.display = 'block';
        toggleBtn.textContent = 'Hide Data ▲';
        
        // Load the actual data
        setTimeout(() => {
            dataDiv.innerHTML = tutorialInstance.loadTableData(tableName);
        }, 100);
    } else {
        // Hide table data
        dataDiv.style.display = 'none';
        toggleBtn.textContent = 'Show Data ▼';
    }
}

// Initialize the tutorial when the page loads
document.addEventListener('DOMContentLoaded', () => {
    tutorialInstance = new SQLTutorial();
});