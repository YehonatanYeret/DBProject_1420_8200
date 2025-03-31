# Database Project

## Table of Contents
- [Introduction](#introduction)
- [ERD (Entity-Relationship Diagram)](#erd-entity-relationship-diagram)
- [DSD (Data Structure Diagram)](#dsd-data-structure-diagram)
- [SQL Scripts](#sql-scripts)
- [Data Insertion](#data-insertion)
- [Backup and Restore](#backup-and-restore)

---

## Introduction

### Project Overview
This project is part of a **Database Fundamentals Course** and focuses on designing, implementing, and managing a structured database. The system is designed to store and process essential data efficiently while ensuring reliability and accessibility.

### Purpose of the Database
The primary goals of this project are:
- **Database Design**: Creating a well-structured relational database.
- **Efficient Data Storage**: Organizing data to allow quick retrieval and manipulation.
- **Data Integrity and Consistency**: Implementing constraints to maintain valid data.
- **Backup and Recovery**: Ensuring that data is not lost and can be restored when needed.

### Key Functionalities
- **Data storage and retrieval** using SQL queries.
- **Relationships between tables** ensuring logical connections.
- **Simulating real-world scenarios** where database management is crucial.
- **Automation of data entry** using external tools.

---

## ERD (Entity-Relationship Diagram)
The **ERD** illustrates the logical structure of the database, showing entities, attributes, and relationships.

![ERD Diagram](Phase1/images/ERD.png)

---

## DSD (Data Structure Diagram)
The **DSD** provides a detailed view of table structures and relationships.

![DSD Diagram](Phase1/images/DSD.png)

---

## SQL Scripts
The following SQL scripts are included in the repository:

- **Create Tables**: Defines the database schema.  
  📜 [View `create_tables.sql`](Phase1/Scripts/createTables.sql)
- **Insert Data**: Populates the tables with sample data.  
  📜 [View `insert_data.sql`](Phase1/Scripts/insertTables.sql)
- **Drop Tables**: Removes all tables from the database.  
  📜 [View `drop_tables.sql`](Phase1/Scripts/dropTables.sql)
- **Select All Data**: Retrieves all data from the tables.  
  📜 [View `select_all.sql`](Phase1/Scripts/selectAll.sql)

---

## Data Insertion
To generate and insert realistic data, three different methods were used:

### 1. Mock Data Generation (Mockaroo)
- Used to generate random CSV files for data insertion.
- Example:
  - 📜 [View `mock_data.csv`](Phase1/mockarooFiles)
  - ![Mockaroo Data](Phase1/images/mockaroo_data.png)

### 2. Generated Data Tool
- Created structured test data.
- Example:
  - 📜 [View `generated_data.csv`](Phase1/generateData/generated_data.csv)
  - ![Generated Data](Phase1/images/generated_data.jpg)

### 3. Python Script for Data Generation
- Automated data generation with Python scripts.
- Example:
  - 📜 [View `python_generated_data.csv`](Phase1/Programming/from_csv_to_sql.py)
  - ![Python Generated Data](Phase1/images/python_data.png)

---

## Backup and Restore
Database backups are stored with timestamps to ensure data safety and recovery when needed.

📂 [Go to Backup Directory](Phase1/Backup)

### Backup Process
![Backup Process](Phase1/images/backup.jpg)

### Restore Process
![Backup Process](Phase1/images/restore.jpg)

---

This document serves as a comprehensive guide to the database project, outlining its structure, implementation, and management processes.
