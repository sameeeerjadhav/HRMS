# HRMS Next.js Portal

This is the Next.js frontend portal for the HRMS application.

## Getting Started

1. Clone the repository.
2. Ensure you have the `.env` file from the root directory or create one with your `DATABASE_URL` pointing to your MariaDB/MySQL database.
3. Install dependencies:
   ```bash
   npm install
   ```
4. Run the development server:
   ```bash
   npm run dev
   ```

## Features

- **Admin Dashboard**: Manage employees, leave types, tasks, projects, and ACL requests.
- **Manager Portal**: Manage your team, assign tasks, view Gantt charts, and handle team leaves/regularizations.
- **Employee Self-Service**: Request leaves, regularize attendance, view payslips, and see project Gantt charts.

## Technologies Used

- [Next.js](https://nextjs.org/) (App Router)
- [React](https://reactjs.org/)
- [Prisma ORM](https://www.prisma.io/)
- [MariaDB](https://mariadb.org/)
