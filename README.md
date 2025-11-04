# 🏢 Community Center SQL Tutorial

An interactive SQL learning platform inspired by SQLBolt, using a real-world community center database. Learn SQL with hands-on practice using realistic data about users, classes, events, and attendance!

## 🌟 Features

- **Interactive SQL Editor** - Write and execute SQL queries in your browser
- **Real-World Database** - Practice with a community center management system
- **Progressive Lessons** - 10 structured lessons from basic to advanced SQL
- **Instant Feedback** - See query results immediately
- **Mobile Responsive** - Learn SQL on any device
- **No Installation Required** - Runs entirely in the browser using SQL.js

## 📚 What You'll Learn

### Database Schema
- **users** - Teachers (workers) and students (visitors)
- **classes** - Various classes offered by teachers  
- **class_enrollments** - Students enrolled in classes
- **class_attendance** - Daily attendance records
- **events** - Community events and activities
- **messages** - Communication between students and teachers

### SQL Skills Covered
1. **Basic SELECT** - Retrieving data from tables
2. **WHERE Clauses** - Filtering data with conditions
3. **ORDER BY** - Sorting results
4. **Working with Users** - Selecting specific columns
5. **Class Management** - Exploring class data
6. **JOIN Operations** - Connecting multiple tables
7. **Aggregate Functions** - COUNT, SUM, AVG, etc.
8. **Attendance Analytics** - Analyzing attendance patterns
9. **Advanced Queries** - Complex multi-table operations
10. **Views and Reports** - Creating comprehensive reports

## 🚀 Getting Started

1. **Clone the repository**:
   ```bash
   git clone https://github.com/yourusername/community-center-sql-tutorial.git
   cd community-center-sql-tutorial
   ```

2. **Open in browser**:
   - Simply open `index.html` in your web browser
   - No server setup required!

3. **Start learning**:
   - Follow the lessons in order
   - Type SQL queries in the editor
   - Click "Run Query" to see results
   - Use "Show Solution" if you get stuck

## 💻 Usage

### Running Queries
- Type your SQL query in the editor
- Click "Run Query" or press `Ctrl+Enter`
- View results in the table below
- Use "Clear" to reset the editor

### Navigation
- Click lesson links to jump between topics
- Each lesson builds on previous concepts
- Progress through lessons at your own pace

### Example Queries
```sql
-- See all users
SELECT * FROM users;

-- Find all fitness classes
SELECT name, schedule FROM classes WHERE subject = 'fitness';

-- Get class enrollment with teacher names
SELECT c.name as class_name, ce.student_name, u.username as teacher
FROM class_enrollments ce
JOIN classes c ON ce.class_id = c.id  
JOIN users u ON c.teacher_id = u.id;
```

## 🛠️ Technology Stack

- **Frontend**: HTML5, CSS3, JavaScript (ES6+)
- **SQL Engine**: SQL.js (SQLite compiled to WebAssembly)
- **Database**: SQLite with sample community center data
- **Styling**: Modern CSS with CSS Grid and Flexbox
- **No Backend Required**: Runs entirely client-side

## 📁 Project Structure

```
community-center-sql-tutorial/
├── index.html              # Main application page
├── assets/
│   ├── style.css           # Application styles
│   └── script.js           # JavaScript logic and lessons
├── database/
│   └── schema.sql          # Original MySQL schema
├── lessons/
│   └── (lesson content embedded in script.js)
├── README.md
├── LICENSE
└── .gitignore
```

## 🤝 Contributing

Contributions are welcome! Here are ways you can help:

1. **Add More Lessons** - Create advanced SQL topics
2. **Improve UI/UX** - Enhance the user interface
3. **Fix Bugs** - Report and fix issues
4. **Add Features** - Query history, bookmarks, etc.
5. **Documentation** - Improve README and code comments

### How to Contribute
1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 🐛 Issues and Support

- **Report Bugs**: Use GitHub Issues
- **Feature Requests**: Create an issue with the "enhancement" label
- **Questions**: Use GitHub Discussions

## 📝 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🎯 Learning Objectives

By completing this tutorial, you will be able to:
- Write basic to advanced SQL queries
- Understand database relationships and JOINs
- Perform data analysis with aggregate functions
- Create reports from relational data
- Apply SQL skills to real-world scenarios

## 🌐 Browser Compatibility

- Chrome/Chromium 60+
- Firefox 55+
- Safari 12+
- Edge 79+

## 🚀 Deployment

### GitHub Pages
1. Enable GitHub Pages in repository settings
2. Select source branch (main)
3. Your tutorial will be available at `https://yourusername.github.io/community-center-sql-tutorial`

### Local Development
```bash
# Clone and open
git clone https://github.com/yourusername/community-center-sql-tutorial.git
cd community-center-sql-tutorial
open index.html  # or double-click the file
```

## 🔗 Related Projects

- [SQLBolt](https://sqlbolt.com/) - Original inspiration
- [SQL.js](https://github.com/sql-js/sql.js) - SQL engine used
- [W3Schools SQL Tutorial](https://www.w3schools.com/sql/) - Additional learning resource

## ⭐ Show Your Support

If this project helped you learn SQL, please give it a star ⭐ on GitHub!

---

**Happy Learning! 🎓**

Made with ❤️ for SQL learners everywhere.