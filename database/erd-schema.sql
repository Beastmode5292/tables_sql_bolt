-- ERD-Based Database Schema
-- SQLite compatible version for SQL.js

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