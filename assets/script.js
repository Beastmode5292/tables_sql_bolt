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
        // Load initial interface
        this.loadInitialInterface();            console.log('Community Center SQL Tutorial initialized successfully!');
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
        // Load the ERD-based database schema
        try {
            const response = await fetch('database/erd-schema.sql');
            const schema = await response.text();
            this.db.exec(schema);
            console.log('Database loaded successfully');
        } catch (error) {
            console.error('Error loading database:', error);
            // Fallback to inline schema if file loading fails
            await this.loadInlineSchema();
        }
    }

    async loadInlineSchema() {
        // ERD-Based Database Schema as fallback
        const schema = `
            -- ERD-Based Database Schema
            CREATE TABLE VehicleNUM (
                VehicleNUM TEXT PRIMARY KEY,
                Make TEXT,
                Model TEXT,
                Year INTEGER,
                License_Plate TEXT,
                Capacity INTEGER,
                Accessibility_Features TEXT,
                Status TEXT
            );

            CREATE TABLE Transportation (
                TransportationID INTEGER PRIMARY KEY AUTOINCREMENT,
                VehicleNUM TEXT,
                Route_Name TEXT,
                Pickup_Time TIME,
                Dropoff_Time TIME,
                Driver_Name TEXT,
                FOREIGN KEY (VehicleNUM) REFERENCES VehicleNUM(VehicleNUM)
            );

            CREATE TABLE Participant (
                ParticipantID INTEGER PRIMARY KEY AUTOINCREMENT,
                First_Name TEXT NOT NULL,
                Last_Name TEXT NOT NULL,
                Date_of_Birth DATE,
                Phone TEXT,
                Address TEXT,
                TransportationID INTEGER,
                FOREIGN KEY (TransportationID) REFERENCES Transportation(TransportationID)
            );

            CREATE TABLE EmergencyContact (
                EmergencyContactID INTEGER PRIMARY KEY AUTOINCREMENT,
                ParticipantID INTEGER,
                Contact_Name TEXT,
                Relationship TEXT,
                Phone TEXT,
                FOREIGN KEY (ParticipantID) REFERENCES Participant(ParticipantID)
            );

            CREATE TABLE Facility (
                FacilityID INTEGER PRIMARY KEY AUTOINCREMENT,
                Facility_Name TEXT NOT NULL,
                Address TEXT,
                Phone TEXT,
                Manager_Name TEXT
            );

            CREATE TABLE Room (
                RoomID INTEGER PRIMARY KEY AUTOINCREMENT,
                FacilityID INTEGER,
                Room_Name TEXT,
                Capacity INTEGER,
                Equipment TEXT,
                FOREIGN KEY (FacilityID) REFERENCES Facility(FacilityID)
            );

            CREATE TABLE Instructor (
                InstructorID INTEGER PRIMARY KEY AUTOINCREMENT,
                First_Name TEXT NOT NULL,
                Last_Name TEXT NOT NULL,
                Phone TEXT,
                Email TEXT,
                Certification TEXT
            );

            CREATE TABLE Class (
                ClassID INTEGER PRIMARY KEY AUTOINCREMENT,
                Class_Name TEXT NOT NULL,
                InstructorID INTEGER,
                RoomID INTEGER,
                Start_Date DATE,
                End_Date DATE,
                Schedule TEXT,
                Max_Capacity INTEGER,
                Cost DECIMAL(10,2),
                FOREIGN KEY (InstructorID) REFERENCES Instructor(InstructorID),
                FOREIGN KEY (RoomID) REFERENCES Room(RoomID)
            );

            CREATE TABLE Attendance (
                AttendanceID INTEGER PRIMARY KEY AUTOINCREMENT,
                ParticipantID INTEGER,
                ClassID INTEGER,
                Date DATE,
                Status TEXT,
                FOREIGN KEY (ParticipantID) REFERENCES Participant(ParticipantID),
                FOREIGN KEY (ClassID) REFERENCES Class(ClassID)
            );

            CREATE TABLE Activity (
                ActivityID INTEGER PRIMARY KEY AUTOINCREMENT,
                Activity_Name TEXT NOT NULL,
                Description TEXT,
                Date DATE,
                FacilityID INTEGER,
                Cost DECIMAL(10,2),
                FOREIGN KEY (FacilityID) REFERENCES Facility(FacilityID)
            );

            CREATE TABLE ParticipantActivity (
                ParticipantActivityID INTEGER PRIMARY KEY AUTOINCREMENT,
                ParticipantID INTEGER,
                ActivityID INTEGER,
                Registration_Date DATE,
                Status TEXT,
                FOREIGN KEY (ParticipantID) REFERENCES Participant(ParticipantID),
                FOREIGN KEY (ActivityID) REFERENCES Activity(ActivityID)
            );

            CREATE TABLE Meal (
                MealID INTEGER PRIMARY KEY AUTOINCREMENT,
                ParticipantID INTEGER,
                Meal_Type TEXT,
                Date DATE,
                Special_Dietary_Needs TEXT,
                Cost DECIMAL(10,2),
                FOREIGN KEY (ParticipantID) REFERENCES Participant(ParticipantID)
            );

            -- Sample Data
            INSERT INTO VehicleNUM (VehicleNUM, Make, Model, Year, License_Plate, Capacity, Accessibility_Features, Status) VALUES
            ('V001', 'Ford', 'Transit', 2020, 'ABC123', 12, 'Wheelchair ramp', 'Active'),
            ('V002', 'Chevrolet', 'Express', 2019, 'DEF456', 15, 'None', 'Active'),
            ('V003', 'Mercedes', 'Sprinter', 2021, 'GHI789', 20, 'Wheelchair lift, handrails', 'Active'),
            ('V004', 'Toyota', 'Hiace', 2018, 'JKL012', 10, 'Low floor entry', 'Maintenance');

            INSERT INTO Transportation (VehicleNUM, Route_Name, Pickup_Time, Dropoff_Time, Driver_Name) VALUES
            ('V001', 'Downtown Route', '08:00', '17:00', 'John Driver'),
            ('V002', 'Suburban Route A', '08:30', '16:30', 'Sarah Transport'),
            ('V003', 'Senior Express', '09:00', '15:00', 'Mike Wheeler'),
            ('V002', 'Evening Route', '18:00', '21:00', 'Lisa Evening');

            INSERT INTO Participant (First_Name, Last_Name, Date_of_Birth, Phone, Address, TransportationID) VALUES
            ('Alice', 'Johnson', '1985-03-15', '555-0101', '123 Oak Street', 1),
            ('Bob', 'Smith', '1978-07-22', '555-0102', '456 Pine Avenue', 2),
            ('Carol', 'Williams', '1990-11-08', '555-0103', '789 Maple Drive', 1),
            ('David', 'Brown', '1967-12-03', '555-0104', '321 Elm Street', 3),
            ('Emma', 'Davis', '1992-05-17', '555-0105', '654 Cedar Lane', NULL);

            INSERT INTO EmergencyContact (ParticipantID, Contact_Name, Relationship, Phone) VALUES
            (1, 'John Johnson', 'Spouse', '555-0201'),
            (2, 'Mary Smith', 'Wife', '555-0202'),
            (3, 'Tom Williams', 'Father', '555-0203'),
            (4, 'Susan Brown', 'Daughter', '555-0204'),
            (5, 'Robert Davis', 'Brother', '555-0205');

            INSERT INTO Facility (Facility_Name, Address, Phone, Manager_Name) VALUES
            ('Main Community Center', '100 Community Drive', '555-1001', 'Jane Manager'),
            ('Sports Complex', '200 Athletic Way', '555-1002', 'Mike Sports'),
            ('Arts & Crafts Building', '300 Creative Street', '555-1003', 'Lisa Arts'),
            ('Senior Center', '400 Golden Years Blvd', '555-1004', 'Bob Senior');

            INSERT INTO Room (FacilityID, Room_Name, Capacity, Equipment) VALUES
            (1, 'Main Hall', 100, 'Sound system, projector, chairs'),
            (1, 'Conference Room A', 25, 'Tables, whiteboard, TV'),
            (2, 'Gymnasium', 200, 'Basketball hoops, mats, equipment storage'),
            (3, 'Art Studio', 30, 'Easels, pottery wheels, kiln'),
            (4, 'Activities Room', 50, 'Games, comfortable seating, TV');

            INSERT INTO Instructor (First_Name, Last_Name, Phone, Email, Certification) VALUES
            ('Sarah', 'Fitness', '555-2001', 'sarah.fitness@center.com', 'Certified Personal Trainer'),
            ('Mark', 'Artist', '555-2002', 'mark.artist@center.com', 'Art Education Degree'),
            ('Linda', 'Teacher', '555-2003', 'linda.teacher@center.com', 'Adult Education Certification'),
            ('James', 'Coach', '555-2004', 'james.coach@center.com', 'Sports Coaching License');

            INSERT INTO Class (Class_Name, InstructorID, RoomID, Start_Date, End_Date, Schedule, Max_Capacity, Cost) VALUES
            ('Morning Yoga', 1, 1, '2024-01-15', '2024-03-15', 'Mon/Wed/Fri 9:00-10:00', 20, 75.00),
            ('Pottery Workshop', 2, 4, '2024-02-01', '2024-04-30', 'Tuesday 2:00-4:00', 15, 120.00),
            ('Computer Basics', 3, 2, '2024-01-10', '2024-02-28', 'Thursday 10:00-12:00', 12, 50.00),
            ('Senior Basketball', 4, 3, '2024-01-20', '2024-05-20', 'Monday 3:00-4:30', 25, 40.00);

            INSERT INTO Attendance (ParticipantID, ClassID, Date, Status) VALUES
            (1, 1, '2024-01-15', 'Present'),
            (1, 1, '2024-01-17', 'Present'),
            (2, 3, '2024-01-11', 'Present'),
            (3, 2, '2024-02-06', 'Absent'),
            (4, 4, '2024-01-22', 'Present'),
            (5, 1, '2024-01-15', 'Present');

            INSERT INTO Activity (Activity_Name, Description, Date, FacilityID, Cost) VALUES
            ('Spring Festival', 'Annual community celebration with food and entertainment', '2024-04-15', 1, 10.00),
            ('Art Exhibition', 'Display of participant artwork', '2024-03-20', 3, 5.00),
            ('Health Fair', 'Free health screenings and wellness information', '2024-02-28', 4, 0.00),
            ('Sports Tournament', 'Multi-sport competition for all ages', '2024-05-10', 2, 15.00);

            INSERT INTO ParticipantActivity (ParticipantID, ActivityID, Registration_Date, Status) VALUES
            (1, 1, '2024-02-01', 'Registered'),
            (2, 3, '2024-02-15', 'Registered'),
            (3, 2, '2024-03-01', 'Registered'),
            (4, 4, '2024-04-01', 'Waitlist'),
            (5, 1, '2024-02-10', 'Registered');

            INSERT INTO Meal (ParticipantID, Meal_Type, Date, Special_Dietary_Needs, Cost) VALUES
            (1, 'Lunch', '2024-01-15', 'Vegetarian', 8.50),
            (2, 'Lunch', '2024-01-15', 'Gluten-free', 8.50),
            (4, 'Lunch', '2024-01-15', 'Low sodium', 8.50),
            (5, 'Dinner', '2024-01-20', 'None', 12.00),
            (3, 'Lunch', '2024-01-16', 'Dairy-free', 8.50);
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
                    <h2>SQL Lesson 1: SELECT queries</h2>
                    <p>To retrieve data from a SQL database, we need to write <code>SELECT</code> statements, which are often colloquially refered to as queries. A query in itself is just a statement which declares what data we are looking for, where to find it in the database, and optionally, how to transform it before it is returned. It has a specific syntax though, which is what we are going to learn in the following exercises.</p>
                    
                    <p>As we can see in the community center below, the database represents the community center with all the users, classes, events, and attendance data that you might need to run a community center. To continue onto the next lesson, alter the query to find the exact information we need for each task.</p>

                    <div id="table-display"></div>
                `,
                solution: "SELECT * FROM users;",
                hint: "Use SELECT * FROM users; to see all user data."
            },
            2: {
                title: "Filtering with WHERE",
                content: `
                    <h2>SQL Lesson 2: Queries with constraints (Pt. 1)</h2>
                    <p>Now we have a table with a few rows of data in it, but if we had a table with thousands or even millions of rows, reading through all the rows would be inefficient and perhaps even impossible.</p>
                    
                    <p>In order to filter certain results from being returned, we need to use a <code>WHERE</code> clause in the query. The clause is applied to each row of data by checking specific column values to determine whether it should be included in the results or not.</p>

                    <div id="table-display"></div>

                    <p>More complex clauses can be constructed by joining numerous <code>AND</code> or <code>OR</code> logical keywords (ie. <code>num_wheels >= 4 AND doors <= 2</code>). Below are some useful operators that you can use for numerical data (ie. integer or floating point):</p>
                    
                    <table class="operator-table">
                        <tr><th>Operator</th><th>Condition</th><th>SQL Example</th></tr>
                        <tr><td>=, !=, &lt; &lt;=, &gt;, &gt;=</td><td>Standard numerical operators</td><td>col_name != 4</td></tr>
                        <tr><td>BETWEEN … AND …</td><td>Number is within range of two values (inclusive)</td><td>col_name BETWEEN 1.5 AND 10.5</td></tr>
                        <tr><td>NOT BETWEEN … AND …</td><td>Number is not within range of two values (inclusive)</td><td>col_name NOT BETWEEN 1 AND 10</td></tr>
                        <tr><td>IN (…)</td><td>Number exists in a list</td><td>col_name IN (2, 4, 6)</td></tr>
                        <tr><td>NOT IN (…)</td><td>Number does not exist in a list</td><td>col_name NOT IN (1, 3, 5)</td></tr>
                    </table>
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



        // Enter key to run query
        document.getElementById('sql-input').addEventListener('keydown', (e) => {
            if (e.ctrlKey && e.key === 'Enter') {
                e.preventDefault();
                this.executeQuery();
            }
        });
    }

    loadInitialInterface() {
        // Set initial content
        const initialContent = `
            <h2>Community Center SQL Tutorial</h2>
            <p>Welcome to the interactive SQL tutorial! Use the database tables on the left to explore the community center data, then write and execute SQL queries below.</p>
            
            <h3>Getting Started</h3>
            <p>Click "Show Data" on any table in the left panel to view the actual data, then experiment with SQL queries to explore and analyze the community center database.</p>
            
            <div id="table-display"></div>
        `;

        // Store original content
        this.originalLessonContent = initialContent;

        // Update lesson content
        document.getElementById('lesson-text').innerHTML = initialContent;

        // Clear previous results
        document.getElementById('query-results').innerHTML = '<p class="no-results">Run a query to see results here...</p>';
        document.getElementById('query-info').innerHTML = '';

        // Set default query
        document.getElementById('sql-input').value = 'SELECT * FROM Participant;';

        // Show Participant table by default
        setTimeout(() => this.displayTableInLesson('Participant'), 100);

        console.log('Community Center SQL Tutorial initialized');
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

    // Method to display table directly in lesson content (like SQLBolt)
    displayTableInLesson(tableName, replaceContent = false) {
        try {
            const results = this.db.exec(`SELECT * FROM ${tableName}`);
            if (results && results.length > 0) {
                const { columns, values } = results[0];
                
                let html = `
                    <div class="lesson-table-container">
                        <h3>Table: ${tableName.charAt(0).toUpperCase() + tableName.slice(1)}</h3>
                        <div class="lesson-table-wrapper">
                            <table class="lesson-table">
                                <thead>
                                    <tr>`;
                
                columns.forEach(col => {
                    html += `<th>${col}</th>`;
                });
                
                html += `</tr>
                                </thead>
                                <tbody>`;

                values.forEach((row, index) => {
                    html += '<tr>';
                    row.forEach(cell => {
                        html += `<td>${cell !== null ? cell : 'NULL'}</td>`;
                    });
                    html += '</tr>';
                });
                
                html += `</tbody>
                            </table>
                        </div>
                    </div>`;
                
                if (replaceContent) {
                    // Replace entire lesson content with just the table
                    document.getElementById('lesson-text').innerHTML = html;
                } else {
                    // Insert into designated table display area
                    const tableDisplayDiv = document.getElementById('table-display');
                    if (tableDisplayDiv) {
                        tableDisplayDiv.innerHTML = html;
                    }
                }
            } else {
                const message = '<p>No data found</p>';
                if (replaceContent) {
                    document.getElementById('lesson-text').innerHTML = message;
                } else {
                    const tableDisplayDiv = document.getElementById('table-display');
                    if (tableDisplayDiv) {
                        tableDisplayDiv.innerHTML = message;
                    }
                }
            }
        } catch (error) {
            const errorMessage = `<p style="color: var(--error-color);">Error loading table: ${error.message}</p>`;
            if (replaceContent) {
                document.getElementById('lesson-text').innerHTML = errorMessage;
            } else {
                const tableDisplayDiv = document.getElementById('table-display');
                if (tableDisplayDiv) {
                    tableDisplayDiv.innerHTML = errorMessage;
                }
            }
        }
    }

    // Method to reset lesson content to original state
    resetLessonContent() {
        if (this.originalLessonContent) {
            document.getElementById('lesson-text').innerHTML = this.originalLessonContent;
            
            // Re-initialize table display with users table
            setTimeout(() => this.displayTableInLesson('users'), 100);
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
        // Show table data in the main lesson content area (replace entire content)
        tutorialInstance.displayTableInLesson(tableName, true);
        
        // Update the button text for this table
        toggleBtn.textContent = 'Hide Data ▲';
        dataDiv.style.display = 'block';
        
        // Reset all other buttons
        document.querySelectorAll('.toggle-table').forEach(btn => {
            if (btn !== toggleBtn) {
                btn.textContent = 'Show Data ▼';
                const siblingData = btn.parentElement.parentElement.querySelector('.table-data');
                if (siblingData) siblingData.style.display = 'none';
            }
        });
    } else {
        // Hide the table and reset to lesson content
        tutorialInstance.resetLessonContent();
        toggleBtn.textContent = 'Show Data ▼';
        dataDiv.style.display = 'none';
    }
}

// Initialize the tutorial when the page loads
document.addEventListener('DOMContentLoaded', () => {
    tutorialInstance = new SQLTutorial();
});