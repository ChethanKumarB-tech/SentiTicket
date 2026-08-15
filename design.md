# SentiTicket Design System
## 1. Product Identity- Product name: SentiTicket- Product type: Smart Support Ticketing System with SLA Prediction- Product surface: Enterprise web application- Primary users:
  - Customers
  - Support Agents
  - Managers
  - Administrators
## 2. Design Mission
Create a professional enterprise support platform that makes ticket status, SLA urgency, workload, and predicted SLA 
breach risk immediately understandable.
The interface must prioritize operational clarity over decorative design.
The primary question the interface must answer is:
> What needs attention right now?
The primary information hierarchy is:
1. Critical tickets
2. At-risk tickets
3. SLA countdown
4. Predicted breach risk
5. Required action
6. Ticket priority
7. Assignment
8. Agent workload--
## 3. Visual Direction
SentiTicket must have a:- Professional- Modern- Enterprise- Clean- Technical- Trustworthy- Data-driven- Security-conscious
visual identity.
The interface should feel appropriate for:- IT support teams- Enterprise help desks- Internal support departments- Customer support teams- Technical operations teams
Avoid:- Gaming aesthetics- Cryptocurrency-style dashboards- Excessive gradients- Excessive glassmorphism- Excessive animation- Neon colors- Excessive rounded cards- Unnecessary decorative elements- Marketing-style visual clutter
The interface should prioritize information density while remaining readable.--
## 4. Brand Personality
SentiTicket should communicate:- Reliability- Intelligence- Security- Speed- Accountability- Operational awareness
Writing should be:- Concise- Professional- Clear- Direct- Action-oriented
Avoid unnecessary technical terminology in user-facing messages.
Page 1
--
## 5. Primary Design Concept
The visual system should use a clean enterprise dashboard structure.
Desktop:
Sidebar + Header + Main Content
Mobile:
Header + Main Content + Mobile Navigation--
## 6. Design Tokens
All UI components must use centralized semantic design tokens.
Do not scatter raw values throughout components.--
## 7. Color Palette
Primary:
color.primary = #2563EB
color.primary.hover = #1D4ED8
color.primary.active = #1E40AF
color.primary.light = #DBEAFE
Success:
color.success = #16A34A
color.success.light = #DCFCE7
color.success.text = #166534
Warning:
color.warning = #D97706
color.warning.light = #FEF3C7
color.warning.text = #92400E
Danger:
color.danger = #DC2626
color.danger.light = #FEE2E2
color.danger.text = #991B1B
Info:
color.info = #0891B2
color.info.light = #CFFAFE
color.info.text = #155E75
Neutral:
color.neutral = #64748B
color.neutral.light = #F1F5F9
color.neutral.text = #334155--
## 8. Surface Colors
color.background = #F8FAFC
color.surface = #FFFFFF
color.surface.raised = #FFFFFF
color.surface.muted = #F1F5F9
color.surface.hover = #F8FAFC
The application should primarily use white cards, a light neutral page background, and subtle borders.--
## 9. Text Colors
color.text.primary = #0F172A
color.text.secondary = #475569
color.text.muted = #64748B
color.text.disabled = #94A3B8
color.text.inverse = #FFFFFF
Primary text must have strong contrast.--
## 10. Border Colors
color.border = #E2E8F0
color.border.strong = #CBD5E1
color.border.focus = #2563EB
Use borders to establish hierarchy instead of heavy shadows.--
## 11. Typography
Primary font:
Inter,
ui-sans-serif,
system-ui,-apple-system,
BlinkMacSystemFont,
"Segoe UI",
sans-serif
Typography scale:
Page 2
font.size.xs = 12px
font.size.sm = 14px
font.size.md = 16px
font.size.lg = 18px
font.size.xl = 20px
font.size.2xl = 24px
font.size.3xl = 30px
font.size.4xl = 36px
Weights:
400 = Regular
500 = Medium
600 = Semibold
700 = Bold--
## 12. Typography Hierarchy
Page title: 28–36px, 600–700
Section title: 20–24px, 600
Card title: 16–18px, 600
Body: 14–16px, 400
Supporting text: 12–14px, 400
Metadata: 12px, 400–500--
## 13. Spacing
space.1 = 4px
space.2 = 8px
space.3 = 12px
space.4 = 16px
space.5 = 20px
space.6 = 24px
space.7 = 32px
space.8 = 40px
space.9 = 48px
space.10 = 64px
Do not introduce arbitrary spacing values.--
## 14. Border Radius
radius.sm = 6px
radius.md = 8px
radius.lg = 12px
radius.xl = 16px
radius.full = 9999px
Recommended:- Inputs: sm/md- Cards: md/lg- Modals: lg/xl- Badges: full- Buttons: md--
## 15. Shadows
Use subtle elevation:
shadow.sm
shadow.md
shadow.lg
Preferred visual hierarchy:
1. Border
2. Background difference
3. Subtle shadow
Avoid heavy shadows.--
## 16. Layout
Desktop application layout:
Sidebar + Header + Main Content
Recommended sidebar width:
240px–280px
Collapsed sidebar:
64px–80px
Main content should have a maximum readable width where appropriate. Dashboard layouts may use full available width.--
## 17. Header
The global header may contain:- SentiTicket branding- Breadcrumb- Page title- Search
Page 3
- Notifications- Organization context- User avatar- User menu
The header must remain visually lightweight.--
## 18. Sidebar
Customer:
Dashboard
My Tickets
Create Ticket
Notifications
Profile
Agent:
Dashboard
My Tickets
Queue
SLA Risk
Notifications
Profile
Manager:
Dashboard
All Tickets
SLA Monitor
Team
Analytics
Escalations
Notifications
Admin:
Dashboard
Users
Organizations
Tickets
SLA Policies
Security
Audit Logs
System Settings
Navigation items should have:- Icon- Label- Active state- Hover state- Focus state--
## 19. Navigation Active State
Active navigation should use:- Primary color- Subtle background- Strong text- Accessible indicator
Do not rely only on color.--
## 20. Dashboard Philosophy
Dashboards must prioritize action.
The first screen should immediately show:
What is happening?
What is at risk?
What needs action?
Avoid dashboards filled with charts that do not support decisions.--
## 21. Customer Dashboard
Primary metrics:
Open Tickets
Pending Tickets
Recently Updated
Resolved Tickets
Tickets Near SLA
Primary actions:
Create Ticket
View Tickets
Ticket preview should include:
Ticket ID
Title
Status
Priority
Page 4
Last Updated
SLA information where appropriate--
## 22. Agent Dashboard
Primary metrics:
Open Tickets
High Priority
At Risk
Critical
Breached
Average Resolution Time
Recommended sections:
My Priority Tickets
SLA Risk
Recently Updated
My Workload--
## 23. Manager Dashboard
Primary metrics:
Total Open Tickets
At-Risk Tickets
Critical Tickets
Breached Tickets
SLA Compliance
Average Resolution Time
Team Workload
Recommended charts:
Ticket Status
Priority Distribution
SLA Risk
Agent Workload
Resolution Trends--
## 24. Admin Dashboard
Admin dashboard may include:
Users
Organizations
Tickets
SLA Policies
Security Events
Audit Activity
System Health
Admin dashboards may have higher information density.--
## 25. Metric Cards
Metric cards should contain:
Label
Primary Value
Supporting Information
Optional Trend
Optional Action
Avoid decorative metric cards without useful information.--
## 26. Ticket Creation
Required fields:
Title
Description
Category
Priority
Attachments
The UI must not allow users to control protected backend fields such as:
organizationId
customerId
assignment
slaDeadline
slaState--
## 27. Ticket Creation Layout
Use a clean form with:
Title
Category
Priority
Description
Attachments
Cancel
Create Ticket
Page 5
--
## 28. Ticket Details
Ticket details is the main support workspace.
Recommended structure:
Ticket Header
SLA / Priority / Assignment
Description
Comments
Activity Timeline
Attachments
Side panel may contain:
SLA
Priority
Status
Assignee
Category
Prediction--
## 29. Ticket Header
Display:
Ticket ID
Ticket title
Status
Priority
SLA state
Assignee
Important information must be immediately visible.--
## 30. Ticket Status
Supported statuses:
NEW
OPEN
IN_PROGRESS
PENDING
RESOLVED
CLOSED
Use consistent status badges.--
## 31. Ticket Priority
Supported priorities:
LOW
MEDIUM
HIGH
CRITICAL
Visual hierarchy:
LOW -> neutral
MEDIUM -> informational
HIGH -> warning
CRITICAL -> danger
Never communicate priority through color alone.--
## 32. SLA Component
SLA is a primary SentiTicket feature.
Display:
SLA REMAINING
01h 42m 18s
AT RISK
States:
SAFE
AT RISK
CRITICAL
BREACHED
PAUSED--
## 33. SLA Visual Hierarchy
SAFE:
3 SAFE
01h 42m remaining
AT RISK:
n AT RISK
42m remaining
CRITICAL:
! CRITICAL
12m remaining
Page 6
BREACHED:
5 SLA BREACHED
Breached 18m ago
PAUSED:
n SLA PAUSED
Use icons + text + color.--
## 34. SLA Countdown Behavior
Countdown should update visually in real time.
The countdown must be based on authoritative server data.
The frontend must not determine the actual SLA breach.--
## 35. SLA Prediction
Prediction must be visually separated from actual SLA state.
Example:
SLA STATUS
01h 42m remaining
AI BREACH RISK
87%
HIGH RISK
Prediction is an estimate. SLA state is authoritative.--
## 36. Prediction Explanation
When available:- High priority- Agent workload is high- Historical resolution time is high- Ticket has been open for 7h- Similar tickets frequently exceed SLA
Keep explanations understandable.--
## 37. Prediction Disclaimer
Use wording such as:
Predicted breach risk based on historical patterns.
Do not imply certainty.--
## 38. Ticket Timeline
Show chronological events.
Use visual distinction between:- User activity- Agent activity- System events- SLA events--
## 39. Comments
Comment types:
Customer Comment
Agent Comment
Internal Comment
System Event
Internal comments must have strong visual separation.--
## 40. Ticket Table
Recommended desktop columns:
Ticket
Title
Priority
Status
Assignee
SLA
Risk
Updated
Provide:- Pagination- Sorting- Filtering- Search- Row hover- Row focus where applicable--
Page 7
## 41. Ticket Table Density
The table should support enterprise-level ticket volumes while remaining readable.--
## 42. Ticket Filters
Recommended:
Status
Priority
SLA Risk
Assignee
Category
Date
Provide:
Clear Filters--
## 43. Ticket Search
Search should support:
Ticket ID
Title
Category
Status
Priority
Search results must respect backend authorization.--
## 44. Mobile Ticket UI
Do not simply compress desktop tables.
Use responsive cards.
Critical information must remain visible.--
## 45. Forms
Forms must use:- Clear labels- Logical grouping- Helpful validation- Inline errors- Accessible descriptions- Clear submit actions
Do not use placeholder text as the only label.--
## 46. Input States
Inputs must support:
Default
Hover
Focus
Filled
Disabled
Error
Success where appropriate
Focus must be clearly visible.--
## 47. Buttons
Variants:
Primary
Secondary
Tertiary
Ghost
Danger
Icon
States:
Default
Hover
Focus
Active
Disabled
Loading
Primary action should be visually obvious.--
## 48. Destructive Actions
Delete User
Delete Ticket
Delete Attachment
Remove Organization
must require appropriate confirmation.--
Page 8
## 49. Modals
Use modals for:- Destructive actions- Important confirmations- Focused workflows- Role changes- SLA policy changes
Avoid using modals for simple information.--
## 50. Toasts
Use toasts for:
Ticket created
Comment added
Assignment updated
Attachment uploaded
Settings saved
Important information must not exist only inside a toast.--
## 51. Notifications
Notification types:
Ticket assigned
Ticket updated
SLA approaching
SLA critical
SLA breached
Ticket escalated
New comment
Prediction risk increased
Notifications should contain:
Icon
Title
Short description
Timestamp
Read/unread state--
## 52. Agent Workload
Authorized users may see:
Agent
Open Tickets
At Risk
Critical
Capacity
Do not expose workload information to unauthorized users.--
## 53. SLA Monitor
Manager SLA Monitor should prioritize:
CRITICAL
AT RISK
BREACHED
SAFE
Recommended table:
Ticket
Priority
Agent
SLA Remaining
Risk
Status--
## 54. Analytics
Possible charts:
Ticket Volume
SLA Compliance
Resolution Time
Priority Distribution
SLA Breaches
Agent Workload
Prediction Accuracy
Charts must have:- Labels- Accessible descriptions- Loading state- Empty state- Error state- Responsive behavior--
Page 9
## 55. Security Dashboard
Admin-only security interface may contain:
Failed Logins
Authorization Failures
Suspicious Activity
Security Events
Admin Actions
File Security Events--
## 56. Audit Logs
Audit log table:
Timestamp
Actor
Event
Resource
Result
Organization
Support:- Search- Filtering- Sorting- Pagination
Never display secrets.--
## 57. Authentication UI
Required pages:
Login
Register
Forgot Password
Reset Password
Email Verification
MFA
Optional:
Sessions
Security Settings--
## 58. Login
Login form:
Email
Password
Login
Forgot password?
Create account
Authentication errors must not reveal unnecessary account information.--
## 59. MFA
MFA screen:
Verify your identity
Enter the 6-digit verification code.
Verify
Provide alternate methods where applicable.--
## 60. Profile
Profile page may contain:
Name
Email
Organization
Role
Profile information
Security
Sessions
Sensitive authentication data must not be exposed.--
## 61. User Management
Admin user table:
Name
Email
Role
Organization
Status
Last Activity
Actions
Never show:
Password
Password Hash
MFA Secret
Page 10
Access Token
Refresh Token
API Key--
## 62. SLA Policy UI
Authorized managers/admins may manage:
Priority
Response Target
Resolution Target
Business Hours
Escalation
Status
Changes should show previous and new values.--
## 63. Responsive Breakpoints
Mobile:
< 640px
Tablet:
640px–1023px
Desktop:
1024px–1279px
Large Desktop:
1280px+
Do not depend exclusively on exact device widths.--
## 64. Mobile Rules
On mobile:- Sidebar becomes a drawer or bottom navigation.- Multi-column dashboards become single-column.- Tables become cards or scrollable data regions.- Forms become single-column.- Important SLA information remains visible.- Primary actions remain accessible.--
## 65. Accessibility
Target:
WCAG 2.2 AA
Requirements:- Keyboard navigation- Visible focus- Semantic HTML- Accessible labels- Screen-reader support- Accessible dialogs- Accessible tables- Accessible forms- Sufficient contrast- Reduced motion--
## 66. Keyboard Interaction
Support:
Tab
Shift + Tab
Enter
Space
Escape
Arrow Keys where appropriate
Do not create essential mouse-only interactions.--
## 67. Focus
All interactive elements must have a visible focus state.
Recommended:
outline: 2px solid primary;
outline-offset: 2px;
Do not remove focus indicators.--
## 68. Color Accessibility
Color must not be the only indicator of:
Status
Priority
SLA Risk
Error
Success
Page 11
Use:
Color + Text + Icon where appropriate--
## 69. Reduced Motion
Respect:
prefers-reduced-motion
When enabled:- Reduce transitions.- Disable unnecessary animations.- Avoid large movement.- Keep functional state changes clear.--
## 70. Motion
Motion should communicate:- State change- Navigation- Feedback- Loading- Focus- Modal transitions
Avoid:- Constant animation- Excessive bouncing- Long transitions- Parallax- Animation on every click
Recommended:
Instant: 100–150ms
Fast: 150–200ms
Normal: 200–300ms
Slow: 300–500ms--
## 71. Loading States
Every major page must define loading behavior.
Use:- Skeletons- Spinners- Button loading states
Do not display blank screens while waiting for data.--
## 72. Empty States
Example:
No tickets yet
You don't have any support tickets.
Create Ticket
Empty states should explain:
1. What happened
2. Why the page is empty
3. What the user can do--
## 73. Error States
Example:
Unable to load tickets.
Please check your connection and try again.
Retry
Never display:- Stack traces- Database errors- Internal paths- Credentials- Internal service details--
## 74. Success States
Use concise feedback:
Ticket created successfully.
Comment added.
Assignment updated.
Settings saved.
Attachment uploaded.--
## 75. Long Content
Support:
Page 12
- Long ticket titles- Long descriptions- Long comments- Long filenames- Long usernames- Long organization names
Use:- Wrapping- Truncation- Expand/collapse- Tooltips where appropriate--
## 76. Overflow
Large data should be contained.
Use:- Responsive layout- Scrollable tables- Text wrapping- Truncation- Expandable sections
Avoid accidental global horizontal scrolling.--
## 77. Dark Mode
The design system should support dark mode.
Use semantic tokens rather than hard-coded colors.
Dark mode must preserve:- Contrast- Status meaning- SLA hierarchy- Accessibility--
## 78. Component Library
Create reusable components:
Button
Input
Select
Textarea
Checkbox
Radio
Switch
Badge
Avatar
Card
Modal
Dialog
Dropdown
Tooltip
Toast
Tabs
Table
Pagination
Breadcrumb
Skeleton
Spinner
Alert
EmptyState
ErrorState
StatusBadge
PriorityBadge
SLACountdown
RiskIndicator
TicketCard
TicketTable
TicketTimeline
PredictionCard--
## 79. Component State Rules
Each interactive component should support appropriate:
Default
Hover
Focus-visible
Active
Disabled
Loading
Error
Selected--
Page 13
## 80. Component Architecture
Use:
Design Tokens
fl
UI Primitives
fl
Composite Components
fl
Feature Components
fl
Page Components
fl
Role Dashboards--
## 81. Frontend Security Boundary
The frontend is NOT the security authority.
Never trust:
Client-side roles
Client-side permissions
Client-side organization IDs
Client-side ticket ownership
Client-side SLA values
Client-side assignment
Backend authorization is always authoritative.--
## 82. Sensitive Information
Never expose:
Password hashes
API keys
Database credentials
MFA secrets
Private keys
Internal service credentials
Do not unnecessarily send sensitive data to the browser.--
## 83. Browser Storage
Avoid unnecessary sensitive data in:
localStorage
sessionStorage
Authentication architecture should minimize exposure of long-lived credentials to JavaScript.--
## 84. URL Security
Never place:
Passwords
API keys
Access tokens
Refresh tokens
Secrets
in URLs.--
## 85. File Upload UI
Display:
Filename
File type
File size
Upload progress
Scan status
Download
Delete where authorized
Possible states:
Selecting
Uploading
Scanning
Approved
Rejected
Failed--
## 86. Real-Time UI
If implemented, real-time updates may include:
Ticket assignment
Comments
SLA state
Escalations
Notifications
Prediction risk
Page 14
Clearly distinguish real-time updates from stale cached data.--
## 87. Real-Time Accessibility
Do not announce every countdown second to screen readers.
Announce important changes such as:
SLA status changed to Critical.
Ticket has been assigned.
Ticket SLA has been breached.--
## 88. API UX
Every API request should support:
Loading
Success
Empty
Error
Retry
Do not allow duplicate submissions.--
## 89. Optimistic Updates
Optimistic updates may be used for low-risk interactions.
For security-sensitive actions, wait for server confirmation.
Examples:
Role changes
Permission changes
SLA policy changes
Assignment changes
Administrative changes--
## 90. Design Tool Integration
If Stitch, Motion Sites or another design tool is used:
1. Use generated designs as visual references.
2. Extract reusable design tokens.
3. Convert designs into reusable React components.
4. Preserve accessibility.
5. Preserve responsive behavior.
6. Preserve SentiTicket information hierarchy.
7. Do not blindly copy generated HTML.
8. Do not copy another company's branding.
9. Do not allow generated UI to override security requirements.
The result must remain an original SentiTicket interface.--
## 91. Design.md and SKILL.md Relationship
This file defines:
WHAT SentiTicket should look and feel like.
The frontend skill defines:
HOW the frontend should be implemented.
Both must be followed.
When there is a conflict:
1. Security requirements take priority.
2. Accessibility requirements take priority.
3. Functional requirements take priority.
4. This design system controls visual consistency.
5. The frontend skill controls implementation practices.--
## 92. Frontend Structure
Recommended:
frontend/
nnn src/
n   nnn components/
n   n   nnn ui/
n   n   nnn layout/
n   n   nnn tickets/
n   n   nnn sla/
n   n   nnn prediction/
n   n   nnn dashboards/
n   n   nnn forms/
n   n   nnn feedback/
n   nnn pages/
n   n   nnn auth/
n   n   nnn customer/
n   n   nnn agent/
n   n   nnn manager/
n   n   nnn admin/
Page 15
n   nnn hooks/
n   nnn services/
n   nnn routes/
n   nnn state/
n   nnn styles/
n   nnn utils/
nnn package.json
Adapt as required by the actual implementation.--
## 93. Route Structure
Authentication:
/login
/register
/forgot-password
/reset-password
/verify-email
/mfa
Customer:
/customer/dashboard
/customer/tickets
/customer/tickets/new
/customer/tickets/:id
/customer/profile
/customer/notifications
Agent:
/agent/dashboard
/agent/tickets
/agent/tickets/:id
/agent/queue
/agent/sla-risk
/agent/profile
/agent/notifications
Manager:
/manager/dashboard
/manager/tickets
/manager/sla
/manager/team
/manager/analytics
/manager/escalations
Admin:
/admin/dashboard
/admin/users
/admin/organizations
/admin/tickets
/admin/sla-policies
/admin/security
/admin/audit-logs
/admin/settings--
## 94. Search Privacy
Search must not expose unauthorized resources.
A user must not discover the existence of an unauthorized ticket simply by searching for its ID.--
## 95. Images
Images must:- Have appropriate alt text.- Be optimized.- Be responsive.- Avoid layout shifts.
Decorative images should have empty alt text.--
## 96. Icons
Icons must supplement text.
Icon-only controls must have accessible names.--
## 97. Table Accessibility
Use semantic tables where appropriate.
Provide:- Header cells- Row relationships- Sort indicators- Accessible labels
Complex data tables must remain keyboard accessible.--
Page 16
## 98. Dialog Accessibility
Dialogs must:- Have an accessible name.- Manage focus.- Restore focus when closed.- Support Escape where appropriate.- Prevent unintended background interaction.--
## 99. Content Tone
Use concise action-oriented labels.
Prefer:
Create Ticket
Assign Ticket
Resolve Ticket
Escalate Ticket
View Details
Save Changes
Retry
Cancel
Avoid vague labels such as:
Click Here
Do It
Proceed
Thing
when a descriptive label is possible.--
## 100. Final Design Principle
SentiTicket must feel like a serious enterprise support platform.
The interface must make the following hierarchy obvious:
CRITICAL
fl
AT RISK
fl
SLA COUNTDOWN
fl
PREDICTED BREACH RISK
fl
REQUIRED ACTION
The final product should be:
Professional
Accessible
Responsive
Consistent
Secure
Fast
Action-oriented
Maintainable
Intelligent
The visual design must support the core purpose of SentiTicket:
> Identify which support tickets need attention before their SLA is breached
