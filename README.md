# 🚀 Project Startup Guide

This document outlines the required sequence of commands to set up the environment, start the services using Docker Compose, and initialize the database structure and default data.

---

Run this command in the **main project directory**:

```bash
cp .env.example .env
docker compose up

cd backend
cp .env.example .env
npm run migration:up
npm run seed:admin
```
