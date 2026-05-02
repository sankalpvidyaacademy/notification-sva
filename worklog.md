---
Task ID: 1
Agent: Main Agent
Task: Implement Sankalp Notification System v3 - Dynamic Layout + Messaging System

Work Log:
- Updated Prisma schema: Added Message model for direct messaging and reply system
- Added senderRole field to Notification model with default "ADMIN"
- Ran db:push to sync schema with SQLite database
- Created /api/messages route with GET (role-based filtering), POST (send/reply), DELETE
- Updated /api/notifications POST to include senderRole
- Updated Sidebar: Added Send Message, Student Messages, All Messages menu items
- Created MessageForm component: Students send direct messages to Admin/Teacher
- Created MessageList component: Threaded messages with reply, role badges, expand/collapse
- Updated Dashboard: New pages for messaging, dynamic layout with flex sticky footer
- Updated NotificationList: Admin tab-based filtering (All/Admin/Teacher/Student)
- All APIs tested successfully, lint passes cleanly

Stage Summary:
- Complete messaging system with direct messages and threaded replies
- Admin monitors all messages (full visibility)
- Students can message Admin or specific Teachers
- Teachers can reply to student messages
- Admin notification tabs for filtering by sender role
- Dynamic layout with sticky footer
